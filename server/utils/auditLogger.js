import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";

/**
 * Safely records an audit log entry in MongoDB
 * Does not throw errors so it never interrupts primary API request flows
 */
export async function logAudit({
  user = {},
  action,
  module = "System",
  details,
  status = "Success",
  ipAddress = "127.0.0.1",
  metadata = {},
}) {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.warn("[AuditLog] Skipped: MongoDB not connected.");
      return null;
    }

    const entry = {
      timestamp: new Date(),
      userId: user?._id || user?.id || null,
      userName: user?.name || user?.officeName || user?.establishmentName || user?.email || "System User",
      userEmail: user?.email || "system@turismotrack.gov.ph",
      role: user?.role || "Provincial Admin",
      municipality: user?.municipality || "Provincial",
      establishmentName: user?.establishmentName || null,
      action: action || "SYSTEM_EVENT",
      module: module || "System",
      details: details || "System event occurred",
      status: status || "Success",
      ipAddress: ipAddress || "127.0.0.1",
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use Mongoose Model if registered, or direct collection fallback
    if (AuditLog) {
      const log = new AuditLog(entry);
      await log.save();
      return log;
    } else {
      const res = await db.collection("auditlogs").insertOne(entry);
      return { _id: res.insertedId, ...entry };
    }
  } catch (err) {
    console.error("[AuditLog Error] Failed to write audit record:", err.message);
    return null;
  }
}

export function extractClientIp(req) {
  if (!req) return "127.0.0.1";
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

