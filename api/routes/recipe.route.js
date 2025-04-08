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
 *              This endpoint allows users to filter recipes by various parameters such as:
 *              - Ingredients
 *              - Cuisine type
 *              - Preparation time
 *              - Difficulty level
 *              - Dietary restrictions (e.g., vegan, gluten-free)
 *              Users can pass these filters as query parameters in the request.
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

/**
 * API Endpoints for Testing (Base URL: http://localhost:5000/api/recipes):
 * POST   /create          - http://localhost:5000/api/recipes/create
 * POST   /update/:id      - http://localhost:5000/api/recipes/update/:id
 * POST   /comment/:id     - http://localhost:5000/api/recipes/comment/:id
 * DELETE /delete/:id      - http://localhost:5000/api/recipes/delete/:id
 * GET    /all             - http://localhost:5000/api/recipes/all
 * GET    /filter          - http://localhost:5000/api/recipes/filter
 * GET    /user/:userId    - http://localhost:5000/api/recipes/user/:userId
 * GET    /:id             - http://localhost:5000/api/recipes/:id
 */

import express from 'express';
import { createRecipe, getAllRecipes, getRecipeById, updateRecipe, addComment, deleteRecipe, filterRecipes, getRecipesByUser, filterRecipesByAttributes } from '../controllers/recipe.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createRecipe);
router.post('/update/:id', verifyToken, updateRecipe);
router.post('/comment/:id', verifyToken, addComment); // new route for adding comments
router.delete('/delete/:id', verifyToken, deleteRecipe); // new route for deleting recipe
router.get('/user/:userId', getRecipesByUser); // updated route for getting recipes by user
router.get('/all', getAllRecipes);
router.get('/filter', filterRecipes); // new filtering endpoint
router.get('/filter-by-attributes', filterRecipesByAttributes); // moved above to avoid conflict
router.get('/:id', getRecipeById); // moved this route below to avoid conflict

export default router;