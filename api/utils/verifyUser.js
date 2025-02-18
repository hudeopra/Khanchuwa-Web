import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  console.log("verifyUser.js: token", token); // Debugging statement
  if (!token) {
    console.log("No token provided"); // Debugging statement
    return next(errorHandler(401, 'api/verifyUser: Unauthorized'));
  }

  const SECRET_OR_PRIVATE_KEY = process.env.JWT_SECRET;
  if (!SECRET_OR_PRIVATE_KEY) return next(errorHandler(500, 'api/verifyUser: JWT_key_not_found'));
  jwt.verify(token, SECRET_OR_PRIVATE_KEY, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err); // Debugging statement
      return next(errorHandler(403, 'api/verifyUser: Forbidden'));
    }
    console.log("Token verified successfully:", user); // Debugging statement
    req.user = user;
    next();
  });
};
