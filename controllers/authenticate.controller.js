import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { generateTokens } from "../utils/generateJWT.js";

export const authenticateUser = async (req, res) => {
  // Getting credentials from req.body parsed by express.json() middleware.
  const { username, password } = req.body;

  // Username and Password both are required fields.
  if (!username || !password) {
    throw new ApiError(400, "Username and Password are required fields.");
  }

  // Check if a user with provided username exists.
  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) {
    throw new ApiError(404, `User with username = ${username} doesn't exist.`);
  }

  // Verify the password provided with the hashed password from DB.
  const passwordMatches = await foundUser.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, "Password is invalid.");
  }

  // Save refresh token in the DB.
  const { accessToken, refreshToken } = generateTokens();
  foundUser.refreshToken = refreshToken;
  await foundUser.save();

  res.status(200).json(new ApiResponse(200, { accessToken, refreshToken }, `User with username = ${foundUser.username} successfully logged in.`));
}