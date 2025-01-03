import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Signup function
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

// Signin function
export const signin = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const validUser = await User.findOne({ username });  
    if (!validUser) {
      return next(errorHandler(404, "auth.controller: User not found"));
    }
    const validpass =  bcryptjs.compareSync(password, validUser.password);
    if (!validpass) {
      return next(errorHandler(401, "auth.controller: Incorrect password"));
    }
    const jwtToken = jwt.sign({id: validUser._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
    const { password: pass, ...restUserInfo } = validUser._doc;
    res.cookie('jwtAccessToken', jwtToken, {httpOnly: true, secure: true, sameSite: 'none'}).status(200).json({message: "auth.controller: User signed in successfully", user: restUserInfo});
  } catch (error) {
    next(error);
  }
}

// google Signin
export const google = async (req, res, next) => {
  try{
    const user= await User.findOne({email: req.body.email});
    if (user){
      const jwtToken = jwt.sign({id: user._id}, process.env.JWT_SECRET);
      const { password: pass, ...restUserInfo } = user._doc;
      res
        .cookie('jwtAccessToken', jwtToken, {httpOnly: true})
        .status(200)
        .json({message: "auth.controller: User signed in successfully", user: restUserInfo});
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // 16 digit pass    }
      const hashedPassword = await bcryptjs.hash(generatedPassword, 12);
      const newUser = new User({
        username: req.body.name.split("").join("").toLowerCase() + Math.random().toString(36).slice(-8), 
        email: req.body.email, 
        password: hashedPassword,
        avatar: req.body.photo, // Save the Google profile image URL
      });

      await newUser.save();
      const jwtToken = jwt.sign({id: newUser._id}, process.env.JWT_SECRET);
      const { password: pass, ...restUserInfo } = newUser._doc;
      res
        .cookie('jwtAccessToken', jwtToken, {httpOnly: true})
        .status(201)
        .json({message: "auth.controller: User signed in successfully", user: restUserInfo});
    }
  } catch (error){
    next(error);
  }
};
