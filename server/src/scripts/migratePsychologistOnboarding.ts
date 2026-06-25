import mongoose from "mongoose";
import { connectDB } from "@/config/db";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";

async function migrate() {
  await connectDB();

  await PsychologistModel.updateMany(
    { onboardingStatus: { $exists: false }, verificationStatus: "approved" },
    { $set: { onboardingStatus: "approved" } },
  );
  await PsychologistModel.updateMany(
    { onboardingStatus: { $exists: false }, verificationStatus: "rejected" },
    { $set: { onboardingStatus: "rejected" } },
  );
  await PsychologistModel.updateMany(
    { onboardingStatus: { $exists: false }, verificationStatus: "pending" },
    { $set: { onboardingStatus: "profile_incomplete", isOnline: false } },
  );

  await mongoose.disconnect();
}

void migrate().catch(async (error) => {
  console.error("Psychologist onboarding migration failed", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
