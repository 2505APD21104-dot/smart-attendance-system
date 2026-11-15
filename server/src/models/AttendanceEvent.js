import mongoose from "mongoose";

const attendanceEventSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  eventType: { type: String, index: true },
  sessionId: { type: String, index: true },
  recordId: { type: String },
  studentId: { type: String },
  classId: { type: String },
  subjectId: { type: String },
  date: { type: String },
  previousState: { type: String },
  newState: { type: String },
  counts: { type: mongoose.Schema.Types.Mixed },
  reason: { type: String },
  authorId: { type: String },
  totalRecords: { type: Number },
  timestamp: { type: Date, index: true, default: Date.now }
}, { timestamps: true, versionKey: false });

export const AttendanceEvent = mongoose.model("AttendanceEvent", attendanceEventSchema, "attendance_events");