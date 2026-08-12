import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFirmsDropdown } from '../../api/firmApi';

const savedFirmId = typeof window !== 'undefined' ? (localStorage.getItem('selectedFirmId') || 'all') : 'all';

export const loadFirmsDropdown = createAsyncThunk(
  'firm/loadFirmsDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFirmsDropdown();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load firms');
    }
  }
);

const initialState = {
  firms: [],
  selectedFirmId: savedFirmId,
  loading: false,
  error: null,
};

const firmSlice = createSlice({
  name: 'firm',
  initialState,
  reducers: {
    setFirms: (state, action) => {
      state.firms = action.payload;
    },
    setSelectedFirmId: (state, action) => {
      state.selectedFirmId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedFirmId', action.payload);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFirmsDropdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFirmsDropdown.fulfilled, (state, action) => {
        state.loading = false;
        state.firms = action.payload;
      })
      .addCase(loadFirmsDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFirms, setSelectedFirmId, setLoading, setError } = firmSlice.actions;

export default firmSlice.reducer;
