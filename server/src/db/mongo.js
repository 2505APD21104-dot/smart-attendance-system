import mongoose from "mongoose";

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

let lastError = null;
let lastConnectedAt = null;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "smart_attendance_nosql";

  if (!uri) {
    console.warn("[mongo] MONGODB_URI is missing — skipping Atlas connect.");
    return false;
  }

  mongoose.connection.on("connected", () => {
    lastConnectedAt = new Date();
    lastError = null;
    console.log(`[mongo] connected to ${mongoose.connection.host}/${dbName}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[mongo] disconnected from Atlas");
  });

  mongoose.connection.on("error", (err) => {
    lastError = err.message;
    console.warn("[mongo] connection error:", err.message);
  });

  try {
    await mongoose.connect(uri, { ...CONNECT_OPTIONS, dbName });
    return true;
  } catch (err) {
    lastError = err.message;
    console.warn("[mongo] initial connect failed:", err.message);
    return false;
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export function getMongoStatus() {
  return {
    connected: isMongoConnected(),
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || process.env.MONGODB_DB_NAME || null,
    readyState: mongoose.connection.readyState,
    lastError,
    lastConnectedAt,
  };
}

export async function disconnectMongo() {
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.warn("[mongo] error during disconnect:", err.message);
  }
}