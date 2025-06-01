import express from "express";
import { createOrder, updateOrder, getAllOrders, getOrderById, updateOrderByTransaction, getOrderByTransactionId } from "../controllers/order.controller.js";

const router = express.Router();

// Route to create a new order
router.post("/create", createOrder);

// Route to update an existing order
router.put("/update/:id", updateOrder);

// Route to update order status by transaction UUID
router.put("/update-by-transaction", updateOrderByTransaction);

// Route to find order by transaction ID (used in PaymentSuccess)
router.get("/by-transaction/:transactionId", getOrderByTransactionId);

// Route to fetch all orders
router.get("/all", getAllOrders);

// Route to fetch an individual order by ID
router.get("/:id", getOrderById);

export default router;