import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import lguRoutes from "./routes/lguRoutes.js";
import establishmentRoutes from "./routes/establishmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TurismoTrack Backend API",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/lgus", lguRoutes);
app.use("/api/establishments", establishmentRoutes);
app.use("/api/auth", authRoutes);

// Users API Endpoint
app.get("/api/users", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const users = db
      ? await db.collection("users").find({}, { projection: { password: 0 } }).toArray().catch(() => [])
      : [];
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visitor Analytics API Endpoint
app.get("/api/reports/visitor-analytics", async (req, res) => {
  try {
    const selectedYear = Number(req.query.year) || new Date().getFullYear();
    const db = mongoose.connection.db;

    const establishments = db ? await db.collection("establishments").find({}).toArray().catch(() => []) : [];
    const checkins = db ? await db.collection("checkins").find({}).toArray().catch(() => []) : [];
    const dae2forms = db ? await db.collection("dae2forms").find({}).toArray().catch(() => []) : [];
    const users = db ? await db.collection("users").find({}).toArray().catch(() => []) : [];

    const munSet = new Set();
    users.forEach((u) => {
      if (u.municipality && typeof u.municipality === "string" && u.municipality.trim()) {
        munSet.add(u.municipality.trim());
      }
    });
    establishments.forEach((e) => {
      if (e.municipality && typeof e.municipality === "string" && e.municipality.trim()) {
        munSet.add(e.municipality.trim());
      }
    });
    const municipalities = Array.from(munSet);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataset = {};

    municipalities.forEach((mun) => {
      dataset[mun] = MONTH_NAMES.map((m) => ({
        month: m,
        label: m,
        domestic: 0,
        overnight: 0,
        foreign: 0,
        total: 0,
      }));
    });

    // 1. Process Check-in filings
    checkins.forEach((c) => {
      const mun = (c.municipality || "").trim();
      if (!dataset[mun]) return;
      const d = new Date(c.arrivalDate || c.createdAt);
      if (d.getFullYear() !== selectedYear) return;
      const mIdx = d.getMonth();
      const count = Number(c.totalVisitors) || ((Number(c.maleCount) || 0) + (Number(c.femaleCount) || 0)) || 1;
      const isForeign = (c.classificationType || c.residenceStatus || "").toLowerCase().includes("foreign");
      const isOvernight = (Number(c.nights) || 0) >= 1 || !!c.isOvernight;

      if (isForeign) dataset[mun][mIdx].foreign += count;
      else dataset[mun][mIdx].domestic += count;
      if (isOvernight) dataset[mun][mIdx].overnight += count;
      dataset[mun][mIdx].total += count;
    });

    // 2. Process Form DAE-2 monthly submissions
    const MONTH_MAP = {
      january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
      april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
      august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
      november: 10, nov: 10, december: 11, dec: 11,
    };
    dae2forms.forEach((f) => {
      const mun = (f.municipality || "").trim();
      if (!dataset[mun]) return;
      const rYear = Number(f.reportingYear) || new Date(f.submittedAt || f.createdAt || Date.now()).getFullYear();
      if (rYear !== selectedYear) return;

      let mIdx = -1;
      if (typeof f.reportingMonth === "string") {
        mIdx = MONTH_MAP[f.reportingMonth.toLowerCase().trim()] ?? -1;
      } else if (typeof f.reportingMonth === "number") {
        mIdx = f.reportingMonth - 1;
      }
      if (mIdx < 0 || mIdx > 11) mIdx = new Date(f.submittedAt || f.createdAt || Date.now()).getMonth();

      const dom = Number(f.domesticArrival) || 0;
      const forr = (Number(f.foreignArrival) || 0) + (Number(f.overseasArrival) || 0);
      const tot = Number(f.totalGuests) || dom + forr;
      const ovn = Number(f.totalGuestNights) || Number(f.roomsOccupied) || tot;

      dataset[mun][mIdx].domestic += dom;
      dataset[mun][mIdx].foreign += forr;
      dataset[mun][mIdx].overnight += ovn;
      dataset[mun][mIdx].total += tot;
    });

    // 3. Process Real Today breakdown from checkins
    const now = new Date();
    const curY = now.getFullYear();
    const curM = String(now.getMonth() + 1).padStart(2, "0");
    const curD = String(now.getDate()).padStart(2, "0");
    const todayDateStr = `${curY}-${curM}-${curD}`;
    const todayDateString = now.toDateString();

    const todayData = {};
    municipalities.forEach((mun) => {
      todayData[mun] = {
        month: "Today",
        label: `Today (${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
        domestic: 0,
        overnight: 0,
        foreign: 0,
        total: 0,
      };
    });
    todayData["All municipalities"] = {
      month: "Today",
      label: `Today (${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
      domestic: 0,
      overnight: 0,
      foreign: 0,
      total: 0,
    };

    checkins.forEach((c) => {
      const mun = (c.municipality || "").trim();
      const arrDate = (c.arrivalDate || "").trim();
      const created = new Date(c.createdAt || Date.now());
      const isToday = arrDate === todayDateStr || created.toDateString() === todayDateString;

      if (isToday) {
        const count = Number(c.totalVisitors) || ((Number(c.maleCount) || 0) + (Number(c.femaleCount) || 0)) || 1;
        const isForeign = (c.classificationType || c.residenceStatus || "").toLowerCase().includes("foreign");
        const isOvernight = (Number(c.nights) || 0) >= 1 || !!c.isOvernight;

        if (todayData[mun]) {
          if (isForeign) todayData[mun].foreign += count;
          else todayData[mun].domestic += count;
          if (isOvernight) todayData[mun].overnight += count;
          todayData[mun].total += count;
        }

        if (isForeign) todayData["All municipalities"].foreign += count;
        else todayData["All municipalities"].domestic += count;
        if (isOvernight) todayData["All municipalities"].overnight += count;
        todayData["All municipalities"].total += count;
      }
    });

    // 4. Compute All municipalities aggregate
    dataset["All municipalities"] = MONTH_NAMES.map((m, idx) => {
      let domestic = 0, overnight = 0, foreign = 0, total = 0;
      municipalities.forEach((mun) => {
        if (dataset[mun] && dataset[mun][idx]) {
          domestic += dataset[mun][idx].domestic;
          overnight += dataset[mun][idx].overnight;
          foreign += dataset[mun][idx].foreign;
          total += dataset[mun][idx].total;
        }
      });
      return { month: m, label: m, domestic, overnight, foreign, total };
    });

    res.json({
      success: true,
      year: selectedYear,
      municipalities,
      data: dataset,
      today: todayData,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server with Graceful Port Collision Handling
function startServer(portToTry) {
  const server = http.createServer(app);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`ℹ️ Port ${portToTry} is already in use by an active TurismoTrack service.`);
      console.log(`🔍 Checking status of active service on http://localhost:${portToTry}...`);

      const req = http.get(`http://localhost:${portToTry}/api/health`, (res) => {
        console.log(`✅ TurismoTrack Backend is already active and healthy on port ${portToTry} (HTTP ${res.statusCode}).`);
        console.log(`🌐 Ready to serve requests at http://localhost:${portToTry}`);
      });

      req.on("error", () => {
        const nextPort = portToTry + 1;
        console.log(`⚠️ Active service on port ${portToTry} did not respond to health check. Trying fallback port ${nextPort}...`);
        startServer(nextPort);
      });
    } else {
      console.error("❌ Fatal server error:", err);
      process.exit(1);
    }
  });

  server.listen(portToTry, () => {
    console.log(`🚀 TurismoTrack API Server running on port ${portToTry} (http://localhost:${portToTry})`);
  });
}

startServer(DEFAULT_PORT);
