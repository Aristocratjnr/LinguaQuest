// API Configuration
export const getApiBaseUrl = (): string => {
  // In production (Vercel), use the production backend
  if (typeof (globalThis as any).__BACKEND_URL__ !== 'undefined') {
    return (globalThis as any).__BACKEND_URL__;
  }
  
  // Fallback for development
  return 'http://localhost:8000';
};

// Check if we're in production (using the optimized backend)
export const isProduction = (): boolean => {
  return typeof (globalThis as any).__BACKEND_URL__ !== 'undefined';
};

// Export the base URL for use in components
export const API_BASE_URL = getApiBaseUrl();

// Different endpoints have different prefixes in the optimized version
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  
  // FastAPI server endpoints (development and production)
  if (endpoint.startsWith('users/')) {
    // Map to FastAPI server endpoints under /api/v1
    return `${baseUrl}/api/v1/${endpoint}`;
  } else {
    return `${baseUrl}/${endpoint}`;
  }
};