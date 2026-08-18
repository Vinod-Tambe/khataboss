import axiosInstance from "./axiosInstance";

/** Build FormData for loan/stock item image upload (supports re-upload + old image cleanup). */
export const buildItemImageFormData = (file, { previousImage, stId, girvId } = {}) => {
  const formData = new FormData();
  formData.append("itemImage", file);
  if (previousImage) {
    formData.append(
      "previousImage",
      typeof previousImage === "string" ? previousImage : JSON.stringify(previousImage)
    );
  }
  if (stId != null && stId !== "") formData.append("st_id", String(stId));
  if (girvId != null && girvId !== "") formData.append("girv_id", String(girvId));
  return formData;
};

export const addGirvi = async (girviData) => {
  try {
    const response = await axiosInstance.post("/girvi", girviData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadItemImage = async (formData) => {
  try {
    const response = await axiosInstance.post("/girvi/upload-item-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

export const deleteGirvi = async (id) => {
  try {
    const response = await axiosInstance.delete(`/girvi/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
