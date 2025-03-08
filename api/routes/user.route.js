import express from 'express'; //MUST USE 
import { deleteUser, test, updateUserInfo } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router(); // CREATING ROUTER USING EXPRESS


router.get('/test', test);
router.post('/update/:id', verifyToken, updateUserInfo);
router.delete('/delete/:id', verifyToken, deleteUser)


export default router;