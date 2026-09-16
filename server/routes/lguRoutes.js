import express from "express";
import LGU from "../models/LGU.js";

const router = express.Router();

// GET /api/lgus - Get all LGUs with optional district & search filters
router.get("/", async (req, res) => {
  try {
    const { district, search, sort } = req.query;
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

    const lgus = await LGU.find(query).sort(sortOption);
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
