import axiosInstance from "./axiosInstance";

export const getJournalBookEntries = async (firmId) => {
  try {
    const response = await axiosInstance.get(`/journal-book`, {
      params: { firmId },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Error fetching journal book entries."
    );
  }
};
