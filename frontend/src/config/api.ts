// API Configuration
export const getApiBaseUrl = (): string => {
  // In production (Vercel), use the production backend
  if (typeof (globalThis as any).__BACKEND_URL__ !== 'undefined') {
    return (globalThis as any).__BACKEND_URL__;
  }
  // Fallback for development
  return 'http://127.0.0.1:8000';
};

// Export the base URL for use in components
export const API_BASE_URL = getApiBaseUrl();

// Different endpoints have different prefixes in the optimized version
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();

  // Endpoints that use /api/v1 prefix (mainly engagement/game features)
  const v1Endpoints = ['streak', 'level', 'leaderboard', 'badges', 'scores', 'sessions', 'stats', 'progression'];
  
  // Check if this endpoint needs the /api/v1 prefix
  const needsV1Prefix = v1Endpoints.some(v1Endpoint => endpoint.startsWith(v1Endpoint));
  
  if (needsV1Prefix) {
    return `${baseUrl}/api/v1/${endpoint}`;
  } else {
    return `${baseUrl}/${endpoint}`;
  }
};