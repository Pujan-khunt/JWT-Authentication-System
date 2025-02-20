import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required
  },
  password: {
    type: String,
    required
  }
});

export const User = mongoose.model("User", UserSchema);