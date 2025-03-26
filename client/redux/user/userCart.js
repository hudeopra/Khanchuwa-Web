import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [] // added initial items array
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
        existing.price = price; // update price to reflect current product price
      } else {
        state.items.push({ id: _id, productName, quantity, price });
      }
    },
    updateQuantity: (state, action) => {
      // update quantity for a specified product
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      if (item) item.quantity = quantity;
    },
    removeFromCart: (state, action) => {
      // remove product from cart by productId
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  }
});

export const { clearCart, addToCart, updateQuantity, removeFromCart } = userCartSlice.actions;
export default userCartSlice.reducer;