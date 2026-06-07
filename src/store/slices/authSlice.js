import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginWithCredentials, verifyAndLogin } from '../../api/authApi';

// Initial state, checking storage for existing session
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: sessionStorage.getItem('token') || null,
  loading: false,
  loginLoading: false,
  error: null,
  isAuthenticated: !!sessionStorage.getItem('token'),
};

// Async thunk for OTP login
export const loginWithOtp = createAsyncThunk(
  'auth/loginWithOtp',
  async ({ own_login_id, otp }, { rejectWithValue }) => {
    try {
      const response = await verifyAndLogin(own_login_id, otp);
      
      if (response && response.token) {
        // Store in respective storage
        localStorage.setItem('user', JSON.stringify(response.user));
        sessionStorage.setItem('token', response.token);
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginWithCredentials(credentials.login_id, credentials.password);
      
      if (response && response.token) {
        // Store in respective storage
        localStorage.setItem('user', JSON.stringify(response.user));
        sessionStorage.setItem('token', response.token);
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      // For thoroughness, also clean up any legacy token in localStorage
      localStorage.removeItem('token'); 
      localStorage.removeItem('selectedFirmId');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(loginWithOtp.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
