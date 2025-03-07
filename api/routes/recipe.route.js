import express from 'express';
import { createRecipe, getAllRecipes, getRecipeById, updateRecipe, addComment, deleteRecipe } from '../controllers/recipe.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createRecipe);
router.post('/update/:id', verifyToken, updateRecipe);
router.post('/comment/:id', verifyToken, addComment); // new route for adding comments
router.delete('/delete/:id', verifyToken, deleteRecipe); // new route for deleting recipe
router.get('/all', getAllRecipes);
router.get('/:id', getRecipeById);

export default router;