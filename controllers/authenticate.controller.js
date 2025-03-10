import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { generateTokens } from "../utils/generateJWT.util.js";

const expiresInSeconds = 15 * 60; // 900 seconds (15 minutes)

// Return a user, if exists based on username or email.
const getUserByEmailOrUsername = async (username, email) => {
  if(!username) {return await User.findOne({ email }).select("+password").exec();}
  if(!email) {await User.findOne({ username }).select("+password").exec();}
};

export const authenticateUser = asyncHandler(async (req, res) => {
  // Getting credentials from req.body parsed by express.json() middleware.
  const { username, email, password } = req.body;

  // Either one of them should be satisfied. 
  // 1. Username and Password
  // 2. Email and Password
  if (!((username || email) && password)) {
    if(!password) {
      throw new ApiError(404, "password is required to authenticate a User. User logged in.");
    }
    throw new ApiError(404, "Either username or email needs to be present. User logged in.");
  }

  // Find the user either based on their email or username.
  const existingUser = getUserByEmailOrUsername(username, email);
  if (!existingUser) {
    throw new ApiError(404, `User doesn't exist.`);
  }

  // Verify the password provided with the hashed password from DB.
  const passwordMatches = await existingUser.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, "Password is invalid. User not logged in.");
  }

  // Save refresh token in the DB.
  const { accessToken, refreshToken } = generateTokens(existingUser);

  // Only a set number of sessions are allowed per user
  if (existingUser.refreshTokens.length >= process.env.MAX_SESSIONS) {
    // Remove/Invalidate the oldest session and save after adding a new refresh token.
    existingUser.refreshTokens.shift();
  }

  // Add the new refresh token into db. (as its not been used to generate a new access token yet)
  existingUser.refreshTokens.push(refreshToken);
  await existingUser.save();

  // Send refresh token as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });

  const loginSuccessfulMessage = username !== null 
    ? `User with username '${existingUser.username}' successfully logged in.`
    : `User with email '${existingUser.email}' successfully logged in.`;
  res.status(200).json(
    new ApiResponse(
      200,
      { 
        accessToken,
        expiresIn: expiresInSeconds 
      },
      loginSuccessfulMessage
    )
  );
});