import { Order } from "../models/order.model.js";
import RecipeTag from '../models/recipeTag.model.js';

// Controller to create a new order
export const createOrder = async (req, res) => {
  const { transaction, user, userInfo, shipping, paymentMethod, cart } = req.body;
  try {
    const newOrder = new Order({
      transaction,
      user,
      userInfo,
      shipping,
      paymentMethod,
      cart,
      stockUpdated: false // Initially false for all orders
    });
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

  const allowedStatuses = ["PENDING", "COMPLETE", "FAILED", "REFUNDED", "CASH"];

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}` });
  }

  try {
    // Find the current order to check its current status
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = currentOrder.transaction.status;
    // Handle stock updates based on status changes
    if (status === "REFUNDED" && (previousStatus === "COMPLETE" || previousStatus === "CASH") && currentOrder.stockUpdated) {
      // Restore stock when refunding a completed order
      await restoreStockHelper(currentOrder.cart);

      // Update the order with new status and mark stock as not updated
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          "transaction.status": status,
          "stockUpdated": false
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Order refunded successfully and stock restored",
        order: updatedOrder
      });
    }

    // For other status updates, just update the status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { "transaction.status": status },
      { new: true }
    );

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

// Controller to get order by transaction ID (used in PaymentSuccess)
export const getOrderByTransactionId = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const order = await Order.findOne({ 'transaction.product_id': transactionId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Function to update tag stock after an order is placed
export const updateTagStock = async (req, res, next) => {
  try {
    const { cart, orderId } = req.body; // Expecting cart array and orderId in the request body

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

    // Mark the order as stock updated if orderId is provided
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { stockUpdated: true });
    }

    res.status(200).json({ message: 'Stock updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Function to restore tag stock when an order is refunded
export const restoreTagStock = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if stock was actually updated for this order
    if (!order.stockUpdated) {
      return res.status(400).json({ message: 'Stock was not updated for this order' });
    }

    // Restore stock for each item in the cart
    for (const item of order.cart) {
      const { id, quantity } = item;

      const tag = await RecipeTag.findById(id);
      if (!tag) {
        console.warn(`Tag with ID ${id} not found during stock restoration`);
        continue;
      }

      // Add the quantity back to the inStock and quantity fields
      tag.inStock = tag.inStock + quantity;
      tag.quantity = tag.quantity + quantity;
      await tag.save();
    }

    // Mark the order as stock not updated since we've restored it
    order.stockUpdated = false;
    await order.save();

    res.status(200).json({ message: 'Stock restored successfully' });
  } catch (error) {
    next(error);
  }
};

// Helper function to restore stock (used internally)
const restoreStockHelper = async (cart) => {
  try {
    for (const item of cart) {
      const { id, quantity } = item;

      if (!id || !quantity) {
        continue; // Skip invalid items
      }

      const tag = await RecipeTag.findById(id);
      if (!tag) {
        console.warn(`Tag with ID ${id} not found during stock restoration`);
        continue;
      }

      // Add the quantity back to the inStock and quantity fields
      tag.inStock = tag.inStock + quantity;
      tag.quantity = tag.quantity + quantity;
      await tag.save();
    }
  } catch (error) {
    console.error('Error restoring stock:', error);
    throw error;
  }
};