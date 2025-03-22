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
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAwJZPmxYUUhKB3eYQ-Ta2S_FmRUNOZBabQw&s",
  },
  // New fields with required: false
  userId: { type: String, required: false },
  emails: { type: String, required: false },
  fullname: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  gender: { type: String, required: false },
  phoneNumbers: [{
    number: { type: String, required: false },
    isPrimary: { type: Boolean, required: false }
  }],
  addresses: [{
    type: { type: String, required: false },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, required: false }
  }],
  profilePicture: { type: String, required: false },
  bio: { type: String, required: false },
  socialMedia: [{
    platform: { type: String, required: false },
    url: { type: String, required: false }
  }],
  preferences: {
    dietaryRestrictions: [{ type: String, required: false }],
    allergies: [{ type: String, required: false }],
    tastePreferences: [{ type: String, required: false }],
    language: { type: String, required: false },
    notifications: {
      email: { type: Boolean, required: false },
      push: { type: Boolean, required: false }
    }
  },
  role: { type: String, required: false },
  permissions: [{ type: String, required: false }],
  isActive: { type: Boolean, required: false },
  verificationToken: { type: String, default: null, required: false },
  passwordResetToken: { type: String, default: null, required: false },
  lastLogin: { type: Date, required: false },
  customFields: { type: mongoose.Schema.Types.Mixed, required: false },
  // New field: usertype with enum options and default value "guest"
  usertype: {
    type: String,
    enum: ["user", "creator", "vendor", "admin", "superadmin"],
    default: "user"
  },
  createdRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  // NEW: userFavRecipe to store user's favorite recipes
  userFavRecipe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: false
  }]
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;









