import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import firmReducer from './slices/firmSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    firm: firmReducer,
  },
});

export default store;
