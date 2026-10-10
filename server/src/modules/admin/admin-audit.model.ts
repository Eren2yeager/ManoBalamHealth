import { Schema, model, Types } from "mongoose";

const adminAuditSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  targetUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, enum: ["account_activated", "account_suspended"], required: true },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

adminAuditSchema.index({ targetUserId: 1, createdAt: -1 });

export const AdminAuditModel = model("AdminAudit", adminAuditSchema);
