import axiosInstance from "./axiosInstance";

export const addAuction = async (payload) => {
  try {
    const response = await axiosInstance.post("/auction", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAuctionUsers = async (firmId, search = "") => {
  try {
    const response = await axiosInstance.get("/auction", {
      params: { firmId, search },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
