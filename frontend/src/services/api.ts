import axios from 'axios';
import { API_BASE_URL, getApiUrl, getApiBaseUrl } from '../config/api';

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
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/engagement/user`;
    const response = await axios.post(url, userData);
    return response.data;
  },

  // Get user by nickname
  getUser: async (nickname: string): Promise<User> => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/engagement/user`;
    const response = await axios.get(url, {
      params: { nickname }
    });
    return response.data;
  },

  // Update user profile (not available in Express server, using placeholder)
  updateUser: async (nickname: string, userData: UserUpdate): Promise<User> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return {
      id: 1,
      nickname,
      ...userData,
      created_at: new Date().toISOString(),
      is_active: true,
      preferences: {}
    } as User;
  },

  // Record user login (not available in Express server, using placeholder)
  login: async (nickname: string): Promise<{ success: boolean; message: string }> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return { success: true, message: 'Login recorded' };
  },

  // Get user activity history (not available in Express server, using placeholder)
  getActivities: async (nickname: string, limit: number = 50): Promise<Activity[]> => {
    // This endpoint doesn't exist in the Express server
    // Returning an empty array for now
    return [];
  },

  // Validate username
  validateUsername: async (nickname: string): Promise<{ valid: boolean; reason: string }> => {
    // Use the correct endpoint for the Express server
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/engagement/validate_username`;
    const response = await axios.get(url, {
      params: { nickname }
    });
    return response.data;
  },
};

// Game API
export const gameApi = {
  // Submit score (not available in Express server, using placeholder)
  submitScore: async (nickname: string, scoreData: ScoreCreate): Promise<Score> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return {
      id: 1,
      user_id: 1,
      score: scoreData.score,
      game_session_id: scoreData.game_session_id,
      created_at: new Date().toISOString()
    } as Score;
  },

  // Start game session (not available in Express server, using placeholder)
  startSession: async (nickname: string, sessionData: GameSessionCreate): Promise<GameSession> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return {
      id: 1,
      user_id: 1,
      session_id: sessionData.session_id || 'session-1',
      start_time: new Date().toISOString(),
      total_score: 0,
      rounds_played: 0,
      status: 'active'
    } as GameSession;
  },

  // End game session (not available in Express server, using placeholder)
  endSession: async (sessionId: string, sessionData: GameSessionUpdate): Promise<GameSession> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return {
      id: 1,
      user_id: 1,
      session_id: sessionId,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      total_score: sessionData.total_score || 0,
      rounds_played: sessionData.rounds_played || 0,
      status: sessionData.status || 'completed'
    } as GameSession;
  },

  // Get user stats
  getUserStats: async (nickname: string): Promise<UserStats> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return {
      total_score: 0,
      games_played: 0,
      highest_score: 0,
      current_streak: 0,
      longest_streak: 0,
      total_rounds_played: 0,
      total_rounds_won: 0,
      badges_count: 0,
      favorite_language: 'en',
      win_rate: 0
    } as UserStats;
  },

  // Get leaderboard
  getLeaderboard: async (limit: number = 10, offset: number = 0, sortBy: string = 'total_score', sortDir: string = 'desc'): Promise<LeaderboardEntry[]> => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/engagement/leaderboard`;
    const response = await axios.get(url);
    return response.data;
  },
};

// Engagement API
export const engagementApi = {
  // Increment user streak
  incrementStreak: async (nickname: string): Promise<Streak> => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/engagement/update`;
    const response = await axios.post(url, { nickname, streak: 1 });
    return response.data;
  },

  // Reset user streak
  resetStreak: async (nickname: string): Promise<Streak> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return { current_streak: 0, highest_streak: 0, last_activity_date: new Date().toISOString() };
  },

  // Award badge to user
  awardBadge: async (nickname: string, badgeType: string, badgeName: string, badgeDescription?: string): Promise<Badge> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return { type: badgeType, name: badgeName, description: badgeDescription };
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
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return [
      { id: '1', label: 'Beginner', unlocked: true },
      { id: '2', label: 'Intermediate', unlocked: false },
      { id: '3', label: 'Advanced', unlocked: false }
    ] as ProgressionStage[];
  },

  // Update progression stage
  updateProgression: async (nickname: string, stageId: string, unlocked: boolean): Promise<ProgressionStage> => {
    // This endpoint doesn't exist in the Express server
    // Returning a mock response for now
    return { id: stageId, label: 'Stage', unlocked } as ProgressionStage;
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