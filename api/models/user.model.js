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
    required: true,
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
    favrefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }], // Reference to Recipe object IDs
  }],
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;









