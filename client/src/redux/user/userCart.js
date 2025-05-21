import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: []
};

const userCartSlice = createSlice({
  name: "userCart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    addToCart: (state, action) => {
      const { _id, productName, quantity, price, favImg, disPrice, mrkPrice, maxQuantity } = action.payload;
      const existing = state.items.find((item) => item.id === _id);

      // Check if maxQuantity is provided
      if (maxQuantity !== undefined) {
        if (existing) {
          // Calculate new quantity
          const newQuantity = existing.quantity + quantity;

          // Check if new quantity exceeds the maximum available stock
          if (newQuantity > maxQuantity) {
            // Only update to maxQuantity if more is requested
            existing.quantity = maxQuantity;
            // Recalculate price based on unit price
            existing.price = existing.quantity * (price / quantity);
            return; // Exit early as we've updated to the maximum
          }

          // Otherwise, proceed with normal update
          existing.quantity = newQuantity;
          existing.price = existing.quantity * (price / quantity);
        } else {
          // For new items, respect the maxQuantity
          const finalQuantity = Math.min(quantity, maxQuantity);
          state.items.push({
            id: _id,
            productName,
            quantity: finalQuantity,
            price: (price / quantity) * finalQuantity,
            unitPrice: price / quantity,
            favImg,
            disPrice,
            mrkPrice,
            maxQuantity,
          });
        }
      } else {
        // Original behavior for items without maxQuantity
        if (existing) {
          existing.quantity += quantity;
          existing.price = existing.quantity * (price / quantity);
        } else {
          state.items.push({
            id: _id,
            productName,
            quantity,
            price,
            unitPrice: price / quantity,
            favImg,
            disPrice,
            mrkPrice,
          });
        }
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      if (item) {
        // Respect maxQuantity if it exists
        if (item.maxQuantity !== undefined) {
          item.quantity = Math.min(quantity, item.maxQuantity);
        } else {
          item.quantity = quantity;
        }
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        // Respect maxQuantity if it exists
        if (item.maxQuantity !== undefined) {
          item.quantity = Math.min(quantity, item.maxQuantity);
        } else {
          item.quantity = quantity;
        }
        item.price = item.unitPrice * item.quantity; // Recalculate total price
      }
    }
  }
});

export const { clearCart, addToCart, updateQuantity, removeFromCart, updateCartItem } = userCartSlice.actions;
export default userCartSlice.reducer;
