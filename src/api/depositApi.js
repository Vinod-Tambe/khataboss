import axiosInstance from "./axiosInstance";

export const addDeposit = async (payload) => {
  try {
    const response = await axiosInstance.post("/deposit", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteDeposit = async (dep_id) => {
  try {
    const response = await axiosInstance.delete(`/deposit/${dep_id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
