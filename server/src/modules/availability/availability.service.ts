import { AvailabilityRuleModel, IAvailabilityRule } from "./availabilityRule.model";
import { AvailabilitySlotModel } from "./availabilitySlot.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { SetRulesRequest, SlotResponse, RulesUpdatedResponse, SlotBlockedResponse } from "./availability.types";
import { generateSlots } from "@/utils/generateSlots";

class AvailabilityService {
  /**
   * Set recurring availability rules for a psychologist
   */
  async setRules(psychologistUserId: string, data: SetRulesRequest): Promise<RulesUpdatedResponse> {
    // Get psychologist profile
    const psychologist = await PsychologistModel.findOne({ userId: psychologistUserId });
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Delete existing rules
    await AvailabilityRuleModel.deleteMany({ psychologistId: psychologist._id });

    // Create new rules
    const rulesToCreate: Partial<IAvailabilityRule>[] = data.rules.map((rule) => ({
      psychologistId: psychologist._id,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slotDurationMinutes: rule.slotDurationMinutes,
      modes: rule.modes,
      isActive: true,
    }));

    await AvailabilityRuleModel.insertMany(rulesToCreate);

    return {
      rulesUpdated: rulesToCreate.length,
    };
  }

  /**
   * Get available slots for a psychologist
   */
  async getSlots(
    psychologistId: string,
    query: { from: string; to: string; mode?: "chat" | "audio" | "video" }
  ): Promise<SlotResponse[]> {
    // Get psychologist and their user (to get timezone)
    const psychologist = await PsychologistModel.findById(psychologistId).populate("userId");
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    const user = psychologist.userId as any;
    if (!user?.timezone) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, ErrorCodes.INTERNAL_ERROR, "Psychologist timezone not set");
    }

    // Validate date range
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);
    const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, "Date range cannot exceed 30 days");
    }

    // Get rules
    const rules = await AvailabilityRuleModel.find({ psychologistId: psychologist._id });

    // Get existing slots
    const filter: any = {
      psychologistId: psychologist._id,
      startTime: { $gte: fromDate, $lte: toDate },
      isBlocked: false,
    };
    if (query.mode) {
      filter.mode = query.mode;
    }

    let slots = await AvailabilitySlotModel.find(filter).sort({ startTime: 1 });

    // If no slots, generate them temporarily for response
    if (slots.length === 0 && rules.length > 0) {
      const generatedSlots = generateSlots(rules, user.timezone, query.from, query.to);
      return generatedSlots.map((slot) => ({
        slotId: "temp_" + Math.random().toString(36).substr(2, 9), // Temporary ID
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        mode: slot.mode,
        isBooked: false,
      }));
    }

    // Convert to response
    return slots.map((slot) => ({
      slotId: slot._id.toString(),
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      mode: slot.mode,
      isBooked: !!slot.isBooked || !!(slot.holdExpiresAt && slot.holdExpiresAt > new Date()),
    }));
  }

  /**
   * Block a slot (psychologist only)
   */
  async blockSlot(
    slotId: string,
    psychologistUserId: string
  ): Promise<SlotBlockedResponse> {
    // Get psychologist profile
    const psychologist = await PsychologistModel.findOne({ userId: psychologistUserId });
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Get slot
    const slot = await AvailabilitySlotModel.findById(slotId);
    if (!slot) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Slot not found");
    }

    // Check if slot belongs to psychologist
    if (slot.psychologistId.toString() !== psychologist._id.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You do not own this slot");
    }

    // Check if slot is already booked
    if (slot.isBooked || (slot.holdExpiresAt && slot.holdExpiresAt > new Date())) {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.SLOT_ALREADY_BOOKED, "Cannot block a booked slot");
    }

    // Block slot
    slot.isBlocked = true;
    await slot.save();

    return {
      slotId: slot._id.toString(),
      isBlocked: true,
    };
  }
}

export const availabilityService = new AvailabilityService();
