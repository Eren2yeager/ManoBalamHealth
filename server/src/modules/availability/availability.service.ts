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

    // Validate date range — anchor to start-of-day in the psychologist's timezone
    // so "2026-06-19" means 00:00 local, not an ambiguous UTC midnight.
    const { DateTime } = await import("luxon");
    const fromDt = DateTime.fromISO(query.from, { zone: user.timezone }).startOf("day");
    const toDt   = DateTime.fromISO(query.to,   { zone: user.timezone }).endOf("day");

    if (!fromDt.isValid || !toDt.isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, "Invalid date format — use ISO date e.g. 2026-06-19");
    }

    const diffDays = toDt.diff(fromDt, "days").days;
    if (diffDays > 30) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, "Date range cannot exceed 30 days");
    }

    const fromDate = fromDt.toJSDate();
    const toDate   = toDt.toJSDate();

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

    // If no slots exist, materialise them from rules and persist to DB
    if (slots.length === 0 && rules.length > 0) {
      const generatedSlots = generateSlots(rules, user.timezone, fromDt.toISO()!, toDt.toISO()!);
      const docs = generatedSlots.map((slot) => ({
        psychologistId: psychologist._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        mode: slot.mode,
        isBooked: false,
        isBlocked: false,
      }));

      if (docs.length > 0) {
        // insertMany with ordered:false ignores duplicate-key errors from concurrent requests
        await AvailabilitySlotModel.insertMany(docs, { ordered: false }).catch(() => {
          // Silently ignore duplicate key errors — another request already inserted these slots
        });
        // Re-fetch the newly created slots so we return real DB IDs
        slots = await AvailabilitySlotModel.find(filter).sort({ startTime: 1 });
      }
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
