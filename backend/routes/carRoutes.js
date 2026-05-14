import express from "express";
import { getAllCars, getCarById, createCar, updateCar, deleteCar } from "../controllers/carController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin only routes
router.post("/", protect, authorize("admin"), createCar);
router.put("/:id", protect, authorize("admin"), updateCar);
router.delete("/:id", protect, authorize("admin"), deleteCar);

export default router;
