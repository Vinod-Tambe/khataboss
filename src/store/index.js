import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import firmReducer from './slices/firmSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    firm: firmReducer,
    user: userReducer,
  },
});

export default store;
