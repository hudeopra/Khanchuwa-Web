import express from 'express';
import { signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", (req, res, next) => {
  console.log('auth.route: POST /signup route hit');
  next();
}, signup);

export default router;