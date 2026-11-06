import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { logAudit, extractClientIp } from "../utils/auditLogger.js";

const router = express.Router();

const MUNICIPALITY_METADATA = {
  "Diadi": { district: "North", districtLabel: "NORTH DISTRICT • 9 Sites", badgeColor: "blue", quote: '"Crown Eco-Tourism Capital & Forest Reserve Paradise"', registeredSites: 9, carryingCapacity: "1,500 tourists / day", flagships: ["Lower Magat Eco-Tourism Park (LMETP)", "Lake Forest Trails", "Magat Nature Reserve"] },
  "Solano": { district: "Central", districtLabel: "CENTRAL DISTRICT • 16 Sites", badgeColor: "green", quote: '"Premier Commerce, Convention, and MICE Hospitality Hub"', registeredSites: 16, carryingCapacity: "2,000 tourists / day", flagships: ["Solano Plaza Hotel & Convention Pavilion", "Bintawan Commercial District", "Food Tourism Strip"] },
  "Kasibu": { district: "South", districtLabel: "SOUTH DISTRICT • 11 Sites", badgeColor: "amber", quote: '"Citrus Capital of the Philippines & Subterranean Cave Wonder"', registeredSites: 11, carryingCapacity: "1,200 spelunkers & visitors / day", flagships: ["Capisaan Cave System", "Malabing Valley Citrus Farms", "Edralin Agri-Trek"] },
  "Bayombong": { district: "Central", districtLabel: "CENTRAL DISTRICT • 14 Sites", badgeColor: "green", quote: '"Provincial Heritage, Educational Center & Administrative Capital"', registeredSites: 14, carryingCapacity: "1,800 visitors / day", flagships: ["St. Dominic Cathedral", "Provincial Capitol Complex & Park", "Bantay Lakay Heritage Trails"] },
  "Bagabag": { district: "North", districtLabel: "NORTH DISTRICT • 8 Sites", badgeColor: "blue", quote: '"Pineapple Paradise & Aviation Gateway of Nueva Vizcaya"', registeredSites: 8, carryingCapacity: "1,100 visitors / day", flagships: ["Bagabag Airport Skyway Circuit", "Palaisdaan Gastronomy Strip", "Pineapple Plantation Agro-Trails"] },
  "Santa Fe": { district: "South", districtLabel: "SOUTH DISTRICT • 7 Sites", badgeColor: "amber", quote: '"Southern Gateway, Dalton Pass Sanctuary & Highland Pine Haven"', registeredSites: 7, carryingCapacity: "900 visitors / day", flagships: ["Dalton Pass Historical National Shrine", "Imugan Falls & Forest Trail", "Highland Organic Veggie & Coffee Mart"] },
  "Aritao": { district: "South", districtLabel: "SOUTH DISTRICT • 8 Sites", badgeColor: "amber", quote: '"Agricultural Gateway & Scenic Mountain Vista Junction"', registeredSites: 8, carryingCapacity: "950 visitors / day", flagships: ["Kirang Pass Historical Shrine", "Sta. Clara Onion & Agri Hub", "Banga-Banga Mountain Overlook"] },
  "Bambang": { district: "South", districtLabel: "SOUTH DISTRICT • 10 Sites", badgeColor: "amber", quote: '"Provincial Agri-Trading Center & Salt Springs Heritage"', registeredSites: 10, carryingCapacity: "1,200 visitors / day", flagships: ["NV Agricultural Trading Center (NVAT)", "Salinas Natural Salt Springs", "Man-made Forest Agri-Park"] },
  "Dupax del Norte": { district: "South", districtLabel: "SOUTH DISTRICT • 6 Sites", badgeColor: "amber", quote: '"Cultural Heartland of the Isinay Indigenous Heritage"', registeredSites: 6, carryingCapacity: "700 visitors / day", flagships: ["Isinay Heritage Preservation Center", "Belance Vegetable Farm Terraces", "Oyao River Nature Campsite"] },
  "Quezon": { district: "North", districtLabel: "NORTH DISTRICT • 7 Sites", badgeColor: "blue", quote: '"Mountain Ridge Mineral Sanctuary & Highland Agro-Forest Trails"', registeredSites: 7, carryingCapacity: "650 visitors / day", flagships: ["Runruno Highland Vista & Eco-Trails", "Bintawan Waterfalls & River Camp", "Mount Palali Trek Gateway"] },
  "Kayapa": { district: "South", districtLabel: "SOUTH DISTRICT • 8 Sites", badgeColor: "amber", quote: '"Highland Cool Breeze, Fruit Basket & Trekker Alpine Gateway"', registeredSites: 8, carryingCapacity: "800 mountaineers & visitors / day", flagships: ["Mt. Ugo Gateway Alpine Trail", "Pingkian Highland Agro-Farm", "Kayapa Terraced Vegetable Valley"] },
  "Dupax del Sur": { district: "South", districtLabel: "SOUTH DISTRICT • 7 Sites", badgeColor: "amber", quote: '"Spanish Colonial Heritage & National Cultural Treasures Sanctuary"', registeredSites: 7, carryingCapacity: "750 visitors / day", flagships: ["St. Vincent Ferrer Parish Church (1776)", "Historic Dampol Brick Bridge", "Carolotan Nature Rock Formations"] },
  "Villaverde": { district: "North", districtLabel: "NORTH DISTRICT • 6 Sites", badgeColor: "blue", quote: '"Panoramic Ridge Overlook & Native Cultural Heritage Haven"', registeredSites: 6, carryingCapacity: "600 visitors / day", flagships: ["Bintawan Sur Ridge Overlook", "Mt. Nagbucayan Hiking Summit", "Ibaloi Cultural Heritage Village"] },
  "Alfonso Castañeda": { district: "South", districtLabel: "SOUTH DISTRICT • 6 Sites", badgeColor: "amber", quote: '"Lush Tropical Wilderness & Hydro-Watershed Ecotourism Basin"', registeredSites: 6, carryingCapacity: "500 visitors / day", flagships: ["Canili & Diayo Reservoir Eco-Dams", "Pelaway Waterfalls Cascade", "Casecnan Watershed Protected Forest"] },
  "Ambaguio": { district: "Central", districtLabel: "CENTRAL DISTRICT • 5 Sites", badgeColor: "green", quote: '"Skyline Mountaineering, Organic Highland Coffee & Cloud Sanctuary"', registeredSites: 5, carryingCapacity: "450 trekkers / day", flagships: ["Mt. Pulag Ambaguio Trailhead", "Bayninan Traditional Rice Terraces", "Ambaguio Highland Arabica Coffee Farms"] }
};

