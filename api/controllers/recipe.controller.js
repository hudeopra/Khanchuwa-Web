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
    const {
      recipeName,
      description,
      diet,
      ingredients,
      prepTime,
      cookTime,
      servings,
      difficulty,
      chefName,
      videoUrl,
      flavourTag,
      cuisineTag, // Ensure cuisineTag is destructured
      ingredientTag,
      bannerImgUrl,
      favImgUrl,
      shortDescription,
      nutritionalInfo,
      cookInstructions,
      prepInstructions,
      mealType,
      cookingMethod,
      dietaryRestrictions,
      allergies,
      userRef,
      imageUrls, // Add imageUrls here
      status, // The status field from the client
    } = req.body;

    // Determine the actual status based on user role and chosen status
    let finalStatus = status || 'PENDING'; // Default to PENDING if not specified

    // If status is DRAFT, keep it as DRAFT
    // If status is PUBLISH and user role is admin, set to PUBLISHED
    // If status is PUBLISH and user role is creator, set to PENDING
    // This validation will be in the frontend, we'll trust the status coming from there

    // Populate tagName for each tag type
    const populatedCuisineTag = await populateTags(cuisineTag || []);
    const populatedFlavourTag = await populateTags(flavourTag || []);
    const populatedIngredientTag = await populateTags(ingredientTag || []);

    const recipe = await Recipe.create({
      recipeName,
      description,
      diet,
      ingredients,
      prepTime,
      cookTime,
      servings,
      difficulty,
      chefName,
      videoUrl,
      flavourTag: populatedFlavourTag,
      cuisineTag: populatedCuisineTag,
      ingredientTag: populatedIngredientTag,
      bannerImgUrl,
      favImgUrl,
      shortDescription,
      nutritionalInfo,
      cookInstructions,
      prepInstructions,
      mealType,
      cookingMethod,
      dietaryRestrictions: dietaryRestrictions || [], // Handle new field
      allergies: allergies || [], // Handle new field
      userRef,
      imageUrls, // Include imageUrls in the recipe creation
      status: finalStatus, // Use the determined final status
    });

    // Update recipe references in tags
    await updateRecipeReferences(populatedCuisineTag, recipe._id);
    await updateRecipeReferences(populatedFlavourTag, recipe._id);
    await updateRecipeReferences(populatedIngredientTag, recipe._id);

    // Return the new recipe with additional info about whether to decrement
    return res.status(201).json({
      ...recipe.toObject(),
      shouldDecrementLimit: finalStatus !== 'DRAFT' // Only decrement if not a draft
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a recipe with new data from the client (used by EditRecipe page)
export const updateRecipe = async (req, res, next) => {
  try {
    const {
      dietaryRestrictions,
      allergies,
      cuisineTag, // Ensure cuisineTag is destructured
      flavourTag,
      ingredientTag,
      status,
      ...rest
    } = req.body;

    // First, get the existing recipe to preserve data not included in the request
    const existingRecipe = await Recipe.findById(req.params.id);
    if (!existingRecipe) return res.status(404).json({ message: 'Recipe not found' });

    // If we're only updating the status (common from admin panel), preserve existing tag data
    const isStatusOnlyUpdate = Object.keys(req.body).length === 1 && status !== undefined;

    // Determine what tag data to use (new data or preserve existing)
    let updatedCuisineTag, updatedFlavourTag, updatedIngredientTag;

    if (isStatusOnlyUpdate) {
      // For status-only updates, preserve existing tag data
      updatedCuisineTag = existingRecipe.cuisineTag;
      updatedFlavourTag = existingRecipe.flavourTag;
      updatedIngredientTag = existingRecipe.ingredientTag;
    } else {
      // For normal updates with tag data, process the new tags
      updatedCuisineTag = cuisineTag ? await populateTags(cuisineTag) : existingRecipe.cuisineTag;
      updatedFlavourTag = flavourTag ? await populateTags(flavourTag) : existingRecipe.flavourTag;
      updatedIngredientTag = ingredientTag ? await populateTags(ingredientTag) : existingRecipe.ingredientTag;

      // Update recipe references in tags if new tag data was provided
      if (cuisineTag) await updateRecipeReferences(updatedCuisineTag, existingRecipe._id);
      if (flavourTag) await updateRecipeReferences(updatedFlavourTag, existingRecipe._id);
      if (ingredientTag) await updateRecipeReferences(updatedIngredientTag, existingRecipe._id);
    }

    // Create update object with preserved or new data
    const updateData = {
      ...rest,
      cuisineTag: updatedCuisineTag,
      flavourTag: updatedFlavourTag,
      ingredientTag: updatedIngredientTag,
      dietaryRestrictions: dietaryRestrictions !== undefined ? dietaryRestrictions : existingRecipe.dietaryRestrictions,
      allergies: allergies !== undefined ? allergies : existingRecipe.allergies,
    };

    // Add status to update data if provided (for admin status changes)
    if (status !== undefined) {
      updateData.status = status;
    } else if (!isStatusOnlyUpdate) {
      // For regular content updates (not status-only admin changes), set status to PENDING for review
      updateData.status = 'PENDING';
    }

    // Perform the update
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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

// New function: Get all published recipes
export const getPublishedRecipes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 0; // Add limit parameter

    // Find published recipes with optional limit
    const query = Recipe.find({ status: 'PUBLISHED' });

    if (limit > 0) {
      query.limit(limit);
    }

    // Sort by createdAt by default (newest first)
    query.sort({ createdAt: -1 });

    const recipes = await query;

    return res.status(200).json({
      success: true,
      message: "getPublishedRecipes",
      recipes
    });
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

// New function: Get a published recipe by ID
export const getPublishedRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      status: 'PUBLISHED'
    })
      .populate("cuisineTag")
      .populate("flavourTag")
      .populate("ingredientTag");

    if (!recipe) {
      return res.status(404).json({ message: 'Published recipe not found' });
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

    // Check if the user is the recipe owner
    if (recipe.userRef.toString() === userId.toString()) {
      return res.status(403).json({ message: 'Recipe owners cannot comment on their own recipes' });
    }

    // Check if the user has already commented
    const existingComment = recipe.reviews.find(review => review.user.toString() === userId.toString());
    if (existingComment) {
      return res.status(409).json({ message: 'You have already commented on this recipe' });
    }

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
      searchTerm,
      status,
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
    // Add status filter
    if (status) {
      filter.status = status;
    } else {
      // Default to PUBLISHED if status not specified
      filter.status = 'PUBLISHED';
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

    // Filter based on user preferences (allergies, dietaryRestrictions)
    if (allergies || dietaryRestrictions) {
      let userFilter = {};
      if (allergies) {
        const allergyFilters = allergies.split(",").map(tag => tag.trim());
        userFilter["preferences.allergies"] = { $in: allergyFilters };
      }
      if (dietaryRestrictions) {
        const restrictions = dietaryRestrictions.split(",").map(tag => tag.trim());
        userFilter["preferences.dietaryRestrictions"] = { $in: restrictions };
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

// New function: Filter recipes by mealType, diet, difficulty, and servings
export const filterRecipesByAttributes = async (req, res, next) => {
  try {
    const { mealType, diet, difficulty, servings } = req.query;

    let filter = {};

    if (mealType) {
      filter.mealType = { $in: mealType.split(",").map((type) => type.trim()) };
    }
    if (diet) {
      filter.diet = diet;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (servings) {
      filter.servings = parseInt(servings, 10);
    }

    const recipes = await Recipe.find(filter);
    return res.status(200).json({ success: true, message: "filterRecipesByAttributes", recipes });
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


