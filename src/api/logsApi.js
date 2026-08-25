import axiosInstance from "./axiosInstance";

export const getActivityLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/logs", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getHeaderAlerts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/logs/alerts", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
