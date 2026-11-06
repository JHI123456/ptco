import express from "express";
import mongoose from "mongoose";
import Establishment from "../models/Establishment.js";
import { logAudit, extractClientIp } from "../utils/auditLogger.js";

const router = express.Router();

// GET /api/establishments - Get all establishments with category, district, search filters
router.get("/", async (req, res) => {
  try {
    const { category, district, search, sort, municipality } = req.query;
    let query = {};

    if (municipality && municipality !== "All" && municipality !== "Province") {
      const cleanMuni = municipality.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&").replace(/ñ/gi, "[nñ]");
      query.municipality = { $regex: new RegExp(`^${cleanMuni}$`, "i") };
    }

    if (district && district !== "All") {
      query.district = district;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { municipality: { $regex: search, $options: "i" } },
        { officer: { $regex: search, $options: "i" } },
        { flagships: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { totalVisitors: -1 };
    if (sort === "Highest Load") sortOption = { capacityLoad: -1 };
    if (sort === "Alphabetical") sortOption = { name: 1 };

    const establishments = await Establishment.find(query).sort(sortOption).lean();
    const db = mongoose.connection.db;

    if (db && establishments.length > 0) {
      const now = new Date();
      const curY = now.getFullYear();
      const curM = String(now.getMonth() + 1).padStart(2, "0");
      const curD = String(now.getDate()).padStart(2, "0");
      const todayStr = `${curY}-${curM}-${curD}`;
      const todayDateString = now.toDateString();

      const yDate = new Date(now);
      yDate.setDate(yDate.getDate() - 1);
      const yCurY = yDate.getFullYear();
      const yCurM = String(yDate.getMonth() + 1).padStart(2, "0");
      const yCurD = String(yDate.getDate()).padStart(2, "0");
      const yStr = `${yCurY}-${yCurM}-${yCurD}`;
      const yDateString = yDate.toDateString();

      const checkins = await db.collection("checkins").find({}).toArray().catch(() => []);
      const submissions = await db.collection("submissions").find({}).toArray().catch(() => []);

      establishments.forEach((est) => {
        const estNameLower = (est.name || "").toLowerCase().trim();
        const estIdStr = String(est._id || est.id || "");

        // 1. Gather all checkins for this establishment
        const estCheckins = checkins.filter((c) => {
          const cName = (c.establishmentName || "").toLowerCase().trim();
          const cId = String(c.establishmentId || "");
          return cName === estNameLower || (cId && cId === estIdStr);
        });

        let todayCount = 0;
        let yesterdayCount = 0;
        let monthCount = 0;
        let totalCount = 0;
        let foreignCount = 0;
        let foreignTodayCount = 0;

        estCheckins.forEach((c) => {
          const count = Number(c.totalVisitors || c.visitors) || ((Number(c.maleCount) || 0) + (Number(c.femaleCount) || 0)) || 1;
          const isForeign = (c.classificationType || c.residenceStatus || "").toLowerCase().includes("foreign") || (c.classificationType || "").toLowerCase().includes("balikbayan");
          const arr = (c.arrivalDate || "").trim();
          const created = new Date(c.createdAt || Date.now());

          totalCount += count;
          if (isForeign) foreignCount += count;

          if (arr === todayStr || created.toDateString() === todayDateString) {
            todayCount += count;
            if (isForeign) foreignTodayCount += count;
          }
          if (arr === yStr || created.toDateString() === yDateString) {
            yesterdayCount += count;
          }
          if (arr.startsWith(`${curY}-${curM}`)) {
            monthCount += count;
          }
        });

        // 2. Look for official form submissions with verified monthly grandTotal
        const estMonthlySubs = submissions.filter((s) => {
          const sName = (s.establishmentName || "").toLowerCase().trim();
          return sName === estNameLower && s.formData?.totals?.grandTotal;
        });

        if (estMonthlySubs.length > 0) {
          const latest = estMonthlySubs[estMonthlySubs.length - 1];
          const formGrandTotal = Number(latest.formData?.totals?.grandTotal);
          if (formGrandTotal && formGrandTotal >= monthCount) {
            monthCount = formGrandTotal;
            totalCount = Math.max(totalCount, formGrandTotal);
          }
          const formForeign = Number(latest.formData?.totals?.frTotal || latest.formData?.totals?.foreignResidenceTotal || 0);
          if (formForeign > foreignCount) foreignCount = formForeign;

          // Check if form has today's day record
          const dayRecords = latest.formData?.dailyRecords;
          if (Array.isArray(dayRecords)) {
            const todayRecord = dayRecords.find((r) => String(r.day).padStart(2, "0") === curD);
            if (todayRecord && (Number(todayRecord.grandTotal) || 0) > 0) {
              todayCount = Number(todayRecord.grandTotal);
            }
            const yRecord = dayRecords.find((r) => String(r.day).padStart(2, "0") === yCurD);
            if (yRecord && (Number(yRecord.grandTotal) || 0) > 0) {
              yesterdayCount = Number(yRecord.grandTotal);
            }
          }
        }

        // Apply reconciled numbers
        if (totalCount > 0 || monthCount > 0 || todayCount > 0) {
          est.visitorsToday = todayCount;
          est.visitorsYesterday = yesterdayCount;
          est.visitorsThisMonth = monthCount;
          est.totalVisitors = totalCount;
          est.foreignMice = foreignCount;
          est.foreignToday = foreignTodayCount;
        } else {
          est.visitorsToday = Number(est.visitorsToday) || 0;
          est.visitorsYesterday = Number(est.visitorsYesterday) || 0;
          est.visitorsThisMonth = Number(est.visitorsThisMonth) || Number(est.totalVisitors) || 0;
          est.totalVisitors = Number(est.totalVisitors) || est.visitorsThisMonth || 0;
        }
      });
    }

    res.json(establishments);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch establishments",
      details: error.message,
    });
  }
});

// GET /api/establishments/:id - Get single establishment
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const est = isNaN(id)
      ? await Establishment.findOne({ name: new RegExp(`^${id}$`, "i") })
      : await Establishment.findOne({ id: Number(id) });

    if (!est) {
      return res.status(404).json({ error: "Establishment not found" });
    }
    res.json(est);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch establishment",
      details: error.message,
    });
  }
});

// POST /api/establishments - Register a new establishment
router.post("/", async (req, res) => {
  try {
    const count = await Establishment.countDocuments();
    const newEst = new Establishment({
      id: req.body.id || count + 1,
      ...req.body,
    });
    const saved = await newEst.save();

    await logAudit({
      user: { name: saved.name, email: saved.email || "establishment@turismotrack.gov.ph", role: "establishment", municipality: saved.municipality },
      action: "REGISTER_ESTABLISHMENT",
      module: "Establishments",
      details: `Registered establishment profile: ${saved.name} in ${saved.municipality}`,
      status: "Success",
      ipAddress: extractClientIp(req),
      metadata: { id: saved.id, name: saved.name, municipality: saved.municipality },
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({
      error: "Failed to create establishment",
      details: error.message,
    });
  }
});

export default router;
