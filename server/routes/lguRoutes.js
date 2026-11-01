import express from "express";
import mongoose from "mongoose";
import LGU from "../models/LGU.js";

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

// GET /api/lgus - Get all LGUs with optional district & search filters
router.get("/", async (req, res) => {
  try {
    const { district, search, sort } = req.query;
    const db = mongoose.connection.db;

    // Auto-sync any registered municipal users into LGUs collection
    if (db) {
      try {
        const municipalUsers = await db.collection("users").find({
          $or: [
            { role: { $regex: /Municipality/i } },
            { establishmentType: { $regex: /Municipal/i } },
          ],
        }).toArray();

        for (const u of municipalUsers) {
          const muniName = (u.municipality || "").trim();
          if (!muniName) continue;

          const exists = await db.collection("lgus").findOne({
            name: { $regex: new RegExp(`^${muniName}$`, "i") },
          });

          if (!exists) {
            const matchedKey = Object.keys(MUNICIPALITY_METADATA).find(
              (k) => k.toLowerCase() === muniName.toLowerCase()
            );
            const meta = (matchedKey && MUNICIPALITY_METADATA[matchedKey]) || {
              district: "Central",
              districtLabel: "CENTRAL DISTRICT • 5 Sites",
              badgeColor: "green",
              quote: `"${muniName} Tourism & Cultural Heritage"`,
              registeredSites: 5,
              carryingCapacity: "500 visitors / day",
              flagships: [`${muniName} Tourism Circuit`],
            };

            const lguCount = await db.collection("lgus").countDocuments();
            await db.collection("lgus").insertOne({
              id: lguCount + 1,
              name: muniName,
              district: meta.district,
              districtLabel: meta.districtLabel,
              badgeColor: meta.badgeColor,
              quote: meta.quote,
              totalVisitors: 0,
              foreignMice: 0,
              capacityLoad: 0,
              status: "Optimal",
              statusType: "optimal",
              officer: u.officeName || u.name || `${muniName} Municipal Tourism Officer`,
              officerRole: "Municipal Tourism Officer",
              flagships: meta.flagships,
              intel: {
                registeredSites: meta.registeredSites,
                carryingCapacity: meta.carryingCapacity,
                currentHeadcount: "0",
                complianceRating: "100%",
                contactPhone: "+63 (078) Tourism Office",
                contactEmail: u.email || "",
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      } catch (syncErr) {
        console.warn("LGU auto-sync notice:", syncErr.message);
      }
    }

    let query = {};

    if (district && district !== "All") {
      query.district = district;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { officer: { $regex: search, $options: "i" } },
        { flagships: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { totalVisitors: -1 };
    if (sort === "Highest Load") sortOption = { capacityLoad: -1 };
    if (sort === "Alphabetical") sortOption = { name: 1 };

    const lgus = await LGU.find(query).sort(sortOption).lean();

    if (db && lgus.length > 0) {
      const establishments = await db.collection("establishments").find({}).toArray().catch(() => []);
      const checkins = await db.collection("checkins").find({}).toArray().catch(() => []);
      const submissions = await db.collection("submissions").find({}).toArray().catch(() => []);

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

      lgus.forEach((lgu) => {
        const lguNameLower = (lgu.name || "").toLowerCase().trim();

        // 1. Establishments in this municipality
        const munEsts = establishments.filter(
          (e) => (e.municipality || "").toLowerCase().trim() === lguNameLower
        );

        let estTotal = 0;
        let estToday = 0;
        let estYesterday = 0;
        let estForeign = 0;

        munEsts.forEach((e) => {
          estTotal += Number(e.totalVisitors || e.visitorsThisMonth || 0);
          estToday += Number(e.visitorsToday || 0);
          estYesterday += Number(e.visitorsYesterday || 0);
          estForeign += Number(e.foreignMice || 0);
        });

        // 2. Check-ins for this municipality
        const munCheckins = checkins.filter(
          (c) => (c.municipality || c.municipalityId || "").toLowerCase().trim() === lguNameLower
        );

        let chkTotal = 0;
        let chkToday = 0;
        let chkYesterday = 0;
        let chkForeign = 0;

        munCheckins.forEach((c) => {
          const count = Number(c.totalVisitors || c.visitors) || ((Number(c.maleCount) || 0) + (Number(c.femaleCount) || 0)) || 1;
          const isForeign = (c.classificationType || c.residenceStatus || "").toLowerCase().includes("foreign") || (c.classificationType || "").toLowerCase().includes("balikbayan");
          const arr = (c.arrivalDate || "").trim();
          const created = new Date(c.createdAt || Date.now());

          chkTotal += count;
          if (isForeign) chkForeign += count;
          if (arr === todayStr || created.toDateString() === todayDateString) {
            chkToday += count;
          }
          if (arr === yStr || created.toDateString() === yDateString) {
            chkYesterday += count;
          }
        });

        // 3. Official form submissions
        const munSubs = submissions.filter(
          (s) => (s.municipality || s.municipalityId || "").toLowerCase().trim() === lguNameLower && s.formData?.totals?.grandTotal
        );
        let formGrandTotal = 0;
        munSubs.forEach((s) => {
          const g = Number(s.formData?.totals?.grandTotal);
          if (g > formGrandTotal) formGrandTotal = g;
        });

        const finalTotal = Math.max(estTotal, chkTotal, formGrandTotal, Number(lgu.totalVisitors) || 0);
        const finalToday = Math.max(estToday, chkToday, Number(lgu.visitorsToday) || 0);
        const finalYesterday = Math.max(estYesterday, chkYesterday, Number(lgu.visitorsYesterday) || 0);
        const finalForeign = Math.max(estForeign, chkForeign, Number(lgu.foreignMice) || 0);

        lgu.totalVisitors = finalTotal;
        lgu.visitorsThisMonth = finalTotal;
        lgu.visitorsToday = finalToday;
        lgu.visitorsYesterday = finalYesterday;
        lgu.foreignMice = finalForeign;
        if (munEsts.length > 0 && (!lgu.intel || !lgu.intel.registeredSites)) {
          if (!lgu.intel) lgu.intel = {};
          lgu.intel.registeredSites = munEsts.length;
        }
      });
    }

    res.json(lgus);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch LGUs", details: error.message });
  }
});

// GET /api/lgus/:id - Get single LGU by ID or name
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const lgu = isNaN(id)
      ? await LGU.findOne({ name: new RegExp(`^${id}$`, "i") })
      : await LGU.findOne({ id: Number(id) });

    if (!lgu) {
      return res.status(404).json({ error: "LGU not found" });
    }
    res.json(lgu);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch LGU", details: error.message });
  }
});

// POST /api/lgus - Add a new LGU
router.post("/", async (req, res) => {
  try {
    const count = await LGU.countDocuments();
    const newLGU = new LGU({
      id: req.body.id || count + 1,
      ...req.body,
    });
    const saved = await newLGU.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: "Failed to create LGU", details: error.message });
  }
});

export default router;
