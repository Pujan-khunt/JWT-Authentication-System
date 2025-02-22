import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.util.js";

export const globalErrorHandler = async (error, req, res, next) => {
  // Initial Default Values
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorsArray = [];

  if (error instanceof jwt.JsonWebTokenError) {
    statusCode = 403;
    message = "Authentication Failed. Reason: Invalid token.";

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const user = await User.findOne({ refreshToken: { $in: [refreshToken] } });

        if (user) {
          user.refreshToken = [];
          await user.save();
        }
      } catch (dbError) {
        console.error("Error while clearing user sessions:", error);
      }
    }
  }
  else if (error instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Your session has expired. Please login again.";
  }
  else if(error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorsArray = error.errors;
  }

  // Log the unexpected error but dont send to client.
  if (statusCode === 500) {
    console.error("Unexpected Error:", {
      error,
      timestamp: new Date().toString(),
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user?.id || "Unknown user"
    });
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errorsArray,
    // Include the stack trace in developement environment only
    ...process.env.NODE_ENV !== "developement" && { stack: error.stack }
  });
};