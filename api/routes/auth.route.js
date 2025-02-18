import express from 'express';
import { signUp, signIn, signOut, google } from '../controllers/auth.controller.js';

const router = express.Router();

// router.post("/signup", (req, res, next) => {
//   console.log('auth.route: POST /signup route hit');
//   next();
// }, signup);

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/google", google);
router.get("/signOut", signOut);

export default router;