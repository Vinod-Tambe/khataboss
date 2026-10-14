import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFirmsDropdown } from '../../api/firmApi';

const savedFirmId = typeof window !== 'undefined' ? (localStorage.getItem('selectedFirmId') || 'all') : 'all';

export const resolveSelectedFirm = (firms, selectedFirmId) => {
  if (!selectedFirmId || selectedFirmId === 'all' || !Array.isArray(firms)) {
    return null;
  }
  return firms.find((firm) => String(firm.firm_id) === String(selectedFirmId)) || null;
};

/** Firm id for list/API filters; null when header is on "All Firm". */
export const resolveActiveFirmFilterId = (selectedFirmId) => {
  if (!selectedFirmId || selectedFirmId === 'all') return null;
  return selectedFirmId;
};

export const rowMatchesFirmFilter = (rowFirmId, selectedFirmId) => {
  const filterId = resolveActiveFirmFilterId(selectedFirmId);
  if (!filterId) return true;
  if (rowFirmId == null) return false;
  return String(rowFirmId) === String(filterId);
};

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
  selectedFirm: null,
  loading: false,
  error: null,
};

const syncSelectedFirm = (state) => {
  state.selectedFirm = resolveSelectedFirm(state.firms, state.selectedFirmId);
};

const firmSlice = createSlice({
  name: 'firm',
  initialState,
  reducers: {
    setFirms: (state, action) => {
      state.firms = action.payload;
      syncSelectedFirm(state);
    },
    setSelectedFirmId: (state, action) => {
      state.selectedFirmId = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedFirmId', action.payload);
      }
      syncSelectedFirm(state);
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
        syncSelectedFirm(state);
      })
      .addCase(loadFirmsDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFirms, setSelectedFirmId, setLoading, setError } = firmSlice.actions;

export default firmSlice.reducer;
