import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import recipeRouter from './routes/recipe.route.js';
import tagRouter from './routes/tag.route.js'; // Added tag router
import blogRouter from './routes/blog.route.js'; // Added tag router
import orderRoutes from './routes/order.route.js';
import cors from 'cors';
// esewa
import { connectDB } from './esewa/DB/db.js';
import { EsewaInitiatePayment, paymentStatus } from './esewa/controller/esewa.controller.js';


import cookieParser from 'cookie-parser';
dotenv.config();
connectDB();

mongoose.connect(process.env.MONGODB_AUTH_URI).then(() => {
  console.log('api/index: Connected to MongoDB');
}).catch((error) => {
  console.log(error);
});

const app = express();
app.use(express.json());

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log('api/index: Server is running on http://localhost:3000');
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/recipe', recipeRouter);
app.use('/api/tag', tagRouter);
app.use('/api/blog', blogRouter); // Set up tag routes
app.use("/orders", orderRoutes);

app.post("/initiate-payment", EsewaInitiatePayment);
app.post("/payment-status", paymentStatus);

app.use((err, req, res, next) => { // Error handling middleware
  const statusCode = err.statusCode || 500;
  const message = err.message || 'api/index: Internal Server Error';

  console.log('api/index: Error details', err);
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});