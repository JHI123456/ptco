import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turismo_track";

async function reconcile() {
  console.log("🔄 Connecting to MongoDB to reconcile visitor statistics...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Reconcile shana in establishments
  const estRes = await db.collection("establishments").updateOne(
    { name: { $regex: /^shana$/i } },
    {
      $set: {
        totalVisitors: 15,
        visitorsThisMonth: 15,
        visitorsToday: 3,
        visitorsYesterday: 4,
        visitorsThisWeek: 15,
        foreignMice: 4,
        foreignToday: 0,
        foreignYesterday: 4,
        capacityLoad: 2,
        updatedAt: new Date()
      }
    }
  );
  console.log("Updated establishment 'shana':", estRes.modifiedCount);

  // 2. Reconcile Solano in lgus
  const lguRes = await db.collection("lgus").updateOne(
    { name: { $regex: /^solano$/i } },
    {
      $set: {
        totalVisitors: 15,
        visitorsToday: 3,
        visitorsYesterday: 4,
        visitorsThisMonth: 15,
        foreignMice: 4,
        capacityLoad: 1,
        "intel.currentHeadcount": "3 / 2,000",
        updatedAt: new Date()
      }
    }
  );
  console.log("Updated LGU 'Solano':", lguRes.modifiedCount);

  await mongoose.disconnect();
  console.log("✅ Reconcile complete!");
}

reconcile().catch(console.error);

