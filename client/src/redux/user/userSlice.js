import { createSlice, current } from '@reduxjs/toolkit';

const initialState = {
  currentUser: undefined, // Set to undefined instead of null
  allUsers: undefined, // Set to undefined instead of null
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      const { user, allUsers } = action.payload; // Extract user and allUsers from payload
      const { _id, username, fullname, avatar, userFavRecipe, gender, preferences, role } = user; // Destructure user fields
      state.currentUser = { _id, username, fullname, avatar, userFavRecipe, gender, preferences, role }; // Set currentUser

      if (role === 'admin' && allUsers) {
        state.allUsers = allUsers; // Set allUsers only for admin
        sessionStorage.setItem('allUsers', JSON.stringify(allUsers)); // Store allUsers in session storage
      } else {
        state.allUsers = undefined; // Ensure allUsers is undefined if not admin
      }

      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      // Keep existing user data and merge with updated fields
      const updatedUser = action.payload;

      // Maintain the current state and only update fields that are present in the response
      state.currentUser = {
        ...state.currentUser,
        ...updatedUser,
      };

      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteUserStart: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.allUsers = null; // Clear allUsers on delete
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    signOutUserStart: (state) => {
      state.loading = true;
    },
    signOutUserSuccess: (state) => {
      state.currentUser = undefined; // Set to undefined on sign out
      state.allUsers = undefined; // Set to undefined on sign out
      sessionStorage.removeItem('allUsers'); // Remove allUsers from session storage
      state.loading = false;
      state.error = null;
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  deleteUserStart,
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
} = userSlice.actions;

export default userSlice.reducer;