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
    const response = await axios.post(getApiUrl('users'), userData);
    return response.data;
  },

  // Get user by nickname
  getUser: async (nickname: string): Promise<User> => {
    const response = await axios.get(getApiUrl(`users/${nickname}`));
    return response.data;
  },

  // Update user profile
  updateUser: async (nickname: string, userData: UserUpdate): Promise<User> => {
    const response = await axios.put(getApiUrl(`users/${nickname}`), userData);
    return response.data;
  },

  // Record user login
  login: async (nickname: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(getApiUrl(`users/${nickname}/login`));
    return response.data;
  },

  // Get user activity history
  getActivities: async (nickname: string, limit: number = 50): Promise<Activity[]> => {
    const response = await api.get(`/users/${nickname}/activities?limit=${limit}`);
    return response.data;
  },

  // Validate username
  validateUsername: async (nickname: string): Promise<{ valid: boolean; reason: string }> => {
    const response = await axios.get(getApiUrl('users/validate'), {
      params: { nickname }
    });
    return response.data;
  },
};

// Game API
export const gameApi = {
  // Submit score
  submitScore: async (nickname: string, scoreData: ScoreCreate): Promise<Score> => {
    const response = await axios.get(getApiUrl(`scores?nickname=${encodeURIComponent(nickname)}`), {
      method: 'POST',
      data: scoreData
    });
    return response.data;
  },

  // Start game session
  startSession: async (nickname: string, sessionData: GameSessionCreate): Promise<GameSession> => {
    const response = await axios.post(getApiUrl(`sessions?nickname=${encodeURIComponent(nickname)}`), sessionData);
    return response.data;
  },

  // End game session
  endSession: async (sessionId: string, sessionData: GameSessionUpdate): Promise<GameSession> => {
    const response = await axios.put(getApiUrl(`sessions/${sessionId}`), sessionData);
    return response.data;
  },

  // Get user stats
  getUserStats: async (nickname: string): Promise<UserStats> => {
    const response = await axios.get(getApiUrl(`stats/${nickname}`));
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit: number = 10, offset: number = 0, sortBy: string = 'total_score', sortDir: string = 'desc'): Promise<LeaderboardEntry[]> => {
    const response = await axios.get(getApiUrl(`leaderboard?limit=${limit}&offset=${offset}&sort_by=${sortBy}&sort_dir=${sortDir}`));
    return response.data;
  },
};

// Engagement API
export const engagementApi = {
  // Increment user streak
  incrementStreak: async (nickname: string): Promise<Streak> => {
    const response = await api.post(`/streak/${nickname}/increment`);
    return response.data;
  },

  // Reset user streak
  resetStreak: async (nickname: string): Promise<Streak> => {
    const response = await api.post(`/streak/${nickname}/reset`);
    return response.data;
  },

  // Award badge to user
  awardBadge: async (nickname: string, badgeType: string, badgeName: string, badgeDescription?: string): Promise<Badge> => {
    const response = await api.post(`/badges/${nickname}`, {
      type: badgeType,
      name: badgeName,
      description: badgeDescription
    });
    return response.data;
  },
};

// Storage utility
export const storage = {
  // Nickname storage
  getNickname: (): string => {
    return localStorage.getItem('linguaquest_nickname') || '';
  },
  
  setNickname: (nickname: string): void => {
    localStorage.setItem('linguaquest_nickname', nickname);
  },

  // Avatar storage
  getAvatar: (): string => {
    return localStorage.getItem('linguaquest_avatar') || '';
  },
  
  setAvatar: (avatar: string): void => {
    localStorage.setItem('linguaquest_avatar', avatar);
  },

  // Language storage
  getLanguage: (): string => {
    return localStorage.getItem('linguaquest_language') || '';
  },
  
  setLanguage: (language: string): void => {
    localStorage.setItem('linguaquest_language', language);
  },

  // Session storage
  getSessionId: (): string => {
    return sessionStorage.getItem('linguaquest_session_id') || '';
  },
  
  setSessionId: (sessionId: string): void => {
    sessionStorage.setItem('linguaquest_session_id', sessionId);
  },
  
  clearSession: (): void => {
    sessionStorage.removeItem('linguaquest_session_id');
  },
};

// Progression API
export const progressionApi = {
  // Get user progression
  getProgression: async (nickname: string): Promise<ProgressionStage[]> => {
    const response = await api.get(`/progression/${nickname}`);
    return response.data;
  },

  // Update progression stage
  updateProgression: async (nickname: string, stageId: string, unlocked: boolean): Promise<ProgressionStage> => {
    const response = await api.post(`/progression/${nickname}/${stageId}`, { unlocked });
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || error.response.data?.detail || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};