import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import userCartReducer from './user/userCart';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import sessionStorage from 'redux-persist/lib/storage/session';

const userPersistConfig = {
  key: 'user',
  storage: sessionStorage,
  version: 1,
};

const userCartPersistConfig = {
  key: 'userCart',
  storage,
  version: 1,
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  userCart: persistReducer(userCartPersistConfig, userCartReducer),
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  blacklist: ['user', 'userCart'], // Prevent double persistence
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const presistor = persistStore(store);