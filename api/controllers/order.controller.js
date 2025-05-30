import { Order } from "../models/order.model.js";
import RecipeTag from '../models/recipeTag.model.js';

// Controller to create a new order
export const createOrder = async (req, res) => {
  const { transaction, user, cart } = req.body;
  try {
    const newOrder = new Order({ transaction, user, cart });
    await newOrder.save();
    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// Controller to update the status of an existing order
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body.transaction || {};

  const allowedStatuses = ["PENDING", "COMPLETE", "FAILED", "REFUNDED"];

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}` });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { "transaction.status": status },
      { new: true, fields: { "transaction.status": 1 } } // Restrict update to the status field only
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};

// Controller to update order status by transaction UUID
export const updateOrderByTransaction = async (req, res) => {
  const { transaction_uuid, status, transaction_code, product_code, signature } = req.body;

  if (!transaction_uuid || !status) {
    return res.status(400).json({ message: "Transaction UUID and status are required" });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { "transaction.product_id": transaction_uuid },
      {
        "transaction.status": status,
        "transaction.transaction_code": transaction_code,
        "transaction.product_code": product_code,
        "transaction.signature": signature,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

// Controller to fetch all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from the database
    res.status(200).json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Controller to fetch an individual order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order fetched successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Function to update tag stock after an order is placed
export const updateTagStock = async (req, res, next) => {
  try {
    const { cart } = req.body; // Expecting cart array in the request body

    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Iterate over each item in the cart and update the inStock and quantity values
    for (const item of cart) {
      const { id, quantity } = item;

      if (!id || !quantity) {
        return res.status(400).json({ message: 'Invalid item data in cart' });
      }

      const tag = await RecipeTag.findById(id);

      if (!tag) {
        return res.status(404).json({ message: `Tag with ID ${id} not found` });
      }

      // Deduct the quantity from the inStock and quantity fields
      tag.inStock = Math.max(0, tag.inStock - quantity);
      tag.quantity = Math.max(0, tag.quantity - quantity);
      await tag.save();
    }

    res.status(200).json({ message: 'Stock updated successfully' });
  } catch (error) {
    next(error);
  }
};