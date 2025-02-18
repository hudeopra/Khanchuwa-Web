import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import recipeRouter from './routes/recipe.route.js';

import cookieParser from 'cookie-parser';
dotenv.config();



mongoose.connect(process.env.MONGODB_AUTH_URI).then(() => {
  console.log('api/index: Connected to MongoDB');
}).catch((error) => {
  console.log(error);
});

const app = express();
app.use(express.json());

app.use(cookieParser());

app.listen(3000, () => {
  console.log('api/index: Server is running on http://localhost:3000');
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter); // Ensure this route is correct
app.use('/api/recipe', recipeRouter);


app.use((err, req, res, next) => { // Error handling middleware
  const statusCode = err.statusCode || 500;
  const message = err.message || 'api/index: Internal Server Error';

  console.log('api/index: MongoDB URI', process.env.MONGODB_AUTH_URI);
  console.log('api/index: Error details', err); // Log error details
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});