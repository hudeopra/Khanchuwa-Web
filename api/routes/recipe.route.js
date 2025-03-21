/**
 * @route POST /create
 * @description Create a new recipe. Requires user authentication.
 * @access Private
 */

/**
 * @route POST /update/:id
 * @description Update an existing recipe by its ID. Requires user authentication.
 * @access Private
 */

/**
 * @route POST /comment/:id
 * @description Add a comment to a recipe by its ID. Requires user authentication.
 * @access Private
 */

/**
 * @route DELETE /delete/:id
 * @description Delete a recipe by its ID. Requires user authentication.
 * @access Private
 */

/**
 * @route GET /all
 * @description Retrieve all recipes. Publicly accessible.
 * @access Public
 */

/**
 * @route GET /filter
 * @description Retrieve recipes based on specific filter criteria. Publicly accessible.
 * @access Public
 */

/**
 * @route GET /user/:userId
 * @description Retrieve all recipes created by a specific user. Publicly accessible.
 * @access Public
 */

/**
 * @route GET /:id
 * @description Retrieve a specific recipe by its ID. Requires user authentication.
 * @access Private
 */
import express from 'express';
import { createRecipe, getAllRecipes, getRecipeById, updateRecipe, addComment, deleteRecipe, filterRecipes, getRecipesByUser } from '../controllers/recipe.controller.js';
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

export default router;