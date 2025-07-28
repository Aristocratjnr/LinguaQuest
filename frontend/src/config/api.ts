// API Configuration
export const getApiBaseUrl = (): string => {
  // In production (Vercel), use the production backend
  if (typeof (globalThis as any).__BACKEND_URL__ !== 'undefined') {
    return (globalThis as any).__BACKEND_URL__;
  }
  
  // Fallback for development - try port 8000 where the server is running
  return 'http://127.0.0.1:8000';
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
  // All these endpoints use /api/v1 prefix in the FastAPI backend
  const v1Endpoints = ['users', 'scores', 'sessions', 'stats', 'leaderboard', 'streak', 'badges', 'progression', 'clubs'];
  const needsV1Prefix = v1Endpoints.some(v1Endpoint => endpoint.startsWith(v1Endpoint));
  
  if (needsV1Prefix) {
    return `${baseUrl}/api/v1/${endpoint}`;
  } else {
    return `${baseUrl}/${endpoint}`;
  }
};