import axiosInstance from "./axiosInstance";

export const getRates = async (firmId) => {
  const url = firmId && firmId !== 'all' ? `/rate?firmId=${firmId}` : `/rate`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const createRate = async (rateData) => {
  const response = await axiosInstance.post(`/rate`, rateData);
  return response.data;
};

export const updateRate = async (uuid, rateData) => {
  const response = await axiosInstance.put(`/rate/${uuid}`, rateData);
  return response.data;
};

export const deleteRate = async (uuid) => {
  const response = await axiosInstance.delete(`/rate/${uuid}`);
  return response.data;
};
