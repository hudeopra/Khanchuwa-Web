import express from 'express'; //MUST USE 
import { deleteUser, testing, updateUserInfo, toggleFavoriteRecipe, getUserRecipes, getCurrentUser, validatePassword, decrementRecipeLimit } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router(); // CREATING ROUTER USING EXPRESS

router.get('/test1', testing);
router.post('/update/:id', verifyToken, updateUserInfo);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/favorite/:recipeId', verifyToken, toggleFavoriteRecipe);
router.get('/recipes', verifyToken, getUserRecipes);
router.get('/current', verifyToken, getCurrentUser);
router.post("/validate-password", verifyToken, validatePassword);
router.post("/decrement-recipe-limit", verifyToken, decrementRecipeLimit);

export default router;