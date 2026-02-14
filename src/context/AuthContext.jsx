import React, { createContext, useState, useContext } from 'react';

// 1. Create Context
const AuthContext = createContext();

// 2. Create Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // login function
  const login = (userData) => {
    setUser(userData);
  };

  // logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for easier access
export const useAuth = () => useContext(AuthContext);
