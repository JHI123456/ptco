import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";

// Use public reliable DNS resolvers (Google / Cloudflare) to prevent SRV lookup ECONNREFUSED on local networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore fallback
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config(); // fallback to root .env if present

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/turismo_track";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Notice: Could not connect to ${uri}`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`   Tip: Ensure MongoDB is running locally, or configure MONGODB_URI in server/.env with your MongoDB Atlas connection string.`);
    return false;
  }
};

export default connectDB;
