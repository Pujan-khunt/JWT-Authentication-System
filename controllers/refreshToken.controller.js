import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ApiError } from "../utils/ApiError.util.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/User.model.js";
import { generateTokens } from "../utils/generateJWT.js";

export const handleRefreshToken = asyncHandler(async (req, res) => {
  // Check existence of refresh token in the form of cookies.
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided.");
  }

  // Find user with existing refresh token 
  const user = await User.findOne({ refreshToken: { $in: [refreshToken] } }).exec();

  // No user found. Suspect token reuse.
  if (!user) {
    try {
      // No error in verfication of jwt confirms an attack on the user.
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Delete all refresh tokens for the compromised user
      await User.updateOne({ username: decoded.username }, { $set: { refreshToken: [] } });
    } catch (error) {
      throw new ApiError(403, "Invalid or expired refresh token.", [error]);
    }

    throw new ApiError(403, "Token reuse detected. All sessions cleared.");
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Removed the used refresh token from the array (Token Rotation)
    user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);

    // Generate a fresh new set of tokens
    const result = generateTokens(user);
    const newAccessToken = result.accessToken;
    const newRefreshToken = result.refreshToken;
    
    // Store the new refresh token in the array
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

    // Send the freshly generated access token.
    return res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, "Access Token Refreshed Successfully."));
  } catch (error) {
    // If token verification fails then force logout the user
    user.refreshToken = [];
    await user.save();
    throw new ApiError(403, "Invalid or expired refresh token.");
  }
});