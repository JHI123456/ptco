import express from "express";
import Establishment from "../models/Establishment.js";

const router = express.Router();

// GET /api/establishments - Get all establishments with category, district, search filters
router.get("/", async (req, res) => {
  try {
    const { category, district, search, sort } = req.query;
    let query = {};

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

    const establishments = await Establishment.find(query).sort(sortOption);
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
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({
      error: "Failed to create establishment",
      details: error.message,
    });
  }
});

export default router;
