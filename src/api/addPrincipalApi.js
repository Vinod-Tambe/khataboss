import axiosInstance from "./axiosInstance";

export const addAdditionalPrincipal = async (payload) => {
  try {
    const response = await axiosInstance.post("/add-prin", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
