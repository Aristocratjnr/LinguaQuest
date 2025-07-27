// Quick test to verify API URL configuration
import { getApiUrl, getApiBaseUrl, isProduction } from './src/config/api.js';

console.log('=== API Configuration Test ===');
console.log('Base URL:', getApiBaseUrl());
console.log('Is Production:', isProduction());
console.log('User validation URL:', getApiUrl('users/validate'));
console.log('Scores URL:', getApiUrl('scores'));
console.log('Streak URL:', getApiUrl('streak/testuser/increment'));
