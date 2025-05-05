import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    transaction: {
      product_id: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      status: {
        type: String,
        required: true,
        enum: ["PENDING", "COMPLETE", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
    },
    user: {
      type: String,
      required: true,
    },
    cart: [
      {
        id: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        _id: false, // Disable automatic _id generation for each cart item
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);