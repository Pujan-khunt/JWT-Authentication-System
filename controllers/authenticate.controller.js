import { MAX_SESSIONS } from "../constants.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { generateTokens } from "../utils/generateJWT.util.js";

export const authenticateUser = asyncHandler(async (req, res) => {
  // Getting credentials from req.body parsed by express.json() middleware.
  const { username, password } = req.body;

  // Username and Password both are required fields.
  if (!username || !password) {
    throw new ApiError(400, "Username and Password are required to Authenticate a User.");
  }

  // Check if a user with provided username exists.
  const existingUser = await User.findOne({ username }).select("+password").exec();
  if (!existingUser) {
    throw new ApiError(404, `User with username "${username}" doesn't exist.`);
  }

  // Verify the password provided with the hashed password from DB.
  const passwordMatches = await existingUser.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, "Password is invalid.");
  }

  // Save refresh token in the DB.
  const { accessToken, refreshToken } = generateTokens(existingUser);
  
  // Only a set number of sessions are allowed per user
  if(existingUser.refreshToken.length >= MAX_SESSIONS) {
    // Remove/Invalidate the oldest session
    existingUser.refreshToken.shift();
  }
  
  // Add the new refresh token into db. (as its not been used to generate a new access token yet)
  existingUser.refreshToken.push(refreshToken);
  await existingUser.save();

  // Send refresh token as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { accessToken },
      `User with username ${existingUser.username} successfully logged in.`
    )
  );
});