import express from 'express';
import { createShop, getAllShops, getShopById, updateShop, addComment, deleteShop, filterShops, getShopsByUser } from '../controllers/shop.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createShop);
router.post('/update/:id', verifyToken, updateShop);
router.post('/comment/:id', verifyToken, addComment); // new route for adding comments
router.delete('/delete/:id', verifyToken, deleteShop); // new route for deleting shop
router.get('/all', getAllShops);
router.get('/filter', filterShops); // filtering endpoint
router.get('/user/:userId', getShopsByUser); // get shops by user
router.get('/:id', verifyToken, getShopById);

export default router;
