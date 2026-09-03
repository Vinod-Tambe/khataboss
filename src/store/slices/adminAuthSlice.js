import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminLogin, getAdminProfile } from '../../admin/api/adminApi';

const initialState = {
  user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
  token: sessionStorage.getItem('adminToken') || null,
  loginLoading: false,
  profileLoading: false,
  error: null,
  isAuthenticated: !!sessionStorage.getItem('adminToken'),
};

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async ({ login_id, password }, { rejectWithValue }) => {
    try {
      const response = await adminLogin(login_id, password);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      sessionStorage.setItem('adminToken', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminProfile = createAsyncThunk(
  'adminAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdminProfile();
      localStorage.setItem('adminUser', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminToken');
    },
    setAdminUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('adminUser', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state) => {
        state.profileLoading = false;
      });
  },
});

export const { logoutAdmin, setAdminUser } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
