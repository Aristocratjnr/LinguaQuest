// API Configuration
export const getApiBaseUrl = (): string => {
  // In production (Vercel), use the production backend
  if (typeof __BACKEND_URL__ !== 'undefined') {
    return __BACKEND_URL__;
  }
  // Fallback for development
  return 'http://127.0.0.1:8000';
};

// Export the base URL for use in components
export const API_BASE_URL = getApiBaseUrl();
