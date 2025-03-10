import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/User.model.js";
import { generateTokens } from "../utils/generateJWT.util.js";

const expiresInSeconds = 15 * 60; // 900 seconds (15 minutes)

export const registerUser = asyncHandler(async (req, res) => {
  // Getting credentials from req.body parsed by express.json() (bodyParser) middleware
  const { username, email, password } = req.body;

  // Username and Password both are required fields.
  if (!username || !password || !email) {
    throw new ApiError(400, "username, email and password are required to register a new User. User not registered.");
  }

  // Users with duplicate usernames are not allowed.
  if (await User.findOne({ username }).exec()) {
    throw new ApiError(409, `User with username ${username} already exists. User not registered.`);
  }

  // Users with duplicate emails are not allowed.
  if (await User.findOne({ email }.exec())) {
    throw new ApiError(409, `User with email ${email} already exists. User not registered.`);
  }

  // Creating user (password automatically hashed in pre-save hook)
  const newUser = await User.create({ username, email, password });

  // Generate JWT tokens
  const { accessToken, refreshToken } = generateTokens(newUser);

  // Save refresh token in database (as its not been used to generate new access token)
  newUser.refreshTokens.push(refreshToken);
  await newUser.save();

  // Send refresh tokens as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents JS Access
    secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production environment
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
  });

  // Sending the ID and the Username of the new user
  res.status(201).json(
    new ApiResponse(
      201,
      { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email,
        accessToken,
        expiresIn: expiresInSeconds
      },
      `User with username '${username}' created successfully.`
    )
  );
});