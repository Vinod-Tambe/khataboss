import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  firms: [],
  selectedFirmId: 'all',
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
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setFirms, setSelectedFirmId, setLoading, setError } = firmSlice.actions;

export default firmSlice.reducer;
