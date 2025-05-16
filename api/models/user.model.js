import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAwJZPmxYUUhKB3eYQ-Ta2S_FmRUNOZBabQw&s",
  },
  fullname: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  bio: { type: String },
  socialMedia: [{
    platform: { type: String },
    url: { type: String }
  }],
  role: {
    type: String,
    required: true,
    enum: ["user", "creator", "admin"],
    default: "user"
  },
  userFavRecipe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe', // Updated to match the correct model name
    required: false,
    default: [], // Ensure it defaults to an empty array
  }],
  userStatus: {
    type: String,
    required: true,
    default: "ACTIVE",
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  preferences: {
    dietaryRestrictions: [{ type: String, required: false }],
    allergies: [{ type: String, required: false }],
    cuisineTags: [{ type: String, required: false }], // Added cuisineTags
    flavourTag: [{ type: String, required: false }],
  },
  recipelimit: {
    type: Number,
    required: true,
    default: 10,
  },
}, {
  timestamps: true,
}); // Closing the schema definition properly

const User = mongoose.model("User", userSchema);

export default User;









