import express from "express";
import { createTransaction } from "../controllers/transaction.controller.js";

const router = express.Router();

// Route to create a new transaction
router.post("/create", createTransaction);

export default router;