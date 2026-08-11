import axiosInstance from "./axiosInstance";

export const getJournalBookEntries = async (firmId = "all") => {
  try {
    const params = {};
    if (firmId != null && firmId !== "" && String(firmId).toLowerCase() !== "all") {
      params.firmId = firmId;
    }
    const response = await axiosInstance.get(`/journal-book`, { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Error fetching journal book entries."
    );
  }
};
