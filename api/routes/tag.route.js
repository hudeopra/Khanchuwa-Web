import express from 'express';
import {
  getTagsByType,
  createTag,
  addRecipeRef,
  removeRecipeRef,
  addBlogRef,        // NEW IMPORT
  removeBlogRef,     // NEW IMPORT
  getAllTags,        // NEW IMPORT
  updateTag,         // NEW IMPORT
  getTagByTypeAndId  // NEW IMPORT
} from '../controllers/tag.controller.js';
// import { verifyToken } from '../utils/verifyUser.js'; // Temporarily disabled

const router = express.Router();

// Fetch tags by their type. E.g., GET /api/tag/flavourTag returns all flavour tags.
router.get('/:type', getTagsByType);

// Create a new tag. Request body should include: { tagType, name } (Token verification temporarily removed for testing)
router.post('/', /* verifyToken, */ createTag);

// add route to fetch recipes by tag name


// New routes to update recipe references and blog references:
router.patch('/addRecipeRef', addRecipeRef);
router.patch('/removeRecipeRef', removeRecipeRef);
router.patch('/addBlogRef', addBlogRef);        // NEW ROUTE for blog reference
router.patch('/removeBlogRef', removeBlogRef);  // NEW ROUTE for blog reference

// New route to fetch all tags
router.get('/', getAllTags);

// New route to update a tag
router.patch('/update/:id', updateTag);

// New route to fetch a tag by tagType and TagObjID
router.get('/:type/:id', getTagByTypeAndId);

export default router;
