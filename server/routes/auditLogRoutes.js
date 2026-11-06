import express from "express";
import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";
import { logAudit, extractClientIp } from "../utils/auditLogger.js";

const router = express.Router();

/**
 * GET /api/audit-logs
 * Fetch audit logs with filtering, searching, and pagination
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      municipality = "",
      action = "",
      module = "",
      status = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const query = {};

    // Filter by municipality if specified and not 'All'
    if (municipality && municipality !== "All" && municipality !== "All Municipalities") {
      query.municipality = { $regex: new RegExp(`^${municipality.trim()}$`, "i") };
    }

    // Filter by action if specified and not 'All'
    if (action && action !== "All") {
      query.action = action;
    }

    // Filter by module if specified and not 'All'
    if (module && module !== "All") {
      query.module = module;
    }

    // Filter by status if specified and not 'All'
    if (status && status !== "All") {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    // Text search across userName, userEmail, details, action
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { userName: regex },
        { userEmail: regex },
        { details: regex },
        { action: regex },
        { municipality: regex },
        { establishmentName: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Summary counters for quick KPI cards
    const totalLogins = await AuditLog.countDocuments({ action: "USER_LOGIN" });
    const totalSubmissions = await AuditLog.countDocuments({ action: { $in: ["SUBMIT_FORM", "VISITOR_CHECKIN"] } });
    const totalSecurityAlerts = await AuditLog.countDocuments({ status: { $in: ["Failed", "Warning"] } });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        totalEvents: total,
        totalLogins,
        totalSubmissions,
        totalSecurityAlerts,
      },
    });
  } catch (error) {
    console.error("[AuditLog Route Error]", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
      details: error.message,
    });
  }
});

/**
 * POST /api/audit-logs
 * Client-driven audit log event (e.g. Export Report, User Logout, Offline Re-sync)
 */
router.post("/", async (req, res) => {
  try {
    const { action, module, details, status, metadata, user } = req.body;
    const ipAddress = extractClientIp(req);

    const logged = await logAudit({
      user,
      action: action || "CLIENT_EVENT",
      module: module || "Client",
      details: details || "Client reported an activity",
      status: status || "Success",
      ipAddress,
      metadata,
    });

    res.status(201).json({ success: true, data: logged });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

