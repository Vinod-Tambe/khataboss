import axiosInstance from "./axiosInstance";

export const addRelease = async (payload) => {
  try {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await axiosInstance.post("/release", payload, isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined);
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

export const getReleaseUsers = async ({ firmId, girvId, search } = {}) => {
  try {
    const response = await axiosInstance.get("/release/users", {
      params: { firmId, girvId, search },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
