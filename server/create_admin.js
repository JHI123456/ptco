import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turismo_track";

async function createAdmin() {
  console.log("Creating default Admin accounts...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const accounts = [
    {
      email: "admin@turismotrack.gov.ph",
      password: "adminpassword123",
      name: "Provincial Tourism Officer",
      role: "Provincial Admin",
      officeName: "Provincial Tourism and Cultural Affairs Office",
      municipality: "Bayombong"
    },
    {
      email: "admin@gmail.com",
      password: "adminpassword123",
      name: "Provincial Tourism Officer",
      role: "Provincial Admin",
      officeName: "Provincial Tourism and Cultural Affairs Office",
      municipality: "Bayombong"
    },
    {
      email: "tourism@solano.gov.ph",
      password: "solanopassword123",
      name: "Solano Tourism Officer",
      role: "Municipality Admin",
      officeName: "Solano Municipal Tourism Office",
      municipality: "Solano"
    },
    {
      email: "shana@gmail.com",
      password: "shanapassword123",
      name: "Shana Hotel Manager",
      role: "Accommodation Manager",
      establishmentName: "shana",
      municipality: "Solano"
    }
  ];

  for (const acc of accounts) {
    const hashedPassword = crypto.createHash("sha256").update(acc.password).digest("hex");
    await db.collection("users").updateOne(
      { email: acc.email },
      {
        $set: {
          name: acc.name,
          officeName: acc.officeName,
          establishmentName: acc.establishmentName,
          municipality: acc.municipality,
          email: acc.email,
          password: hashedPassword,
          role: acc.role,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`✅ Ready: [${acc.role}] Email: ${acc.email} | Password: ${acc.password}`);
  }

  await mongoose.disconnect();
}

createAdmin().catch(console.error);

