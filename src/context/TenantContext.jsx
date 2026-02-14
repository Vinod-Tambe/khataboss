import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getTenantFromUrl, 
  getTenantConfig, 
  setTenantStorage, 
  getTenantStorage,
  clearTenantStorage,
  isDevelopment 
} from '../utils/tenantUtils';

// Create Context
const TenantContext = createContext();

// Create Provider
export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [tenantConfig, setTenantConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize tenant on app load
  useEffect(() => {
    const initializeTenant = () => {
      // First, try to get tenant from URL
      let currentTenant = getTenantFromUrl();
      
      // If no tenant in URL, check localStorage
      if (!currentTenant) {
        const storedTenant = getTenantStorage();
        if (storedTenant) {
          currentTenant = storedTenant;
        }
      }
      
      // Set tenant state
      setTenant(currentTenant);
      
      // Get tenant configuration
      const config = getTenantConfig(currentTenant);
      setTenantConfig(config);
      
      // Store tenant in localStorage
      setTenantStorage(currentTenant);
      
      setLoading(false);
    };

    initializeTenant();
  }, []);

  // Function to switch tenant (useful for testing or admin panels)
  const switchTenant = (newTenant) => {
    setTenant(newTenant);
    const config = getTenantConfig(newTenant);
    setTenantConfig(config);
    setTenantStorage(newTenant);
  };

  // Function to clear tenant
  const clearTenant = () => {
    setTenant(null);
    setTenantConfig(getTenantConfig(null));
    clearTenantStorage();
  };

  // Check if tenant is active
  const isTenantActive = () => {
    return tenant !== null;
  };

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      tenantConfig, 
      loading,
      switchTenant,
      clearTenant,
      isTenantActive,
      isDevelopment: isDevelopment()
    }}>
      {children}
    </TenantContext.Provider>
  );
};

// Custom hook for easier access
export const useTenant = () => useContext(TenantContext);

export default TenantContext;
