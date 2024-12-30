import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

export const signup = async (req, res, next) => {
  // console.log("auth.controller: SIGNUP REQUEST DATA", req.body);

  const { username, email, password } = req.body;

  const hashedPassword = await bcryptjs.hash(password, 12);
  const newUser = new User({ username, email, password: hashedPassword });

  // Console for verification
  // console.log("auth.controller: NEW USER", newUser );

  try {
    await newUser.save();
    res.status(201).json({ message: "auth.contoller: User created successfully" });
  } catch (error) {
    // next(errorHandler(550, "auth.contoller: error function signup - unique username/pass  ")); // Pass error to next()
    next(error);

  }
};