// POST /api/auth/register-municipal - Register a new municipal tourism office account
router.post("/register-municipal", async (req, res) => {
  try {
    const { municipality, officeName, email, password } = req.body;

    if (!municipality || !municipality.trim()) {
      return res.status(400).json({ error: "Please select a municipality." });
    }
    const cleanMunicipality = municipality.trim();
    const cleanOfficeName =
      (officeName && officeName.trim()) || `${cleanMunicipality} Municipal Tourism Office`;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = mongoose.connection.db;

    // Check if user already exists
    const existingUser = db ? await db.collection("users").findOne({ email: cleanEmail }) : null;
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const newUser = {
      establishmentName: cleanOfficeName,
      officeName: cleanOfficeName,
      name: cleanOfficeName,
      municipality: cleanMunicipality,
      establishmentType: "Municipal Tourism Office",
      email: cleanEmail,
      password: hashedPassword,
      role: "Municipality Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let userId = new mongoose.Types.ObjectId();
    if (db) {
      const userResult = await db.collection("users").insertOne(newUser);
      userId = userResult.insertedId;
    }

    // Auto-centralize into LGUs collection
    const matchedKey = Object.keys(MUNICIPALITY_METADATA).find(
      (k) => k.toLowerCase() === cleanMunicipality.toLowerCase()
    );
    const meta = (matchedKey && MUNICIPALITY_METADATA[matchedKey]) || {
      district: "Central",
      districtLabel: "CENTRAL DISTRICT • 5 Sites",
      badgeColor: "green",
      quote: `"${cleanMunicipality} Tourism & Cultural Heritage"`,
      registeredSites: 5,
      carryingCapacity: "500 visitors / day",
      flagships: [`${cleanMunicipality} Tourism Circuit`],
    };

    const lguCount = db ? await db.collection("lgus").countDocuments() : 0;
    const lguDoc = {
      id: lguCount + 1,
      name: cleanMunicipality,
      district: meta.district,
      districtLabel: meta.districtLabel,
      badgeColor: meta.badgeColor,
      quote: meta.quote,
      totalVisitors: 0,
      foreignMice: 0,
      capacityLoad: 0,
      status: "Optimal",
      statusType: "optimal",
      officer: cleanOfficeName,
      officerRole: "Municipal Tourism Officer",
      flagships: meta.flagships,
      intel: {
        registeredSites: meta.registeredSites,
        carryingCapacity: meta.carryingCapacity,
        currentHeadcount: "0",
        complianceRating: "100%",
        contactPhone: "+63 (078) Tourism Office",
        contactEmail: cleanEmail,
      },
      updatedAt: new Date(),
    };

    if (db) {
      await db.collection("lgus").updateOne(
        { name: { $regex: new RegExp(`^${cleanMunicipality}$`, "i") } },
        { $set: lguDoc, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
    }

    console.log(`✅ Centralized: Registered new municipal tourism office for "${cleanMunicipality}" (${cleanEmail}) into Municipalities`);

    await logAudit({
      user: { _id: userId, email: cleanEmail, name: cleanOfficeName, role: "Municipality Admin", municipality: cleanMunicipality },
      action: "REGISTER_MUNICIPAL",
      module: "Authentication",
      details: `Registered new Municipal Tourism Office account for ${cleanMunicipality}`,
      status: "Success",
      ipAddress: extractClientIp(req),
      metadata: { municipality: cleanMunicipality, officeName: cleanOfficeName },
    });

    return res.status(201).json({
      success: true,
      message: `${cleanOfficeName} successfully registered!`,
      token: `token-${Date.now()}-${userId}`,
      user: {
        _id: userId,
        id: userId,
        name: cleanOfficeName,
        officeName: cleanOfficeName,
        municipality: cleanMunicipality,
        email: cleanEmail,
        role: "Municipality Admin",
      },
    });
  } catch (error) {
    console.error("Municipal registration error:", error);
    return res.status(500).json({ error: error.message || "Server error during registration." });
  }
});

// POST /api/auth/register (Establishment Registration)
router.post("/register", async (req, res) => {
  try {
    const { establishmentName, establishmentType, municipality, email, password } = req.body;

    if (!establishmentName || !establishmentType || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters, including a letter and a number.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMunicipality = (municipality && municipality.trim()) || "Bayombong";
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const db = mongoose.connection.db;

    if (db) {
      const existing = await db.collection("users").findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      await db.collection("users").insertOne({
        name: establishmentName,
        establishmentName,
        establishmentType,
        municipality: cleanMunicipality,
        email: cleanEmail,
        password: hashedPassword,
        role: "establishment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Centralize into establishments collection
      const matchedDistrict = MUNICIPALITY_METADATA[cleanMunicipality]?.district || "Central";
      const matchedLabel = MUNICIPALITY_METADATA[cleanMunicipality]?.districtLabel || `${matchedDistrict.toUpperCase()} DISTRICT`;
      const estCount = await db.collection("establishments").countDocuments();

      await db.collection("establishments").insertOne({
        id: estCount + 1,
        name: establishmentName.trim(),
        district: matchedDistrict,
        districtLabel: matchedLabel,
        municipality: cleanMunicipality,
        category: establishmentType,
        establishmentType: establishmentType,
        tagline: `Premier Hospitality & Tourism Facility in ${cleanMunicipality}`,
        totalVisitors: 0,
        foreignMice: 0,
        capacityLoad: 0,
        status: "Optimal",
        statusType: "optimal",
        officer: establishmentName.trim(),
        officerRole: "General Manager",
        flagships: [establishmentName.trim()],
        intel: {
          dotAccreditation: "DOT-RO2-ACCREDITED",
          validity: "Active / Verified",
          dailyCarryingLimit: "150 guests / day",
          currentOccupancy: "0 / 150",
          complianceScore: "100%",
          contactEmail: cleanEmail,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Ensure Municipality (LGU) exists in lgus collection and count is tracked
      const meta = MUNICIPALITY_METADATA[cleanMunicipality] || {
        district: matchedDistrict,
        districtLabel: matchedLabel,
        badgeColor: "green",
        quote: `"${cleanMunicipality} Tourism & Cultural Heritage"`,
        registeredSites: 1,
        carryingCapacity: "500 visitors / day",
        flagships: [`${cleanMunicipality} Tourism Circuit`],
      };

      const lguCount = await db.collection("lgus").countDocuments();
      await db.collection("lgus").updateOne(
        { name: { $regex: new RegExp(`^${cleanMunicipality}$`, "i") } },
        {
          $setOnInsert: {
            id: lguCount + 1,
            name: cleanMunicipality,
            district: meta.district,
            districtLabel: meta.districtLabel,
            badgeColor: meta.badgeColor,
            quote: meta.quote,
            totalVisitors: 0,
            foreignMice: 0,
            capacityLoad: 0,
            status: "Optimal",
            statusType: "optimal",
            officer: `${cleanMunicipality} Municipal Tourism Officer`,
            officerRole: "Municipal Tourism Officer",
            flagships: meta.flagships,
            intel: {
              registeredSites: 1,
              carryingCapacity: meta.carryingCapacity,
              currentHeadcount: "0",
              complianceRating: "100%",
              contactPhone: "+63 (078) Tourism Office",
              contactEmail: cleanEmail,
            },
            createdAt: new Date(),
          },
          $inc: { "intel.registeredSites": 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    }

    await logAudit({
      user: { _id: userId, email: cleanEmail, name: establishmentName, role: "establishment", municipality: cleanMunicipality },
      action: "REGISTER_ESTABLISHMENT",
      module: "Establishments",
      details: `Registered new tourism establishment: ${establishmentName} (${establishmentType}) in ${cleanMunicipality}`,
      status: "Success",
      ipAddress: extractClientIp(req),
      metadata: { establishmentName, establishmentType, municipality: cleanMunicipality },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Switching to sign in...",
      establishment: {
        establishmentName,
        establishmentType,
        municipality: cleanMunicipality,
        email: cleanEmail,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error during registration." });
  }
});

// POST /api/auth/login - Universal Login Endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(503).json({ error: "Database not connected. Please ensure MongoDB is running." });
    }

    const user = await db.collection("users").findOne({ email: cleanEmail });

    if (!user) {
      await logAudit({
        user: { email: cleanEmail },
        action: "USER_LOGIN",
        module: "Authentication",
        details: `Failed sign-in attempt: Account ${cleanEmail} is not registered`,
        status: "Failed",
        ipAddress: extractClientIp(req),
      });
      return res.status(401).json({
        error: "Hindi nakarehistro ang account na ito. Mangyaring mag-register muna bago mag-login.",
      });
    }

    if (user.password && user.password !== hashedPassword && user.password !== password) {
      await logAudit({
        user: { email: cleanEmail, name: user.name || user.officeName || user.establishmentName, role: user.role, municipality: user.municipality },
        action: "USER_LOGIN",
        module: "Authentication",
        details: `Failed sign-in attempt: Incorrect password for account ${cleanEmail}`,
        status: "Failed",
        ipAddress: extractClientIp(req),
      });
      return res.status(401).json({ error: "Maling password. Pakisubukang muli." });
    }

    const role = user.role || "Municipality Admin";
    const name = user.name || user.officeName || user.establishmentName || cleanEmail;
    const municipality = user.municipality || "Bayombong";

    await logAudit({
      user: { _id: user._id, email: cleanEmail, name, role, municipality },
      action: "USER_LOGIN",
      module: "Authentication",
      details: `${name} (${role}) signed in successfully`,
      status: "Success",
      ipAddress: extractClientIp(req),
    });

    return res.json({
      success: true,
      token: `token-${Date.now()}-${user._id}`,
      user: {
        _id: user._id,
        id: user._id,
        name,
        email: cleanEmail,
        role,
        municipality,
        portal: role.includes("Municipal") ? "municipal" : "establishment",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error during login." });
  }
});

export default router;
