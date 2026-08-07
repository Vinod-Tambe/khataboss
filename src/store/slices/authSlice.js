import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyProfile, loginWithCredentials, verifyAndLogin } from '../../api/authApi';

// Initial state, checking storage for existing session
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: sessionStorage.getItem('token') || null,
  loading: false,
  loginLoading: false,
  profileLoading: false,
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

/** Refresh profile + permissions from API (used on page refresh / app boot). */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No session');
      }
      const response = await getMyProfile();
      if (!response?.data) {
        return rejectWithValue(response?.message || 'Failed to load profile');
      }
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
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
      state.profileLoading = false;
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
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
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
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.profileLoading = false;
        // Invalid/expired session → force logout (keep UI if we still have cached user for network blips)
        const msg = String(action.payload || '');
        if (/token|unauthorized|401|403|404|not found|expired|invalid/i.test(msg)) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
