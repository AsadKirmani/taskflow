import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

function getConnectionString(): string {
  if (IS_PRODUCTION) {
    if (!process.env.MONGODB_URI) {
      throw new Error("CRITICAL: MONGODB_URI is missing");
    }
    return process.env.MONGODB_URI;
  }

  const localUri = process.env.MONGODB_URI_LOCAL ?? process.env.MONGODB_URI;
  if (!localUri) {
    throw new Error("DEVELOPMENT ERROR: MONGODB_URI is missing");
  }
  return localUri;
}

export async function connectToDatabase() {
  if (!MONGODB_DB_NAME) {
    throw new Error("DATABASE ERROR: MONGODB_DB_NAME is missing");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const start = Date.now();
  console.log("🔄 Connecting to MongoDB...");

  try {
    const connection = await mongoose.connect(getConnectionString(), {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Mongo Connected in", Date.now() - start, "ms");
    return connection;
  } catch (error) {
    console.error("❌ Mongo Connection Error:", error);
    process.exit(1);
  }
}
const gracefulShutdown = async (signal: string) => {
  if (mongoose.connection.readyState !== 0) {
    console.log(`\n🛑 Received ${signal}. Closing MongoDB connection...`);
    await mongoose.connection.close(false);
    console.log("✅ MongoDB connection closed.");
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
