// API Configuration
export const getApiBaseUrl = (): string => {
  // 1. Prefer environment variable injected at build time (Vite/CRA)
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL || (process.env as any).REACT_APP_BACKEND_URL;
  if (envUrl) return envUrl;

  // 2. Check for global variable injected at runtime (e.g. set in index.html before bundle)
  if (typeof (globalThis as any).__BACKEND_URL__ !== 'undefined') {
    return (globalThis as any).__BACKEND_URL__;
  }

  // 3. Fallback to same-origin (assumes backend and frontend served together)
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  // 4. Last resort: localhost for dev
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