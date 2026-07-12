import axiosInstance from "./axiosInstance";

export const createPurity = async (purityData) => {
  const response = await axiosInstance.post("/purity", purityData);
  return response.data;
};

export const getPurities = async (metal = "") => {
  const response = await axiosInstance.get(`/purity?metal=${metal}`);
  return response.data;
};

export const updatePurity = async (uuid, purityData) => {
  const response = await axiosInstance.put(`/purity/${uuid}`, purityData);
  return response.data;
};

export const deletePurity = async (uuid) => {
  const response = await axiosInstance.delete(`/purity/${uuid}`);
  return response.data;
};
