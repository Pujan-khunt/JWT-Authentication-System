import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

export const logoutUser = asyncHandler(async (req, res) => {
  // No problem if no cookies are present,
  // Deleting them anyways.
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    // Removing a cookie even after checking it doesn't exist is a good security measure.
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.status(200).json(new ApiResponse(200, null, "User successfully logged out."));
  }

  // Checking existence of refresh token in db.
  const existingUser = await User.findOne({ refreshTokens: { $in: [refreshToken] } }).exec();
  if (!existingUser) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.status(200).json(new ApiResponse(200, null, "User successfully logged out."));
  }

  // Delete refresh token from db.
  existingUser.refreshTokens = existingUser.refreshTokens.filter(token => token !== refreshToken);
  await existingUser.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  return res.status(204).json(
    new ApiResponse(
      204,
      null,
      "User successfully logged out."
    )
  );
});