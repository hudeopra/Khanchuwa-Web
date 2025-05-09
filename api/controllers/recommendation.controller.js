import User from '../models/user.model.js';
import Recipe from '../models/recipe.model.js';

export const getRecommendations = async (req, res, next) => {
  const { userId, topN = 5, minSimilarity = 0.1 } = req.query;

  try {
    // Fetch all users and recipes
    const users = await User.find().lean();
    const recipes = await Recipe.find().lean();

    // Call the recommendation algorithm
    const recommendations = userBasedCF(users, recipes, userId, topN, minSimilarity);

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

function userBasedCF(users, recipes, targetUserId, topN = 5, minSimilarity = 0.1) {
  // Validate input
  const targetUser = users.find(user => user._id.toString() === targetUserId);
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  // Construct user-item matrix (binary: 1 for favorited, 0 otherwise)
  const dataset = {};
  const allRecipeIds = recipes.map(recipe => recipe._id.toString());
  for (const user of users) {
    dataset[user._id.toString()] = {};
    for (const recipeId of allRecipeIds) {
      dataset[user._id.toString()][recipeId] = user.userFavRecipe.some(fav => fav.toString() === recipeId) ? 1 : 0;
    }
  }

  // Calculate similarities
  const similarities = {};
  for (const user of users) {
    if (user._id.toString() !== targetUserId) {
      const similarity = calculateSimilarity(dataset[targetUserId], dataset[user._id.toString()]);
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
      if (!dataset[targetUserId][recipeId]) { // Recipe not favorited by target user
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
      const recipeFlavourTags = (recipe.flavourTag || []).map(tag => tag.tagName);
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