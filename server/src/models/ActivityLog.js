import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, index: true },
  userRole: { type: String },
  action: { type: String, index: true },
  module: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  status: { type: String },
  timestamp: { type: Date, index: true, default: Date.now }
}, { timestamps: true, versionKey: false });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema, "activity_logs");