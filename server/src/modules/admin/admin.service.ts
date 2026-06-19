import { PsychologistModel } from "../psychologist/psychologist.model";
import { UserModel } from "../user/user.model";
import { AppointmentModel, IAppointment } from "../appointment/appointment.model";
import { PaymentModel } from "../payment/payment.model";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "../../constants/statusCodes.constant";
import { ErrorCodes } from "../../constants/errorCodes.constant";
import { UpdatePsychologistStatusRequest, ProcessRefundRequest, PsychologistListItem, AppointmentListItem, ReportsSummary } from "./admin.types";

class AdminService {
  async getPsychologists(query: { page: number; limit: number; status?: "pending" | "approved" | "rejected" }) {
    const skip = (query.page - 1) * query.limit;
    const filter: any = query.status ? { verificationStatus: query.status } : {};

    const psychologists = await PsychologistModel.find(filter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit);

    const total = await PsychologistModel.countDocuments(filter);

    const data: PsychologistListItem[] = psychologists.map((psychologist) => {
      const user = (psychologist as any).userId;
      return {
        id: psychologist._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        verificationStatus: psychologist.verificationStatus,
        rating: psychologist.rating,
        createdAt: psychologist.createdAt.toISOString(),
      };
    });

    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async updatePsychologistStatus(
    psychologistId: string,
    data: UpdatePsychologistStatusRequest
  ) {
    const psychologist = await PsychologistModel.findById(psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    psychologist.verificationStatus = data.decision;
    if (data.decision === "rejected" && data.rejectionReason) {
      (psychologist as any).rejectionReason = data.rejectionReason;
    }
    await psychologist.save();

    return { id: psychologistId, verificationStatus: data.decision };
  }

  async getAppointments(query: { page: number; limit: number; status?: IAppointment["status"] }) {
    const skip = (query.page - 1) * query.limit;
    const filter: any = query.status ? { status: query.status } : {};

    const appointments = await AppointmentModel.find(filter)
      .populate("patientId", "name")
      .populate("psychologistId")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(query.limit);

    for (const appt of appointments) {
      await (appt as any).populate("psychologistId.userId", "name");
    }

    const total = await AppointmentModel.countDocuments(filter);

    const data: AppointmentListItem[] = appointments.map((appt) => {
      const apptAny = appt as any;
      return {
        id: appt._id.toString(),
        patient: { id: apptAny.patientId._id.toString(), name: apptAny.patientId.name },
        psychologist: { id: apptAny.psychologistId._id.toString(), name: apptAny.psychologistId.userId.name },
        mode: appt.mode,
        status: appt.status,
        scheduledAt: appt.scheduledAt.toISOString(),
        allocationMode: appt.allocationMode,
        fee: (apptAny.psychologistId as any).consultationFee,
      };
    });

    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async getReportsSummary(): Promise<ReportsSummary> {
    const totalAppointments = await AppointmentModel.countDocuments();
    const completedAppointments = await AppointmentModel.countDocuments({ status: "completed" });
    const totalPsychologists = await PsychologistModel.countDocuments({ verificationStatus: "approved" });
    const totalPatients = await UserModel.countDocuments({ role: "patient" });

    const paidPayments = await PaymentModel.find({ status: "paid" });
    const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalAppointments,
      completedAppointments,
      totalRevenue,
      totalPsychologists,
      totalPatients,
    };
  }

  async processRefund(appointmentId: string, data: ProcessRefundRequest) {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    if (appointment.status === "refunded") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "Appointment already refunded");
    }

    const payment = await PaymentModel.findOne({ appointmentId: appointment._id });
    if (!payment || payment.status !== "paid") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "No paid payment found for this appointment");
    }

    const refundedAmount = data.amount ?? payment.amount;

    // Update appointment status
    appointment.status = "refunded";
    await appointment.save();

    // Update payment record
    // NOTE: Razorpay refund API call is not yet integrated — add razorpayProvider.createRefund() here.
    payment.status = "refunded";
    payment.refundReason = data.reason;
    await payment.save();

    return {
      paymentId: payment._id.toString(),
      status: "refunded" as const,
      refundedAmount,
    };
  }
}

export const adminService = new AdminService();
