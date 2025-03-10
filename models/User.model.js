import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

/**
 * User Schema
 * 
 * schema for User Model in the database.
 * It includes fields for username, password, and refresh tokens along with the timestamps.
 * 
 * @typedef {Object} UserSchema
 * @property {string} username - The username of the user. It is required, unique, trimmed, and stored in lowercase.
 * @property {string} password - The password of the user. It is required and will not be selected automatically unless explicitly mentioned.
 * @property {string} email - The email of the user. It is required, unique, trimmed, and stored in lowercase.
 * @property {string[]} refreshTokens - An array of refresh tokens associated with the user. Defaults to an empty array.
 * @property {Date} createdAt - The timestamp when the user was created.
 * @property {Date} updatedAt - The timestamp when the user was last updated.
 */
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  refreshTokens: {
    type: [String],
    default: []
  }
}, { timestamps: true });

/**
 * Middleware to hash passwords whenever they are modified or set for the first time.
 * 
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) { return next(); }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares the provided password with the stored hashed password.
 * 
 * @param {string} providedPassword - The password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the passwords match.
 */
UserSchema.methods.comparePassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

/**
 * Middleware to hash refresh tokens whenever they are modified or set for the first time.
 * 
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("refreshTokens")) { return next(); }

  this.refreshTokens = await Promise.all(
    this.refreshTokens.map(async (refreshToken) => {
      // Check if it's already hashed (bcrypt hashes start with $2b$)
      const alreadyHashed = refreshToken.startsWith("$2b$");

      if (alreadyHashed) {
        return refreshToken;
      }

      // If not hashed then hash using bcrypt.
      return await bcrypt.hash(refreshToken, 10);
    })
  );
  next();
});

/**
 * Returns true if the provided refresh token exists in the database, otherwise it returns false.
 * 
 * @param {string} providedRefreshToken - The refresh token to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating the presence of refreshToken in the array.
 */
UserSchema.methods.compareRefreshToken = async function (providedRefreshToken) {
  const results = await Promise.all(
    // Will return an array of promises.(handled by Promise.all())
    this.refreshTokens.map((refreshToken) => bcrypt.compare(refreshToken, providedRefreshToken))
  );

  console.log(results);
  return results.includes(true);
};

/**
 * Returns the index of the refresh token in the array.
 * 
 * @param {string} providedRefreshToken - The refresh token to compare against.
 * @returns {Promise<number>} - A promise that resolves to the index of the provided refresh token in the array.
 */
UserSchema.methods.getRefreshTokenIndex = async function (providedRefreshToken) {
  const results = await Promise.all(
    this.refreshToken.map((refreshToken) => bcrypt.compare(refreshToken, providedRefreshToken))
  );

  console.log(results);
  results.findIndex((isMatching) => isMatching === true);
};

export const User = mongoose.model("User", UserSchema);