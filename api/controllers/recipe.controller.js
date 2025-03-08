import Recipe from '../models/recipe.model.js';

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


