import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Recipe from '../models/recipe.model.js';

export const testing = (req, res) => {
  res.json({
    message: "api/user.controller: user.controller: World",
  });
};

// exporting to user.route.js
export const updateUserInfo = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'api/user.controller: you can only update your own account'));

  try {
    if (req.body.password)
      req.body.password = await bcrypt.hash(req.body.password, 12);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar, // Use avatar instead of profilePicture
          fullname: req.body.fullname,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          bio: req.body.bio, // Include bio
          socialMedia: req.body.socialMedia,
          role: req.body.role,
          address: req.body.address, // Updated field
          phoneNumber: req.body.phoneNumber, // New field
          userStatus: req.body.userStatus, // New field
          preferences: {
            notifications: req.body.preferences.notifications,
            dietaryRestrictions: req.body.preferences.dietaryRestrictions,
            allergies: req.body.preferences.allergies,
            cuisineTags: req.body.preferences.cuisineTags, // New field
            flavourTag: req.body.preferences.flavourTag, // Existing field
          }, // Include preferences
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc; // remove password from the response
    res.status(200).json(rest);
  } catch (error) {
    next(errorHandler(500, 'api/user.controller: Internal Server Error'));
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

// NEW: Toggle favorite recipe endpoint
export const toggleFavoriteRecipe = async (req, res, next) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!user || !recipe) {
      return res.status(404).json({ message: 'User or Recipe not found' });
    }

    const isFavorited = user.userFavRecipe.some(favId => favId.toString() === recipeId);

    if (isFavorited) {
      // Remove from favorites
      user.userFavRecipe = user.userFavRecipe.filter(favId => favId.toString() !== recipeId);
      recipe.recipeFav = Math.max(0, recipe.recipeFav - 1);
    } else {
      // Add to favorites only if not already present
      user.userFavRecipe.push(recipeId);
      recipe.recipeFav += 1;
    }

    await user.save();
    await recipe.save();

    res.status(200).json({
      message: isFavorited ? 'Recipe removed from favorites' : 'Recipe added to favorites',
      recipeFavCount: recipe.recipeFav,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

// NEW: Fetch user recipes based on current user ID
export const getUserRecipes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('userFavRecipe.recipeId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userRecipes = user.userFavRecipe.map(fav => ({
      recipeId: fav.recipeId._id,
      title: fav.recipeId.title,
      description: fav.recipeId.description,
      favrefs: fav.favrefs,
    }));

    res.status(200).json({ userRecipes });
  } catch (error) {
    next(error);
  }
};

// NEW: Fetch current user data
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    next(errorHandler(500, 'api/user.controller: Internal Server Error'));
  }
};

// NEW: Create user
export const createUser = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const { password, ...rest } = savedUser._doc; // Exclude password from the response
    res.status(201).json(rest);
  } catch (error) {
    next(errorHandler(500, 'api/user.controller: Internal Server Error'));
  }
};

// NEW: Validate current password
export const validatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ isValid: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(200).json({ isValid: false });

    res.status(200).json({ isValid: true });
  } catch (error) {
    next(errorHandler(500, "api/user.controller: Internal Server Error"));
  }
};
