import axios from 'axios';
import { API_BASE_URL, getApiUrl } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  nickname: string;
  avatar?: string;
  email?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  preferences: Record<string, any>;
}

export interface UserCreate {
  nickname: string;
  avatar?: string;
  email?: string;
}

export interface UserUpdate {
  avatar?: string;
  email?: string;
  preferences?: Record<string, any>;
  preferred_language?: string;
}

export interface Score {
  id: number;
  user_id: number;
  score: number;
  game_session_id?: string;
  created_at: string;
}

export interface ScoreCreate {
  score: number;
  game_session_id?: string;
  details?: Record<string, any>;
}

export interface GameSession {
  id: number;
  user_id: number;
  session_id: string;
  start_time: string;
  end_time?: string;
  total_score: number;
  rounds_played: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface GameSessionCreate {
  session_id?: string;
  category?: string;
  difficulty?: string;
}

export interface GameSessionUpdate {
  end_time?: string;
  total_score?: number;
  rounds_played?: number;
  status?: 'active' | 'completed' | 'abandoned';
}

export interface Activity {
  id: number;
  user_id: number;
  activity_type: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Streak {
  current_streak: number;
  highest_streak: number;
  last_activity_date: string;
}

export interface Badge {
  type: string;
  name: string;
  description?: string;
}

export interface ProgressionStage {
  id: string;
  label: string;
  unlocked: boolean;
  children?: ProgressionStage[];
}

export interface UserStats {
  total_score: number;
  games_played: number;
  highest_score: number;
  current_streak: number;
  longest_streak: number;
  total_rounds_played: number;
  total_rounds_won: number;
  badges_count: number;
  favorite_language: string;
  win_rate: number;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  avatar?: string;
  total_score: number;
  highest_score: number;
  games_played: number;
  current_streak: number;
  longest_streak: number;
  badges_count: number;
  last_activity: string;
  favorite_language: string;
  level: number;
}

// User API
export const userApi = {
  // Create new user
  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  },

  // Get user by nickname
  getUser: async (nickname: string): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/users/${nickname}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (nickname: string, userData: UserUpdate): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/users/${nickname}`, userData);
    return response.data;
  },

  // Record user login
  login: async (nickname: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`${API_BASE_URL}/users/${nickname}/login`);
    return response.data;
  },

  // Get user activity history
  getActivities: async (nickname: string, limit: number = 50): Promise<Activity[]> => {
    const response = await api.get(`/users/${nickname}/activities?limit=${limit}`);
    return response.data;
  },

  // Validate username
  validateUsername: async (nickname: string): Promise<{ valid: boolean; reason: string }> => {
    const url = getApiUrl('users/validate');
    const response = await axios.get(url, {
      params: { nickname }
    });
    return response.data;
  },
};