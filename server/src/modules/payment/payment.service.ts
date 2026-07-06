import crypto from "crypto";
import { PaymentModel } from "./payment.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { AvailabilitySlotModel } from "@/modules/availability/availabilitySlot.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { env } from "@/config/env";
import { razorpayProvider } from "./providers/razorpay.provider";
import { computeSessionFee } from "@/modules/psychologist/psychologist.constants";
import { reminderQueue } from "@/jobs/queues/reminder.queue";
import { DateTime } from "luxon";
import {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "./payment.types";

class PaymentService {
  /**
   * Create Razorpay payment order
   */
  async createPaymentOrder(
    patientUserId: string,
    data: CreatePaymentOrderRequest
  ): Promise<CreatePaymentOrderResponse> {
    // Get appointment
    const appointment = await AppointmentModel.findById(data.appointmentId);
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    // Check if appointment belongs to patient
    if (appointment.patientId.toString() !== patientUserId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You are not authorized to access this appointment");
    }

    // Check if appointment is in pending_payment state
    if (appointment.status !== "pending_payment") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "Appointment is not in pending payment state");
    }

    if (appointment.slotId) {
      const holdUntil = new Date(Date.now() + 10 * 60 * 1000);
      const reservedSlot = await AvailabilitySlotModel.findOneAndUpdate(
        {
          _id: appointment.slotId,
          isBooked: false,
          isBlocked: false,
          $or: [
            { heldByAppointmentId: appointment._id },
            { holdExpiresAt: { $exists: false } },
            { holdExpiresAt: { $lt: new Date() } },
          ],
        },
        {
          $set: {
            holdExpiresAt: holdUntil,
            heldByAppointmentId: appointment._id,
          },
        },
        { new: true },
      );

      if (!reservedSlot) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          ErrorCodes.SLOT_ALREADY_BOOKED,
          "This appointment slot is no longer available. Please choose another time.",
        );
      }
    }

    // Get psychologist to get consultation fee
    const psychologist = await PsychologistModel.findById(appointment.psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Check if payment already exists for this appointment
    const existingPayment = await PaymentModel.findOne({ appointmentId: appointment._id });
    if (existingPayment?.status === "created") {
      // Return existing order if already created
      return {
        razorpayOrderId: existingPayment.providerOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        razorpayKeyId: env.RAZORPAY_KEY_ID,
      };
    }

    // Amount depends on session mode and slot duration, derived from the
    // psychologist's base fee (paise, per 30-min video session).
    let durationMinutes = 30;
    if (appointment.slotId) {
      const slot = await AvailabilitySlotModel.findById(appointment.slotId);
      if (slot?.startTime && slot?.endTime) {
        const minutes = Math.round(
          (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000,
        );
        if (minutes > 0) durationMinutes = minutes;
      }
    }
    const amount = computeSessionFee(
      psychologist.consultationFee.amount,
      appointment.mode,
      durationMinutes,
    );

    // Create Razorpay order (amount in smallest currency unit, e.g., paise for INR)
    const order = await razorpayProvider.createOrder({
      amount,
      currency: psychologist.consultationFee.currency,
      receipt: `appt_${appointment._id.toString()}`,
      notes: {
        appointmentId: appointment._id.toString(),
      },
    });

    // Create payment record
    const payment = await PaymentModel.create({
      appointmentId: appointment._id,
      patientId: patientUserId,
      provider: "razorpay",
      providerOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
    });

    return {
      razorpayOrderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify payment (client-side verification, but webhook is source of truth)
   */
  async verifyPayment(
    patientUserId: string,
    data: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    // Get payment
    const payment = await PaymentModel.findOne({
      providerOrderId: data.razorpayOrderId,
    });
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Payment not found");
    }

    // Check if payment belongs to patient
    if (payment.patientId.toString() !== patientUserId) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You are not authorized to verify this payment");
    }

    if (
      payment.appointmentId.toString() !== data.appointmentId
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.PAYMENT_SIGNATURE_INVALID,
        "Payment does not belong to the supplied appointment",
      );
    }

    if (payment.status === "paid") {
      return {
        appointmentId: payment.appointmentId.toString(),
        status: "confirmed",
        paymentId: payment._id.toString(),
      };
    }

    // Verify signature
    const isValid = razorpayProvider.verifyPayment({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
    });

    if (!isValid) {
      // Update payment status to failed
      payment.status = "failed";
      await payment.save();
      await this.releaseAppointmentHold(payment.appointmentId.toString());
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.PAYMENT_SIGNATURE_INVALID, "Payment signature is invalid");
    }

    const appointment = await AppointmentModel.findById(payment.appointmentId);
    if (!appointment) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Appointment not found",
      );
    }

    if (appointment.status === "cancelled") {
      await this.refundLatePayment(
        payment,
        data.razorpayPaymentId,
        "Appointment was cancelled before payment confirmation",
      );
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.PAYMENT_FAILED,
        "The appointment was cancelled, so this payment has been refunded",
      );
    }

    await this.confirmAppointmentSlot(appointment);

    payment.status = "paid";
    payment.providerPaymentId = data.razorpayPaymentId;
    await payment.save();

    appointment.status = "confirmed";
    appointment.paymentId = payment._id;
    await appointment.save();
    await this.scheduleAppointmentReminders(appointment);

    return {
      appointmentId: payment.appointmentId.toString(),
      status: "confirmed",
      paymentId: payment._id.toString(),
    };
  }

  /**
   * Handle Razorpay webhook
   */
  async handleRazorpayWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature first (uses raw string before parsing)
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.PAYMENT_SIGNATURE_INVALID, "Webhook signature is invalid");
    }

    // Parse the raw body string into an object now that the signature is verified
    let parsed: any;
    try {
      parsed = JSON.parse(payload);
    } catch {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, "Invalid webhook payload");
    }

    // Process webhook events
    const event = parsed.event;
    const paymentEntity = parsed.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (!event || !orderId) {
      // Unknown event shape — acknowledge and ignore
      return;
    }

    // Find payment by order ID
    const payment = await PaymentModel.findOne({ providerOrderId: orderId });
    if (!payment) {
      // Payment not found — log and return 200 (webhook must not fail)
      return;
    }

    switch (event) {
      case "payment.captured": {
        if (payment.status === "paid") break;
        const appointment = await AppointmentModel.findById(payment.appointmentId);
        if (appointment) {
          if (appointment.status === "cancelled") {
            await this.refundLatePayment(
              payment,
              paymentEntity.id,
              "Appointment was cancelled before payment capture",
            );
            break;
          }
          await this.confirmAppointmentSlot(appointment);
          payment.status = "paid";
          payment.providerPaymentId = paymentEntity.id;
          await payment.save();
          appointment.status = "confirmed";
          appointment.paymentId = payment._id;
          await appointment.save();
          await this.scheduleAppointmentReminders(appointment);
        }
        break;
      }
      case "payment.failed": {
        // Payment failed
        payment.status = "failed";
        await payment.save();
        await this.releaseAppointmentHold(payment.appointmentId.toString());
        break;
      }
      // Handle other events as needed (refund, etc.)
    }
  }

  /**
   * Verify Razorpay webhook signature
   */
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET);
    hmac.update(payload);
    const generatedSignature = hmac.digest("hex");
    const generatedBuffer = Buffer.from(generatedSignature);
    const receivedBuffer = Buffer.from(signature || "");
    return (
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    );
  }

  private async confirmAppointmentSlot(appointment: any): Promise<void> {
    if (!appointment.slotId) return;

    const result = await AvailabilitySlotModel.updateOne(
      {
        _id: appointment.slotId,
        $or: [
          { heldByAppointmentId: appointment._id },
          { isBooked: true },
        ],
      },
      {
        $set: { isBooked: true },
        $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 },
      },
    );

    if (result.matchedCount === 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.SLOT_ALREADY_BOOKED,
        "The reserved appointment slot could not be confirmed",
      );
    }
  }

  private async releaseAppointmentHold(appointmentId: string): Promise<void> {
    await AvailabilitySlotModel.updateOne(
      { heldByAppointmentId: appointmentId, isBooked: false },
      { $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 } },
    );
  }

  private async refundLatePayment(
    payment: any,
    providerPaymentId: string,
    reason: string,
  ): Promise<void> {
    const refund = await razorpayProvider.createRefund({
      paymentId: providerPaymentId,
      amount: payment.amount,
      notes: {
        appointmentId: payment.appointmentId.toString(),
        reason,
      },
    });

    payment.status = "refunded";
    payment.providerPaymentId = providerPaymentId;
    payment.refundReason = reason;
    payment.refundedAmount = refund.amount;
    await payment.save();
  }

  /**
   * Schedule appointment reminders (24h, 1h, 10min before)
   */
  private async scheduleAppointmentReminders(appointment: any) {
    const scheduledAt = DateTime.fromJSDate(appointment.scheduledAt);
    const now = DateTime.now();

    const reminderDelays = [
      { delay: 24 * 60 * 60 * 1000, type: "24 hours" },
      { delay: 60 * 60 * 1000, type: "1 hour" },
      { delay: 10 * 60 * 1000, type: "10 minutes" },
    ];

    for (const { delay, type } of reminderDelays) {
      const reminderTime = scheduledAt.minus({ milliseconds: delay });
      if (reminderTime > now) {
        await reminderQueue.add(
          "send-reminder",
          {
            appointmentId: appointment._id.toString(),
            reminderType: type,
          },
          { delay: reminderTime.diff(now).milliseconds }
        );
      }
    }
  }
}

export const paymentService = new PaymentService();
