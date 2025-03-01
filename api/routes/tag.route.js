import express from 'express';
import { getAllFlavourTags, createFlavourTag, getAllCuisines, createCuisine, getAllIngredients, createIngredient } from '../controllers/tag.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Routes for Flavour Tags
router.get('/flavours', getAllFlavourTags);
router.post('/flavours', verifyToken, createFlavourTag);

// Routes for Cuisines
router.get('/cuisines', getAllCuisines);
router.post('/cuisines', verifyToken, createCuisine);

// Routes for Ingredients
router.get('/ingredients', getAllIngredients);
router.post('/ingredients', verifyToken, createIngredient);

export default router;
