/**
 * Tenant Utility Functions
 * Handles subdomain-based multi-tenancy
 */

// Get the current hostname
const getHostname = () => {
  return window.location.hostname;
};

// Extract tenant subdomain from URL
// Examples:
// - vinod.localhost:3000 -> vinod
// - vinod.khataboss.com -> vinod
// - localhost:3000 -> null (default tenant)
export const getTenantFromUrl = () => {
  const hostname = getHostname();
  
  // Development environment (localhost)
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    // If it's localhost:3000 or 127.0.0.1, return null (default)
    if (parts.length === 1 || parts[0] === 'localhost' || parts[0] === '127') {
      return null;
    }
    // For vinod.localhost:3000, parts[0] is 'vinod'
    return parts[0];
  }
  
  // Production environment (e.g., vinod.khataboss.com)
  // Assuming format: tenant.domain.com
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // Return first part (subdomain)
    return parts[0];
  }
  
  return null;
};

// Get the full tenant URL
export const getTenantUrl = (tenant) => {
  const hostname = getHostname();
  
  if (hostname.includes('localhost')) {
    return `http://${tenant}.localhost:3000`;
  }
  
  return `https://${tenant}.khataboss.com`;
};

// Check if running in development mode
export const isDevelopment = () => {
  const hostname = getHostname();
  return hostname.includes('localhost') || hostname.includes('127.0.0.1');
};

// Get API base URL based on tenant
export const getApiBaseUrl = () => {
  const tenant = getTenantFromUrl();
  
  if (isDevelopment()) {
    // For development, use a mock API or local server
    return tenant ? `/api/tenants/${tenant}` : '/api';
  }
  
  // For production
  return tenant ? `https://api.${tenant}.khataboss.com` : 'https://api.khataboss.com';
};

// Get tenant configuration
export const getTenantConfig = (tenant) => {
  // Default tenant configuration
  const defaultConfig = {
    name: 'KhataBoss',
    logo: null,
    primaryColor: '#6c757d', // Bootstrap secondary color
    secondaryColor: '#ffffff',
  };
  
  // If no tenant, return default config
  if (!tenant) {
    return defaultConfig;
  }
  
  // Tenant-specific configurations
  const tenantConfigs = {
    vinod: {
      name: 'Vinod Enterprise',
      logo: null,
      primaryColor: '#0d6efd', // Bootstrap primary blue
      secondaryColor: '#ffffff',
    },
    // Add more tenants here as needed
    // example: {
    //   name: 'Example Company',
    //   logo: '/logos/example.png',
    //   primaryColor: '#198754',
    //   secondaryColor: '#ffffff',
    // }
  };
  
  return tenantConfigs[tenant] || { ...defaultConfig, name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)}'s Account` };
};

// Store tenant in localStorage
export const setTenantStorage = (tenant) => {
  localStorage.setItem('tenant', tenant || '');
};

// Get tenant from localStorage
export const getTenantStorage = () => {
  return localStorage.getItem('tenant') || null;
};

// Clear tenant from localStorage
export const clearTenantStorage = () => {
  localStorage.removeItem('tenant');
};
