import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const verifyUser = asyncHandler(async (req, res) => {
  const verificationToken = req.params.token;

  const decoded = jwt.verify(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
  const user = await User.findOne({ email: decoded.email }).exec();

  // User not found. But verification token is valid.
  if (!user) {
    throw new ApiError(404, "User doesn't, exists");
  }

  // User already verified
  if (user.isVerified) {
    throw new ApiError(400, "User already verified.");
  }

  // Update the verification status of the user.
  user.isVerified = true;
  user.verificationToken = null; // One time token.
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Email Verified Successfully."));
});