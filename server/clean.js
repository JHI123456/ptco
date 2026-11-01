import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turismo_track";

async function cleanDatabase() {
  console.log("🧹 Connecting to MongoDB to clear all data...");
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log(`🔍 Found ${collections.length} collections in '${mongoose.connection.name}' database.`);

    for (const col of collections) {
      const result = await db.collection(col.name).deleteMany({});
      console.log(`🗑️ Cleared ${result.deletedCount} documents from: ${col.name}`);
    }

    console.log("✨ All data has been successfully removed! Database is now 100% clean.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error cleaning database:", err.message);
    process.exit(1);
  }
}

cleanDatabase();

