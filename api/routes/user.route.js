import express from 'express'; //MUST USE 
import { deleteUser, testing, updateUserInfo, toggleFavoriteRecipe } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router(); // CREATING ROUTER USING EXPRESS

router.get('/test1', testing);
router.post('/update/:id', verifyToken, updateUserInfo);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/favorite/:recipeId', verifyToken, toggleFavoriteRecipe);

export default router;