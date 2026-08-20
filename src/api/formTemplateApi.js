import axiosInstance from './axiosInstance';

const errMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message;

export const getFormTemplates = async () => {
  try {
    const response = await axiosInstance.get('/form-templates/templates');
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const getFormTemplate = async (firmId) => {
  try {
    const response = await axiosInstance.get('/form-templates/template', {
      params: { firmId },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const updateFormTemplate = async (uuid, payload) => {
  try {
    const response = await axiosInstance.put(`/form-templates/templates/${uuid}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};
