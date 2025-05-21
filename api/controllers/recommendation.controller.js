import User from '../models/user.model.js';
import Recipe from '../models/recipe.model.js';
import mongoose from 'mongoose';

export const getRecommendations = async (req, res, next) => {
  const { userId, topN = 5, minSimilarity = 0.1 } = req.query;

  try {
    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Fetch all users and recipes
    const users = await User.find().lean();
    const recipes = await Recipe.find().lean();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found in the database'
      });
    }

    // Check if the requested user exists in the database
    const targetUser = users.find(user => user._id.toString() === userId.toString());
    if (!targetUser) {
      console.log(`Target user not found for ID: ${userId}`);
      console.log('Available user IDs:', users.map(u => u._id.toString()));

      // Instead of letting it throw an error, return a friendly response
      return res.status(404).json({
        success: false,
        message: 'User not found',
        details: 'The requested user ID does not exist in the database',
        userId: userId
      });
    }

    // Call the recommendation algorithm
    const recommendations = userBasedCF(users, recipes, userId, parseInt(topN), parseFloat(minSimilarity));

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    next(error);
  }
};

function userBasedCF(users, recipes, targetUserId, topN = 5, minSimilarity = 0.1) {
  // The targetUser should exist here since we're checking in the controller
  const targetUser = users.find(user => user._id.toString() === targetUserId.toString());
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  // Construct user-item matrix (binary: 1 for favorited, 0 otherwise)
  const dataset = {};
  const allRecipeIds = recipes.map(recipe => recipe._id.toString());
  for (const user of users) {
    dataset[user._id.toString()] = {};
    for (const recipeId of allRecipeIds) {
      // Safely handle userFavRecipe that might be undefined
      const userFavRecipes = user.userFavRecipe || [];
      dataset[user._id.toString()][recipeId] = userFavRecipes.some(fav => fav.toString() === recipeId) ? 1 : 0;
    }
  }

  // Calculate similarities
  const similarities = {};
  for (const user of users) {
    if (user._id.toString() !== targetUserId.toString()) {
      const similarity = calculateSimilarity(dataset[targetUserId.toString()], dataset[user._id.toString()]);
      if (similarity >= minSimilarity) {
        similarities[user._id.toString()] = similarity;
      }
    }
  }

  // Sort similarities
  const sortedSimilarities = Object.entries(similarities)
    .sort(([, simA], [, simB]) => simB - simA);

  // Generate recommendations
  const recommendations = {};
  const similaritySum = {};
  for (const [similarUserId, similarity] of sortedSimilarities) {
    for (const recipeId of allRecipeIds) {
      if (!dataset[targetUserId.toString()][recipeId]) { // Recipe not favorited by target user
        recommendations[recipeId] = (recommendations[recipeId] || 0) + similarity * dataset[similarUserId][recipeId];
        similaritySum[recipeId] = (similaritySum[recipeId] || 0) + similarity;
      }
    }
  }

  // Normalize scores
  for (const recipeId in recommendations) {
    recommendations[recipeId] /= similaritySum[recipeId] || 1;
  }

  // Filter recommendations by dietary restrictions and allergies
  const targetPreferences = targetUser.preferences || {};
  const dietaryRestrictions = targetPreferences.dietaryRestrictions || [];
  const allergies = targetPreferences.allergies || [];

  const filteredRecommendations = Object.entries(recommendations)
    .filter(([recipeId]) => {
      const recipe = recipes.find(r => r._id.toString() === recipeId);
      if (!recipe) return false;

      // Check dietary restrictions
      const recipeDietary = recipe.dietaryRestrictions || [];
      if (dietaryRestrictions.some(dr => recipeDietary.includes(dr))) {
        return false; // Recipe violates user's dietary restrictions
      }

      // Check allergies
      const recipeAllergies = recipe.allergies || [];
      if (allergies.some(allergy => recipeAllergies.includes(allergy))) {
        return false; // Recipe contains allergens
      }

      // Optional: Match flavor preferences
      const userFlavourTags = targetPreferences.flavourTag || [];
      const recipeFlavourTags = (recipe.flavourTag || []).map(tag =>
        typeof tag === 'string' ? tag : (tag.tagName || '')
      );
      if (userFlavourTags.length > 0 && !userFlavourTags.some(tag => recipeFlavourTags.includes(tag))) {
        return false; // Recipe doesn't match flavor preferences
      }

      return true;
    })
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, topN)
    .map(([recipeId]) => {
      const recipe = recipes.find(r => r._id.toString() === recipeId);
      return { id: recipeId, name: recipe.recipeName };
    });

  return filteredRecommendations.length > 0 ? filteredRecommendations : [];
}

function calculateSimilarity(userA, userB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const item in userA) {
    if (userB[item]) {
      dotProduct += userA[item] * userB[item];
    }
    magnitudeA += userA[item] ** 2;
  }

  for (const item in userB) {
    magnitudeB += userB[item] ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}