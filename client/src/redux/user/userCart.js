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
      // Expect action.payload to be a single product object with _id, productName, quantity, price
      const { _id, productName, quantity, price } = action.payload;
      const existing = state.items.find(item => item.id === _id);
      if (existing) {
        existing.quantity += quantity;
        existing.price = price || existing.price || 0; // update price if defined or keep existing
      } else {
        state.items.push({ id: _id, productName, quantity, price: price || 0 });
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      if (item) item.quantity = quantity;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  }
});

export const { clearCart, addToCart, updateQuantity, removeFromCart } = userCartSlice.actions;
export default userCartSlice.reducer;
