import crypto from "crypto";
import { PaymentModel } from "./payment.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { env } from "@/config/env";
import { razorpayProvider } from "./providers/razorpay.provider";
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

    // Get psychologist to get consultation fee
    const psychologist = await PsychologistModel.findById(appointment.psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Check if payment already exists for this appointment
    const existingPayment = await PaymentModel.findOne({ appointmentId: appointment._id });
    if (existingPayment) {
      // Return existing order if already created
      return {
        razorpayOrderId: existingPayment.providerOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        razorpayKeyId: env.RAZORPAY_KEY_ID,
      };
    }

    // Create Razorpay order (amount in smallest currency unit, e.g., paise for INR)
    const order = await razorpayProvider.createOrder({
      amount: psychologist.consultationFee.amount,
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
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.PAYMENT_SIGNATURE_INVALID, "Payment signature is invalid");
    }

    // Update payment and appointment
    payment.status = "paid";
    payment.providerPaymentId = data.razorpayPaymentId;
    await payment.save();

    const appointment = await AppointmentModel.findById(payment.appointmentId);
    if (appointment) {
      appointment.status = "confirmed";
      appointment.paymentId = payment._id;
      await appointment.save();
      await this.scheduleAppointmentReminders(appointment);
    }

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
    // Verify webhook signature first
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.PAYMENT_SIGNATURE_INVALID, "Webhook signature is invalid");
    }

    // Process webhook events
    const event = payload.event;
    const paymentEntity = payload.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    // Find payment by order ID
    const payment = await PaymentModel.findOne({ providerOrderId: orderId });
    if (!payment) {
      // Payment not found— log and return 200 (webhook should not fail)
      return;
    }

    switch (event) {
      case "payment.captured": {
        // Payment successful
        payment.status = "paid";
        payment.providerPaymentId = paymentEntity.id;
        await payment.save();

        // Update appointment to confirmed
        const appointment = await AppointmentModel.findById(payment.appointmentId);
        if (appointment) {
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
    return generatedSignature === signature;
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
