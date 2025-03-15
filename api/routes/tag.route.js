import express from 'express';
import { getTagsByType, createTag, addRecipeRef, removeRecipeRef, getRecipesByTagName } from '../controllers/tag.controller.js';
// import { verifyToken } from '../utils/verifyUser.js'; // Temporarily disabled

const router = express.Router();

// Fetch tags by their type. E.g., GET /api/tag/flavourTag returns all flavour tags.
router.get('/:type', getTagsByType);

// Create a new tag. Request body should include: { tagType, name } (Token verification temporarily removed for testing)
router.post('/', /* verifyToken, */ createTag);

// New route to fetch recipes by tag name
router.get('/recipes/:tagName', getRecipesByTagName);

// New routes to update recipe references for a tag.
router.patch('/addRecipeRef', addRecipeRef);
router.patch('/removeRecipeRef', removeRecipeRef);

export default router;
