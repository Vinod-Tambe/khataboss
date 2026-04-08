import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import firmReducer from './slices/firmSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    firm: firmReducer,
    user: userReducer,
  },
});

export default store;
