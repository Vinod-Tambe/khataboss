import axiosInstance from './axiosInstance';

export const getDaybookEntries = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/daybook', { params: filters });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    const message =
      data?.message ||
      data?.error ||
      error.message ||
      'Failed to fetch daybook';
    throw new Error(message);
  }
};
