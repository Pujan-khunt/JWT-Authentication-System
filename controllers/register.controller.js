import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/User.model.js";
import bcrypt from "bcrypt";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Username and Password both are required fields
  if (!username || !password) {
    throw new ApiError(400, "Username and Password are required fields.");
  }

  // Users with duplicate usernames are not allowed
  const duplicate = await User.findOne({ username }).exec();
  if (duplicate) {
    throw new ApiError(409, `User with username ${username} already exists.`);
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password: hashedPwd
  })

  res.status(201).json(new ApiResponse(201, {id: newUser._id, username: newUser.username}, `User with username = ${username} created successfully.`));
});