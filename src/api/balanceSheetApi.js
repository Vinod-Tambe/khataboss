import axiosInstance from './axiosInstance';

export const getBalanceSheetEntries = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/balance-sheet', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
