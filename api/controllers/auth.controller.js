import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Signup function
export const signUp = async (req, res, next) => {
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

// Signin function
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log('auth.controller: Signin request', { email, password }); // Log request data

    const validUser = await User.findOne({ email });
    console.log('auth.controller: User found', email);
    if (!validUser) return next(errorHandler(404, 'auth.controller: User not found'));

    const validPassword = await bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(400, 'auth.controller: Invalid credentials'));
    console.log('auth.controller: Password is correct', validPassword);

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    console.log('auth.controller: Generated token', token);
    const { password: pass, ...user } = validUser._doc; // _id is already included in user
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json({ user }); // No changes needed here
  } catch (error) {
    console.error('auth.controller: Signin error', error);
    res.status(500).json({ success: false, message: error.message });
    next(error);
  }
}

// google Signin
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...restUserInfo } = user._doc;
      res
        .cookie('jwtAccessToken', jwtToken, { httpOnly: true })
        .status(200)
        .json({ message: "auth.controller: User signed in successfully", user: restUserInfo });
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // 16 digit pass
      const hashedPassword = await bcryptjs.hash(generatedPassword, 12);
      const username = req.body.name ? req.body.name.split("").join("").toLowerCase() + Math.random().toString(36).slice(-8) : Math.random().toString(36).slice(-16);
      const newUser = new User({
        username,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo, // Save the Google profile image URL
      });

      await newUser.save();
      const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...restUserInfo } = newUser._doc;
      res
        .cookie('jwtAccessToken', jwtToken, { httpOnly: true })
        .status(201)
        .json({ message: "auth.controller: User signed in successfully", user: restUserInfo });
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};