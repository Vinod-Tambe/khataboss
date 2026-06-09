import axiosInstance from "./axiosInstance";

export const addGirvi = async (girviData) => {
  try {
    const response = await axiosInstance.post("/girvi", girviData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getGirvis = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/girvi", { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getGirviById = async (id) => {
  try {
    const response = await axiosInstance.get(`/girvi/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
