import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // wont automatically select the password if not mentioned explicitly
  },
  refreshTokens: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Hash passwords whenever they are modified or set for the first time.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) { return next(); }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("refreshTokens")) { return next(); }

  // Promise.all will wait until either every single promise is resolved or one of them is rejected.
  // We want that every single refreshToken which isn't hashed to get hashed for that we will need to wait for all the Promises which are in pending state.
  // .map function will return something like this.
  // [
  //   Promise { <pending> }, // If hashing was needed
  //   Promise { <fulfilled>: "hashedToken123..." }, // If already hashed, original token is returned
  //   Promise { <fulfilled>: "hashedToken123..." }, 
  // ]
  // As we need to wait for the pending promises to get resolved that is why we use Promise.all();
  this.refreshTokens = await Promise.all(
    // This map will return an array of promises, where all values will be something like this: Promise.resolve(refreshToken)
    // There will be one exception where the refreshToken is not hashed. The .map function will not wait for it to resolve it will
    // Instantly return an array of promises.
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

// Tells whether the provided refresh token exists with the user or not.
UserSchema.methods.compareRefreshToken = async function (providedRefreshToken) {
  const results = await Promise.all(
    // Will return an array of promises.(handled by Promise.all())
    this.refreshTokens.map((refreshToken) => bcrypt.compare(refreshToken, providedRefreshToken))
  );

  console.log(results);
  return results.includes(true);
};

// Goal of this method is to provide the index of the refreshToken in the array it is stored.
UserSchema.methods.getRefreshTokenIndex = async function (refreshToken) {
  const results = await Promise.all(
    this.refreshToken.map((refreshToken, index) => bcrypt.compare(refreshToken, providedPassword))
  );

  console.log(results);
  results.findIndex((isMatching) => isMatching === true);
};

export const User = mongoose.model("User", UserSchema);