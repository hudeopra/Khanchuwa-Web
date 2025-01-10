import { errorHandler } from "../utils/error.js"; // Corrected import path
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {  // middleware to verify token
  const tokenCookie = req.cookies.access_token; // get token from headers
  console.log("verifyUser.js: tokenCookie", tokenCookie);

  if (!tokenCookie) return next(errorHandler(401, 'api/verifyUser: Unauthorized'));

  const SECRET_OR_PRIVATE_KEY = process.env.JWT_SECRET;
  if (!SECRET_OR_PRIVATE_KEY) return next(errorHandler(500, 'api/verifyUser: Internal Server Error'));
  jwt.verify(tokenCookie, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, 'api/verifyUser: Forbidden'));
    req.user = user; //saving the id of the user
    next(); //update user in user.route.js
  });
};