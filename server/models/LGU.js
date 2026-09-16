import mongoose from "mongoose";

const LGUSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, enum: ["North", "Central", "South"] },
    districtLabel: { type: String, required: true },
    badgeColor: { type: String, default: "blue" },
    quote: { type: String, required: true },
    totalVisitors: { type: Number, default: 0 },
    foreignMice: { type: Number, default: 0 },
    capacityLoad: { type: Number, default: 0 },
    status: { type: String, default: "Optimal" },
    statusType: { type: String, default: "optimal" },
    officer: { type: String, required: true },
    officerRole: { type: String, default: "Municipal Tourism Officer" },
    flagships: [{ type: String }],
    intel: {
      registeredSites: { type: Number, default: 0 },
      carryingCapacity: { type: String },
      currentHeadcount: { type: String },
      complianceRating: { type: String, default: "100%" },
      contactPhone: { type: String },
      contactEmail: { type: String },
    },
  },
  { timestamps: true }
);

const LGU = mongoose.model("LGU", LGUSchema);
export default LGU;
