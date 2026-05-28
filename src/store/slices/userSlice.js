import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedUser: JSON.parse(localStorage.getItem('selectedUser')) || null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      localStorage.setItem('selectedUser', JSON.stringify(action.payload));
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      localStorage.removeItem('selectedUser');
    },
  },
});

export const { setSelectedUser, clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;
