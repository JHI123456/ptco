import mongoose from "mongoose";

const EstablishmentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, enum: ["North", "Central", "South"] },
    districtLabel: { type: String, required: true },
    badgeColor: { type: String, default: "blue" },
    municipality: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Hotel",
        "Resort",
        "Mabuhay Accommodation",
        "Homestay",
        "Farm Tourism Camps",
        "Tourism Attractions",
        "Hotels & Resorts",
        "Dining & Gastronomy",
        "Eco & Agri-Tourism",
        "MICE & Convention",
      ],
    },
    establishmentType: { type: String },
    tagline: { type: String, required: true },
    totalVisitors: { type: Number, default: 0 },
    foreignMice: { type: Number, default: 0 },
    capacityLoad: { type: Number, default: 0 },
    status: { type: String, default: "Optimal" },
    statusType: { type: String, default: "optimal" },
    officer: { type: String, required: true },
    officerRole: { type: String, default: "General Manager" },
    flagships: [{ type: String }],
    intel: {
      dotAccreditation: { type: String, required: true },
      validity: { type: String },
      dailyCarryingLimit: { type: String },
      currentOccupancy: { type: String },
      roomInventory: { type: String },
      parkingSlots: { type: String },
      peakDays: { type: String },
      complianceScore: { type: String, default: "98.0%" },
      address: { type: String },
      contactPhone: { type: String },
      contactEmail: { type: String },
    },
  },
  { timestamps: true }
);

const Establishment = mongoose.model("Establishment", EstablishmentSchema);
export default Establishment;
