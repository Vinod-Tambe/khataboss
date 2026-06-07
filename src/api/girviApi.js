import axiosInstance from "./axiosInstance";

export const addGirvi = async (girviData) => {
  try {
    const response = await axiosInstance.post("/girvi", girviData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getGirvis = async (firmId) => {
  try {
    const params = firmId ? { firmId } : {};
    const response = await axiosInstance.get("/girvi", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
