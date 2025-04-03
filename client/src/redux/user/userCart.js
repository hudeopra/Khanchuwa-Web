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
      const { _id, productName, quantity, price } = action.payload;
      const existing = state.items.find((item) => item.id === _id);
      if (existing) {
        existing.quantity += quantity; // Increment quantity
        existing.price = existing.quantity * (price / quantity); // Recalculate total price based on unit price
      } else {
        state.items.push({
          id: _id,
          productName,
          quantity,
          price, // Total price for the initial quantity
          unitPrice: price / quantity, // Store unit price for future calculations
        });
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      if (item) item.quantity = quantity;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = quantity; // Update quantity
        item.price = item.unitPrice * quantity; // Recalculate total price
      }
    }
  }
});

export const { clearCart, addToCart, updateQuantity, removeFromCart, updateCartItem } = userCartSlice.actions;
export default userCartSlice.reducer;
