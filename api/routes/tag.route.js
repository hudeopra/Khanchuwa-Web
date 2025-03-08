import express from 'express';
import { getTagsByType, createTag } from '../controllers/tag.controller.js';
// import { verifyToken } from '../utils/verifyUser.js'; // Temporarily disabled

const router = express.Router();

// Fetch tags by their type. E.g., GET /api/tag/flavourTag returns all flavour tags.
router.get('/:type', getTagsByType);

// Create a new tag. Request body should include: { tagType, name } (Token verification temporarily removed for testing)
router.post('/', /* verifyToken, */ createTag);

export default router;
