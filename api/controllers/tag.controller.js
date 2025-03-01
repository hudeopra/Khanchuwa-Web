import FlavourTag from '../models/flavourTag.model.js';
import Cuisine from '../models/cuisine.model.js';
import Ingredient from '../models/ingredient.model.js';

// Flavour Tag functions
export const getAllFlavourTags = async (req, res, next) => {
  try {
    const tags = await FlavourTag.find();
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

export const createFlavourTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    let tag = await FlavourTag.findOne({ name });
    if (!tag) tag = await FlavourTag.create({ name });
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

// Cuisine functions
export const getAllCuisines = async (req, res, next) => {
  try {
    const cuisines = await Cuisine.find();
    res.status(200).json(cuisines);
  } catch (error) {
    next(error);
  }
};

export const createCuisine = async (req, res, next) => {
  try {
    const { name } = req.body;
    let cuisine = await Cuisine.findOne({ name });
    if (!cuisine) cuisine = await Cuisine.create({ name });
    res.status(201).json(cuisine);
  } catch (error) {
    next(error);
  }
};

// Ingredient functions
export const getAllIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (error) {
    next(error);
  }
};

export const createIngredient = async (req, res, next) => {
  try {
    const { name } = req.body;
    let ingredient = await Ingredient.findOne({ name });
    if (!ingredient) ingredient = await Ingredient.create({ name });
    res.status(201).json(ingredient);
  } catch (error) {
    next(error);
  }
};
