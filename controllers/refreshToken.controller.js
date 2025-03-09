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

  // Verify the creation of the refresh token using our secret.
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // Find the user based on the username from the decoded refresh token.
  const user = await User.findOne({ username: decoded.username }).exec();

  const refreshTokenMatches = await user.compareRefreshToken(refreshToken);

  // Token is valid (verified by jwt) but when compared against existing tokens
  // In the DB, it doesn't match.
  if (!user || !refreshTokenMatches) {
    // Clear the session of the compromised user who created this refreshToken.(selecting user based on the username of the jwt)
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }

    throw new ApiError(403, "Token reuse detected. Invalidated all sessions.");
  }

  // Upto this point, the refreshToken is valid and a user exists with the provided refreshToken.
  // Remove the existing refresh token from DB (As it will now become used).
  const index = user.getRefreshTokenIndex(refreshToken);
  if (index !== -1) {
    user.refreshTokens.splice(index, 1);
    // Saving to DB later, after appending the new tokens.
  }

  // Generate fresh token pair
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Save the new refresh token in the DB. (automatically hashed on saving)
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  // Delete the cookie to send a new one.
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  // Send new refresh token as an HTTP-only cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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