import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_AUTH_URI;

    if (!connectionString || (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://'))) {
      throw new Error('Invalid MongoDB connection string. Ensure it starts with "mongodb://" or "mongodb+srv://".');
    }

    await mongoose.connect(connectionString);

    console.log('db.js: Successfully connected to MongoDB');
  } catch (error) {
    console.error('db.js: Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};