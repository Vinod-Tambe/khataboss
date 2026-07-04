import axiosInstance from "./axiosInstance";

export const addDeposit = async (payload) => {
  try {
    const response = await axiosInstance.post("/deposit", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
