import Recipe from '../models/recipe.model.js';
import User from '../models/user.model.js';
import RecipeTag from '../models/recipeTag.model.js'; // Import RecipeTag model

// Helper function to populate tagName based on tagId
const populateTags = async (tags) => {
  return Promise.all(
    tags.map(async (tag) => {
      const tagData = await RecipeTag.findById(tag.tagId);
      return {
        tagId: tag.tagId,
        tagName: tagData ? tagData.name : "Unknown",
      };
    })
  );
};

// Helper function to update recipe references in tags
const updateRecipeReferences = async (tags, recipeId) => {
  await Promise.all(
    tags.map(async (tag) => {
      const tagData = await RecipeTag.findById(tag.tagId);
      if (tagData) {
        await tagData.addRecipeReference(recipeId);
      }
    })
  );
};

// Create a recipe using properly formatted data from the client.
export const createRecipe = async (req, res, next) => {
  try {
    const { cuisineTag, flavourTag, ingredientTag, ...rest } = req.body;

    // Populate tagName for each tag type
    const populatedCuisineTag = await populateTags(cuisineTag || []);
    const populatedFlavourTag = await populateTags(flavourTag || []);
    const populatedIngredientTag = await populateTags(ingredientTag || []);

    const recipe = await Recipe.create({
      ...rest,
      cuisineTag: populatedCuisineTag,
      flavourTag: populatedFlavourTag,
      ingredientTag: populatedIngredientTag,
    });

    // Update recipe references in tags
    await updateRecipeReferences(populatedCuisineTag, recipe._id);
    await updateRecipeReferences(populatedFlavourTag, recipe._id);
    await updateRecipeReferences(populatedIngredientTag, recipe._id);

    return res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// Update a recipe with new data from the client (used by EditRecipe page)
export const updateRecipe = async (req, res, next) => {
  try {
    const { cuisineTag, flavourTag, ingredientTag, ...rest } = req.body;

    // Populate tagName for each tag type
    const populatedCuisineTag = await populateTags(cuisineTag || []);
    const populatedFlavourTag = await populateTags(flavourTag || []);
    const populatedIngredientTag = await populateTags(ingredientTag || []);

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        cuisineTag: populatedCuisineTag,
        flavourTag: populatedFlavourTag,
        ingredientTag: populatedIngredientTag,
      },
      { new: true }
    );

    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Update recipe references in tags
    await updateRecipeReferences(populatedCuisineTag, recipe._id);
    await updateRecipeReferences(populatedFlavourTag, recipe._id);
    await updateRecipeReferences(populatedIngredientTag, recipe._id);

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
      .populate("ingredientTag");
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
    res.json({ id: randomRecipe._id, success: true, message: "getRandomRecipe" });
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
      const tags = ingredientTag.split(",").map((tag) => tag.trim());
      if (req.query.ingredientLogic === "AND") {
        filter["ingredientTag.tagName"] = { $all: tags }; // Match all tags
      } else {
        filter["ingredientTag.tagName"] = { $in: tags }; // Match any tag
      }
    }
    if (cuisineTag) {
      const cuisines = cuisineTag.split(",").map((tag) => tag.trim());
      if (req.query.cuisineLogic === "AND") {
        filter["cuisineTag.tagName"] = { $all: cuisines }; // Match all tags
      } else {
        filter["cuisineTag.tagName"] = { $in: cuisines }; // Match any tag
      }
    }
    if (flavorTag) {
      const flavors = flavorTag.split(",").map((tag) => tag.trim());
      if (req.query.flavourLogic === "AND") {
        filter["flavourTag.tagName"] = { $all: flavors }; // Match all tags
      } else {
        filter["flavourTag.tagName"] = { $in: flavors }; // Match any tag
      }
    }
    if (diet) {
      filter.diet = diet;
    }

    // Combine searchTerm with other filters
    if (searchTerm) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      const searchConditions = words.map(word => ({
        $or: [
          { recipeName: new RegExp(word, "i") },
          { description: new RegExp(word, "i") },
          { chefName: new RegExp(word, "i") },
        ],
      }));

      // Combine existing filter with $and condition
      filter.$and = [...(filter.$and || []), ...searchConditions];
    }

    // Filter based on user preferences (allergies, dietaryRestrictions, tastePreferences)
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
    return res.status(200).json({ success: true, message: "filterRecipes", recipes });
  } catch (error) {
    next(error);
  }
};

// New function: Get recipes for a given user (with optional limit)
export const getRecipesByUser = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const recipes = await Recipe.find({ userRef: req.params.userId }).limit(limit);
    return res.status(200).json({ success: true, message: "getRecipesByUser", recipes });
  } catch (error) {
    next(error);
  }
};


