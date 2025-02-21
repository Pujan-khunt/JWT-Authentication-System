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
    select: false
  },
  refreshToken: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Hash passwords whenever they are modified or set for the first time.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {return next();}
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (providedPassword) {
  return bcrypt.compare(providedPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);