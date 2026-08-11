import axiosInstance from "./axiosInstance";

export const addAdditionalPrincipal = async (payload) => {
  try {
    const response = await axiosInstance.post("/add-prin", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAdditionalPrincipal = async (ap_id) => {
  try {
    const response = await axiosInstance.delete(`/add-prin/${ap_id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
