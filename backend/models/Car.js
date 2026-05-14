import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, "Car make is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Car model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Car year is required"],
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    licensePlate: {
      type: String,
      required: [true, "License plate is required"],
      unique: true,
      uppercase: true,
    },
    dailyRate: {
      type: Number,
      required: [true, "Daily rate is required"],
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Car = mongoose.model("Car", carSchema);
