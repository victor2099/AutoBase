import { Booking } from "../models/Booking.js";
import { Car } from "../models/Car.js";

// Create booking
export const createBooking = async (req, res, next) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Car ID and dates are required",
      });
    }

    // Check if car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (!car.availability || car.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Car is not available",
      });
    }

    // Check for date conflicts
    const existingBooking = await Booking.findOne({
      carId,
      $or: [
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) },
        },
      ],
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Car is already booked for these dates",
      });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.dailyRate;

    const booking = await Booking.create({
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get my bookings (customer)
export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ userId })
      .populate("carId")
      .populate("userId");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate("carId").populate("userId");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status (admin only)
export const updateBooking = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    )
      .populate("carId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update car availability based on booking status
    if (status === "confirmed") {
      await Car.findByIdAndUpdate(booking.carId, {
        availability: false,
        status: "rented",
      });
    } else if (status === "cancelled") {
      await Car.findByIdAndUpdate(booking.carId, {
        availability: true,
        status: "available",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking (customer or admin)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is owner or admin
    if (
      booking.userId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to cancel this booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    // Release car
    await Car.findByIdAndUpdate(booking.carId, {
      availability: true,
      status: "available",
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
