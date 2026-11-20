
import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });

    console.log("Database connected successfully!");

  } catch (error) {
    console.error("MongoDB connection failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error cause:", error.cause);

    throw error;
  }
};
