/**
 * One-off migration: convert consultationFee.amount from rupees to paise.
 *
 * Historically the onboarding form stored the fee in rupees while display and
 * payment code treated it as paise. The canonical unit is now paise (base fee
 * per 30-min video session).
 *
 * Guard: amounts already >= 50,000 are assumed to be paise already and skipped
 * (₹500+ base fees stored as rupees would be 50,000+ only if > ₹50,000, which
 * is above the plausible range for legacy rupee values).
 *
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/migrate-fee-paise.ts
 */
import mongoose from "mongoose";
import { env } from "@/config/env";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";

const PAISE_GUARD = 50_000;

async function run() {
  await mongoose.connect(env.MONGO_URI);

  const candidates = await PsychologistModel.find({
    "consultationFee.amount": { $gt: 0, $lt: PAISE_GUARD },
  });

  console.log(`Found ${candidates.length} profiles with rupee-scale fees (< ${PAISE_GUARD}).`);

  for (const profile of candidates) {
    const before = profile.consultationFee.amount;
    profile.consultationFee.amount = before * 100;
    await profile.save();
    console.log(`  ${profile._id}: ${before} -> ${profile.consultationFee.amount} paise`);
  }

  console.log("Done.");
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
