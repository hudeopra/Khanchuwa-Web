import express from 'express';
import { createRecipe, getAllRecipes } from '../controllers/recipe.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createRecipe);
router.get('/all', getAllRecipes); // New route to fetch all recipes

export default router;