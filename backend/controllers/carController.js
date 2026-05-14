import { Car } from "../models/Car.js";

// Get all cars
export const getAllCars = async (req, res, next) => {
  try {
    const cars = await Car.find();
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};

// Get car by ID
export const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }
    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// Create car (admin only)
export const createCar = async (req, res, next) => {
  try {
    const { make, model, year, licensePlate, dailyRate, image } = req.body;

    // Validation
    if (!make || !model || !year || !licensePlate || !dailyRate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const car = await Car.create({
      make,
      model,
      year,
      licensePlate,
      dailyRate,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// Update car (admin only)
export const updateCar = async (req, res, next) => {
  try {
    const {
      make,
      model,
      year,
      licensePlate,
      dailyRate,
      availability,
      status,
      image,
    } = req.body;

    let car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        make: make || car.make,
        model: model || car.model,
        year: year || car.year,
        licensePlate: licensePlate || car.licensePlate,
        dailyRate: dailyRate || car.dailyRate,
        availability:
          availability !== undefined ? availability : car.availability,
        status: status || car.status,
        image: image || car.image,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// Delete car (admin only)
export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
