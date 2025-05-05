import { Transaction } from "../model/Transaction.model.js";

// Controller to create a new transaction
export const createTransaction = async (req, res) => {
  const { product_id, amount, status } = req.body;

  if (!product_id || !amount || !status) {
    return res.status(400).json({ message: "Product ID, amount, and status are required" });
  }

  try {
    const newTransaction = new Transaction({ product_id, amount, status });
    await newTransaction.save();
    res.status(201).json({ message: "Transaction created successfully", transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error: error.message });
  }
};