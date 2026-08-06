import axiosInstance from "./axiosInstance";

export const addGirvi = async (girviData) => {
  try {
    const response = await axiosInstance.post("/girvi", girviData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateGirvi = async (id, girviData) => {
  try {
    const response = await axiosInstance.put(`/girvi/${id}`, girviData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const transferLoan = async (id, formData) => {
  try {
    const response = await axiosInstance.post(`/girvi/${id}/transfer`, formData);
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

export const getGirvisDropdown = async (userId, filters = {}) => {
  try {
    const response = await axiosInstance.get(`/girvi/dropdown/${userId}`, { params: filters });
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
