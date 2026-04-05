import axiosInstance from './axiosInstance';

/**
 * Login with credentials
 * @param {string} login_id - User email, mobile or login ID
 * @param {string} password - User password
 * @returns {Promise} - Response object with user details and token
 */
export const loginWithCredentials = async (login_id, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      login_id,
      password,
    });

    // The response data contains token and user details nested in 'data'
    const responseData = response.data.data || response.data;
    return {
      success: true,
      token: responseData.token,
      user: responseData.user || responseData.owner, // Adjust based on your API response structure
      message: response.data.message || responseData.message || response.data.msg, 
    };
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.msg || error.message;
    throw new Error(message);
  }
};

/**
 * Logout logic - can be used to notify backend if needed
 */
export const logoutApi = async () => {
  // If backend has a logout endpoint, call it here
  // const response = await axiosInstance.post('/auth/logout');
  return { success: true, message: 'Logged out successfully' };
};

/**
 * Send OTP to user's mobile/email
 * @param {string} own_login_id - User email, mobile or login ID
 * @returns {Promise} - Response object with message
 */
export const sendOtp = async (own_login_id) => {
  try {
    const response = await axiosInstance.post('/auth/send-otp', {
      own_login_id,
    });
    return {
      success: true,
      message: response.data.message || response.data.msg,
      data: response.data,
    };
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.msg || error.message;
    throw new Error(message);
  }
};

/**
 * Verify OTP and login user
 * @param {string} own_login_id - User email, mobile or login ID
 * @param {string} otp - User OTP
 * @returns {Promise} - Response object with user details and token
 */
export const verifyAndLogin = async (own_login_id, otp) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', {
      own_login_id,
      otp,
    });
    // The response data contains token and user details nested in 'data'
    const responseData = response.data.data || response.data;
    return {
      success: true,
      token: responseData.token,
      user: responseData.user || responseData.owner,
      message: response.data.message || responseData.message || response.data.msg,
    };
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.msg || error.message;
    throw new Error(message);
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await axiosInstance.get('/auth/verify-token');
    return { valid: true, data: response.data };
  } catch (error) {
    return { valid: false };
  }
};
