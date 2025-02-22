import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ApiError } from "../utils/ApiError.util.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/User.model.js";
import { generateTokens } from "../utils/generateJWT.util.js";

export const handleRefreshToken = asyncHandler(async (req, res) => {
  // Check existence of refresh token in the form of cookies.
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided.");
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // Find the user by token and clear their session
  const user = await User.findOne({
    username: decoded.username,
    refreshToken: { $in: [refreshToken] }
  }).exec();

  // Token reuse detected
  if (!user) {
    // Token is valid (verified by jwt) but not in DB, it means it was used 
    // before. This indicates potential token theft.
    await User.updateOne(
      // Invalidate all refresh tokens of the user who created this provided refresh token.
      { username: decoded.username },
      { $set: { refreshToken: [] } }
    );

    throw new ApiError(403, "Token reuse detected. Invalidated all sessions.");
  }

  // Remove the existing refresh token from DB.
  user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);

  // Generate fresh token pair
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Save the new refresh token in the DB.
  user.refreshToken.push(newRefreshToken);
  await user.save();

  // Delete the cookie to send a new one.
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });

  // Send new refresh token as an HTTP-only cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken: newAccessToken },
      "Access token refreshed successfully."
    )
  );
});