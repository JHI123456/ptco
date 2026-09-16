import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/turismotrack";

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
