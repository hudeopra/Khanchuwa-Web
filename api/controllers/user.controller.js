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
  try {
    const userId = req.user.id;
    const { recipeId, favRecipeId } = req.body; // Include favRecipeId
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recipeIndex = user.userFavRecipe.findIndex(fav => fav.recipeId.equals(recipeId));
    if (recipeIndex !== -1) {
      // Recipe exists, toggle favorite recipe
      const favrefs = user.userFavRecipe[recipeIndex].favrefs || [];
      const favRecipeIndex = favrefs.findIndex(id => id.equals(favRecipeId));
      if (favRecipeIndex !== -1) {
        favrefs.splice(favRecipeIndex, 1); // Remove favorite recipe
      } else {
        favrefs.push(favRecipeId); // Add favorite recipe
      }
      user.userFavRecipe[recipeIndex].favrefs = favrefs;
    } else {
      // Add new recipe with favorite recipe
      user.userFavRecipe.push({
        recipeId,
        favrefs: [favRecipeId]
      });
    }

    await user.save();
    return res.status(200).json({ message: 'Favorite updated', userFavRecipe: user.userFavRecipe });
  } catch (error) {
    next(error);
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
