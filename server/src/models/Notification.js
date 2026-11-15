import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  recipientId: { type: String, index: true },
  recipientRole: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, index: true, default: Date.now },
  readAt: { type: Date }
}, { timestamps: true, versionKey: false });

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema, "notifications");