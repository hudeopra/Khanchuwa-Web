import express from 'express';
import { createRecipe, getAllRecipes, getRecipeById } from '../controllers/recipe.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createRecipe);
router.get('/all', getAllRecipes);
router.get('/:id', getRecipeById); // New route to fetch a recipe by ID

export default router;