import { Worker } from "bullmq";
import redis from "@/config/redis";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { AvailabilityRuleModel } from "@/modules/availability/availabilityRule.model";
import { AvailabilitySlotModel } from "@/modules/availability/availabilitySlot.model";
import { UserModel } from "@/modules/user/user.model";
import { generateSlots } from "@/utils/generateSlots";
import { DateTime } from "luxon";
import { logger } from "@/utils/logger";
const slotGenerationWorker = new Worker(
  "slot-generation",
  async () => {
    logger.info("Starting slot generation...");

    // Get all approved psychologists with users to get their timezones
    const psychologists = await PsychologistModel.find({
      verificationStatus: "approved",
    }).populate<{ userId: any }>("userId");

    for (const psychologist of psychologists) {
      const user = await UserModel.findById(psychologist.userId);
      if (!user || !user.timezone) continue; // null check here!

      // Get their availability rules
      const rules = await AvailabilityRuleModel.find({
        psychologistId: psychologist._id,
      });

      if (rules.length === 0) continue;

      // Generate slots for next 30 days
      const now = DateTime.now().setZone(user.timezone).startOf("day");
      const startDate = now.toISO()!;
      const endDate = now.plus({ days: 30 }).toISO()!;

      // Generate slots
      const slots = generateSlots(rules, user.timezone, startDate, endDate);

      // Insert slots into the database (upsert to avoid duplicates)
      for (const slot of slots) {
        await AvailabilitySlotModel.updateOne(
          {
            psychologistId: psychologist._id,
            startTime: slot.startTime,
            mode: slot.mode,
          },
          {
            $setOnInsert: {
              psychologistId: psychologist._id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              mode: slot.mode,
              isBooked: false,
              isBlocked: false,
            },
          },
          { upsert: true }
        );
      }

      logger.info(`Generated ${slots.length} slots for psychologist ${psychologist._id}`);
    }

    logger.info("Slot generation complete!");
  },
  { connection: redis as any }
);

export default slotGenerationWorker;
