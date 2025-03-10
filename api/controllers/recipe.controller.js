import Recipe from '../models/recipe.model.js';
import User from '../models/user.model.js';

// Create a recipe using properly formatted data from the client.
export const createRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.create(req.body);
    return res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// Update a recipe with new data from the client (used by EditRecipe page)
export const updateRecipe = async (req, res, next) => {
  try {
    // Assuming client sends correct array formats and other fields
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    return res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find();
    return res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("cuisineTag")
      .populate("flavourTag")
      .populate("ingredientTag")
      .populate("tags");
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    return res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const getRandomRecipe = async (req, res, next) => {
  try {
    const count = await Recipe.countDocuments();
    const random = Math.floor(Math.random() * count);
    const randomRecipe = await Recipe.findOne().skip(random);
    res.json({ id: randomRecipe._id });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching random recipe', error });
  }
};

// New function: Add a comment (review) to a recipe
export const addComment = async (req, res, next) => {
  try {
    const { userId, rating, comment } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    recipe.reviews.push({ user: userId, rating, comment });
    await recipe.save();
    return res.status(200).json({ reviews: recipe.reviews });
  } catch (error) {
    next(error);
  }
};

// New function: Permanently delete a recipe
export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    await recipe.deleteOne(); // updated from recipe.remove()
    return res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// New function: Filter recipes based on query parameters
export const filterRecipes = async (req, res, next) => {
  try {
    const {
      userId,
      ingredientTag,
      cuisineTag,
      flavorTag,
      diet,
      // Remove direct recipe filters for allergies, dietaryRestrictions, tastePreferences
      allergies,
      dietaryRestrictions,
      tastePreferences,
      searchTerm,
    } = req.query;

    let filter = {};

    if (userId) {
      filter.userRef = userId;
    }
    if (ingredientTag) {
      const tags = ingredientTag.split(",").map(tag => tag.trim());
      filter.ingredientTag = { $in: tags };
    }
    if (cuisineTag) {
      const cuisines = cuisineTag.split(",").map(tag => tag.trim());
      filter.cuisineTag = { $in: cuisines };
    }
    if (flavorTag) {
      const flavors = flavorTag.split(",").map(tag => tag.trim());
      filter.flavourTag = { $in: flavors };
    }
    if (diet) {
      filter.diet = diet;
    }
    if (searchTerm) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      filter.$and = words.map(word => ({
        $or: [
          { recipeName: new RegExp(word, "i") },
          { description: new RegExp(word, "i") },
          { chefName: new RegExp(word, "i") },
        ]
      }));
    }

    // New: Filter based on user preferences (allergies, dietaryRestrictions, tastePreferences)
    if (allergies || dietaryRestrictions || tastePreferences) {
      let userFilter = {};
      if (allergies) {
        const allergyFilters = allergies.split(",").map(tag => tag.trim());
        userFilter["preferences.allergies"] = { $in: allergyFilters };
      }
      if (dietaryRestrictions) {
        const restrictions = dietaryRestrictions.split(",").map(tag => tag.trim());
        userFilter["preferences.dietaryRestrictions"] = { $in: restrictions };
      }
      if (tastePreferences) {
        const tasteFilters = tastePreferences.split(",").map(tag => tag.trim());
        userFilter["preferences.tastePreferences"] = { $in: tasteFilters };
      }
      const users = await User.find(userFilter).select("_id");
      const userIds = users.map(u => u._id);
      filter.userRef = { $in: userIds };
    }

    const recipes = await Recipe.find(filter);
    return res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};


