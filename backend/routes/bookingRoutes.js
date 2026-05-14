import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Protected routes - customers and admins
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/cancel", protect, cancelBooking);

// Admin only routes
router.get("/", protect, authorize("admin"), getAllBookings);
router.put("/:id", protect, authorize("admin"), updateBooking);

export default router;
