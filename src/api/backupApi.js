import axiosInstance from "./axiosInstance";

export const getBackups = async () => {
  const response = await axiosInstance.get("/backup");
  return response.data;
};

export const createBackup = async () => {
  const response = await axiosInstance.post("/backup", {}, { responseType: "blob" });
  return response;
};

export const restoreBackup = async (formData) => {
  const response = await axiosInstance.post("/backup/restore", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const downloadBackup = async (id) => {
  const response = await axiosInstance.get(`/backup/${id}/download`, {
    responseType: "blob",
  });
  return response;
};

export const deleteBackup = async (id) => {
  const response = await axiosInstance.delete(`/backup/${id}`);
  return response.data;
};
