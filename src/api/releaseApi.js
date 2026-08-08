import axiosInstance from "./axiosInstance";

export const addRelease = async (payload) => {
  try {
    const response = await axiosInstance.post("/release", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteRelease = async (rel_id) => {
  try {
    const response = await axiosInstance.delete(`/release/${rel_id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
