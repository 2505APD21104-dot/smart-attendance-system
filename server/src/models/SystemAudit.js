import mongoose from "mongoose";

const systemAuditSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  eventType: { type: String, index: true },
  module: { type: String },
  actorId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, index: true, default: Date.now }
}, { timestamps: true, versionKey: false });

export const SystemAudit = mongoose.model("SystemAudit", systemAuditSchema, "system_audits");