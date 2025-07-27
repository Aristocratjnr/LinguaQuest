// API Configuration
export const getApiBaseUrl = (): string => {
  let apiUrl = '';
  
  // Check for environment variables first (for Vercel deployment)
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('[API Config] Using NEXT_PUBLIC_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // Check for Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
    console.log('[API Config] Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // Check if we're in production (Vercel deployment)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    // Use the Render backend URL
    apiUrl = 'https://linguaquest.onrender.com';
    console.log('[API Config] Using production URL (Vercel detected):', apiUrl);
    return apiUrl;
  }
  
  // Check for explicitly set backend URL
  if (typeof (globalThis as any).__BACKEND_URL__ !== 'undefined') {
    apiUrl = (globalThis as any).__BACKEND_URL__;
    console.log('[API Config] Using globalThis.__BACKEND_URL__:', apiUrl);
    return apiUrl;
  }
  
  // Fallback for development
  apiUrl = 'http://127.0.0.1:8001';
  console.log('[API Config] Using development fallback:', apiUrl);
  return apiUrl;
};

// Check if we're in production
export const isProduction = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('vercel.app') || 
          window.location.hostname.includes('netlify.app') ||
          window.location.protocol === 'https:' && window.location.hostname !== 'localhost');
};

// Export the base URL for use in components
export const API_BASE_URL = getApiBaseUrl();

// Different endpoints have different prefixes in the optimized version
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const isProd = isProduction();

  // In production, all endpoints are at the root level
  if (isProd) {
    return `${baseUrl}/${endpoint}`;
  }
  
  // In development, some endpoints use /api/v1 prefix
  const v1Endpoints = ['streak', 'level', 'leaderboard', 'badges', 'scores', 'sessions', 'stats', 'progression'];
  const needsV1Prefix = v1Endpoints.some(v1Endpoint => endpoint.startsWith(v1Endpoint));
  
  if (needsV1Prefix) {
    return `${baseUrl}/api/v1/${endpoint}`;
  } else {
    return `${baseUrl}/${endpoint}`;
  }
};