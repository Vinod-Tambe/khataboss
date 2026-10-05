import axiosInstance from './axiosInstance';

export const getLoanStockDailyLedger = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/stock/loan-stock-ledger', { params: filters });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getInterestDailyLedger = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/stock/interest-ledger', { params: filters });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTransferredLoanDailyLedger = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/stock/transferred-loan-ledger', { params: filters });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStockLedger = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/stock/ledger', { params: filters });
    const body = response.data || {};
    const data = Array.isArray(body.data) ? body.data : [];
    return {
      data,
      total: body.total ?? data.length,
      page: body.page ?? 1,
      limit: body.limit ?? data.length,
      totalPages: body.totalPages ?? 1,
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStockByUuid = async (uuid) => {
  try {
    const response = await axiosInstance.get(
      `/stock/${encodeURIComponent(String(uuid))}`
    );
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
