import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turismo_track";

async function createOfficialAdmin() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";
  const hashedPassword = crypto.createHash("sha256").update(adminPassword).digest("hex");

  const adminDoc = {
    name: "Provincial Tourism Officer",
    officeName: "Provincial Tourism and Cultural Affairs Office",
    establishmentName: "PTCAO Nueva Vizcaya",
    municipality: "Bayombong",
    email: adminEmail,
    password: hashedPassword,
    role: "Provincial Admin",
    portal: "provincial",
    updatedAt: new Date()
  };

  const result = await db.collection("users").updateOne(
    { email: adminEmail },
    {
      $set: adminDoc,
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );

  console.log(`✅ SUCCESS! Admin account created/updated:`);
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role:     Provincial Admin`);
  console.log(`   Status:   Matched ${result.matchedCount}, Upserted ${result.upsertedCount}, Modified ${result.modifiedCount}`);

  await mongoose.disconnect();
}

createOfficialAdmin().catch(console.error);

