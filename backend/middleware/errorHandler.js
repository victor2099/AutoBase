export const errorHandler = (err, req, res) => {
  console.error("Error caught:", err);

  // Default error
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || "Server Error",
  };

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.statusCode = 400;
    error.message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.statusCode = 400;
    error.message = `${Object.keys(err.keyValue)[0]} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.statusCode = 400;
    error.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.message = "Token expired";
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
