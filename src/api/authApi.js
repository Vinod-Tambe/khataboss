// API service for authentication
// This file handles all authentication-related API calls
// Using static data for authentication without API

// Static user database - add/edit users here
const STATIC_USERS = [
  {
    id: '1',
    loginId: 'admin1',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@khataboss.com',
    mobile: '9579082528',
    role: 'admin',
    status: 'active',
    otp: '1234'
  },
  {
    id: '2',
    loginId: 'admin',
    password: '123456',
    name: 'Vinod Gokul Tambe',
    email: 'user@khataboss.com',
    mobile: '8010445844',
    role: 'user',
    status: 'active',
    otp: '1234'
  },
  {
    id: '3',
    loginId: 'demo',
    password: '123456',
    name: 'Demo User',
    email: 'demo@khataboss.com',
    mobile: '9999999999',
    role: 'admin',
    status: 'active',
    otp: '1234'
  },
  {
    id: '4',
    loginId: 'inactive',
    password: 'inactive123',
    name: 'Inactive User',
    email: 'inactive@khataboss.com',
    mobile: '8888888888',
    role: 'user',
    status: 'inactive',
    otp: '1234'
  }
];

// Helper function to find user by loginId
const findUserByLoginId = (loginId) => {
  return STATIC_USERS.find(user => 
    user.loginId.toLowerCase() === loginId.toLowerCase() ||
    user.email.toLowerCase() === loginId.toLowerCase() ||
    user.mobile === loginId
  );
};

// Generate a simple token
const generateToken = (user) => {
  return `static-token-${user.id}-${Date.now()}`;
};

// Login with username/password
export const loginWithCredentials = async (loginId, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Find user by loginId
  const user = findUserByLoginId(loginId);

  // Check if user exists
  if (!user) {
    throw new Error('Invalid Login Id or Password');
  }

  // Check password
  if (user.password !== password) {
    throw new Error('Invalid Login Id or Password');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Your account is inactive. Please contact administrator.');
  }

  // Return user data (excluding password)
  const { password: _, otp: __, ...userData } = user;
  
  return {
    success: true,
    user: userData,
    token: generateToken(user),
    message: 'Login successful!'
  };
};

// Login with OTP
export const loginWithOtp = async (loginId, otp) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Find user by loginId
  const user = findUserByLoginId(loginId);

  // Check if user exists
  if (!user) {
    throw new Error('Invalid Login Id');
  }

  // Check OTP
  if (user.otp !== otp) {
    throw new Error('Invalid or expired OTP');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Your account is inactive. Please contact administrator.');
  }

  // Return user data (excluding password and OTP)
  const { password: _, otp: __, ...userData } = user;

  return {
    success: true,
    user: userData,
    token: generateToken(user),
    message: 'Login successful with OTP!'
  };
};

// Send OTP to mobile/email
export const sendOtp = async (loginId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Find user by loginId
  const user = findUserByLoginId(loginId);

  // For security reasons, don't reveal if user exists or not
  // But for demo purposes, we'll show appropriate message
  if (!user) {
    // Don't reveal user doesn't exist for security
    return {
      success: true,
      message: 'If your login ID is registered, you will receive an OTP shortly.',
      // For demo: show OTP for testing
      demoOtp: '123456'
    };
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Your account is inactive. Please contact administrator.');
  }

  return {
    success: true,
    message: `OTP sent successfully to your registered mobile/email!`,
    // For demo purposes, include the OTP in response
    demoOtp: user.otp
  };
};

// Logout API call
export const logoutApi = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return { success: true, message: 'Logged out successfully' };
};

// Verify token validity
export const verifyToken = async (token) => {
  // Check if token exists and is valid format
  if (!token || !token.startsWith('static-token-')) {
    return { valid: false };
  }

  return { valid: true };
};

// Get all static users (for admin purposes - exclude sensitive data)
export const getAllUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return STATIC_USERS.map(({ password, otp, ...user }) => user);
};
