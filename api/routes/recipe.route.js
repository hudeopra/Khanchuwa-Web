import express from 'express';
import { createRecipe, getAllRecipes, getRecipeById, updateRecipe, addComment, deleteRecipe, filterRecipes, getRecipesByUser, getRecipesBykey } from '../controllers/recipe.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createRecipe);
router.post('/update/:id', verifyToken, updateRecipe);
router.post('/comment/:id', verifyToken, addComment); // new route for adding comments
router.delete('/delete/:id', verifyToken, deleteRecipe); // new route for deleting recipe
router.get('/all', getAllRecipes);
router.get('/filter', filterRecipes); // new filtering endpoint
router.get('/user/:userId', getRecipesByUser); // new route for getting recipes by user
router.get('/:id', verifyToken, getRecipeById);

router.get('/:key/:value', getRecipesBykey);

export default router;