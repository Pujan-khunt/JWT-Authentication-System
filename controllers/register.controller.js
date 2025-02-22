import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/User.model.js";
import { generateTokens } from "../utils/generateJWT.util.js";

export const registerUser = asyncHandler(async (req, res) => {
  // Getting credentials from req.body parsed by express.json() middleware
  const { username, password } = req.body;

  // Username and Password both are required fields
  if (!username || !password) {
    throw new ApiError(400, "Username and Password are required fields.");
  }

  // Users with duplicate usernames are not allowed
  const existingUser = await User.findOne({ username }).exec();
  if (existingUser) {
    throw new ApiError(409, `User with username ${username} already exists.`);
  }

  // Creating user (password automatically hashed in pre-save hook)
  const newUser = await User.create({ username, password });

  // Generate JWT tokens
  const { accessToken, refreshToken } = generateTokens(newUser);

  // Save refresh token in database (as its not been used to generate new access token)
  newUser.refreshToken.push(refreshToken);
  await newUser.save();

  // Send refresh tokens as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents JS Access
    secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production environment
    sameSite: "Strict", // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
  });

  // Sending the ID and the Username of the new user
  res.status(201).json(
    new ApiResponse(
      201,
      { id: newUser._id, username: newUser.username, accessToken },
      `User with username = ${username} created successfully.`
    )
  );
});