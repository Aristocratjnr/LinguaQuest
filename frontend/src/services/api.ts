import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  total_score: number;
  games_played: number;
  current_streak: number;
  highest_streak: number;
}

export interface UserCreate {
  nickname: string;
  avatar_url?: string;
}

export interface UserUpdate {
  avatar_url?: string;
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
  average_score: number;
  highest_score: number;
  current_streak: number;
  highest_streak: number;
  total_rounds_played: number;
  badges_count: number;
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
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Get user by nickname
  getUser: async (nickname: string): Promise<User> => {
    const response = await api.get(`/users/${nickname}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (nickname: string, userData: UserUpdate): Promise<User> => {
    const response = await api.put(`/users/${nickname}`, userData);
    return response.data;
  },

  // Record user login
  login: async (nickname: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/users/${nickname}/login`);
    return response.data;
  },

  // Get user activity history
  getActivities: async (nickname: string, limit: number = 50): Promise<Activity[]> => {
    const response = await api.get(`/users/${nickname}/activities?limit=${limit}`);
    return response.data;
  },

  // Validate username
  validateUsername: async (nickname: string): Promise<{ valid: boolean; reason: string }> => {
    const response = await api.get(`/users/validate?nickname=${encodeURIComponent(nickname)}`);
    return response.data;
  },
};

// Game API
export const gameApi = {
  // Submit score
  submitScore: async (nickname: string, scoreData: ScoreCreate): Promise<Score> => {
    const response = await api.post(`/scores?nickname=${encodeURIComponent(nickname)}`, scoreData);
    return response.data;
  },

  // Get user score history
  getScoreHistory: async (nickname: string, limit: number = 50): Promise<Score[]> => {
    const response = await api.get(`/scores/${nickname}?limit=${limit}`);
    return response.data;
  },

  // Get user's highest score
  getHighestScore: async (nickname: string): Promise<Score> => {
    const response = await api.get(`/scores/${nickname}/highest`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (
    limit: number = 100,
    offset: number = 0,
    sortBy: 'score' | 'streak' | 'level' = 'score',
    sortDir: 'asc' | 'desc' = 'desc'
  ): Promise<LeaderboardEntry[]> => {
    const response = await api.get(
      `/leaderboard?limit=${limit}&offset=${offset}&sort_by=${sortBy}&sort_dir=${sortDir}`
    );
    return response.data;
  },

  // Start game session
  startSession: async (nickname: string, sessionData: GameSessionCreate): Promise<GameSession> => {
    const response = await api.post(`/sessions?nickname=${encodeURIComponent(nickname)}`, sessionData);
    return response.data;
  },

  // End game session
  endSession: async (sessionId: string, sessionData: GameSessionUpdate): Promise<GameSession> => {
    const response = await api.put(`/sessions/${sessionId}`, sessionData);
    return response.data;
  },

  // Get session details
  getSession: async (sessionId: string): Promise<GameSession> => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (nickname: string): Promise<UserStats> => {
    const response = await api.get(`/stats/${nickname}`);
    return response.data;
  },
};

// Engagement API
// Progression API
export const progressionApi = {
  // Get user progression stages
  getProgression: async (nickname: string): Promise<ProgressionStage[]> => {
    const response = await api.get(`/progression/${nickname}`);
    return response.data;
  },
};

export const engagementApi = {
  // Get user streak
  getStreak: async (nickname: string): Promise<{ streak: number }> => {
    const response = await api.get(`/streak?nickname=${encodeURIComponent(nickname)}`);
    return response.data;
  },

  // Update streak
  updateStreak: async (nickname: string, streak: number): Promise<{ streak: number }> => {
    const response = await api.patch(`/streak?nickname=${encodeURIComponent(nickname)}&streak=${streak}`);
    return response.data;
  },

  // Increment streak
  incrementStreak: async (nickname: string): Promise<{ streak: number }> => {
    const response = await api.post(`/streak/increment?nickname=${encodeURIComponent(nickname)}`);
    return response.data;
  },

  // Reset streak
  resetStreak: async (nickname: string): Promise<{ streak: number }> => {
    const response = await api.post(`/streak/reset?nickname=${encodeURIComponent(nickname)}`);
    return response.data;
  },

  // Get user level
  getLevel: async (nickname: string): Promise<{ level: number }> => {
    const response = await api.get(`/level?nickname=${encodeURIComponent(nickname)}`);
    return response.data;
  },

  // Update level
  updateLevel: async (nickname: string, level: number): Promise<{ level: number }> => {
    const response = await api.patch(`/level?nickname=${encodeURIComponent(nickname)}&level=${level}`);
    return response.data;
  },

  // Get user badges
  getBadges: async (nickname: string): Promise<{ badges: Badge[] }> => {
    const response = await api.get(`/badges/${nickname}`);
    return response.data;
  },

  // Award badge
  awardBadge: async (nickname: string, badgeType: string, badgeName: string, badgeDescription?: string): Promise<{ message: string; badge?: Badge }> => {
    const params = new URLSearchParams({
      badge_type: badgeType,
      badge_name: badgeName,
    });
    if (badgeDescription) {
      params.append('badge_description', badgeDescription);
    }
    const response = await api.post(`/badges/${nickname}?${params.toString()}`);
    return response.data;
  },

  // Get quotes
  getQuotes: async (): Promise<string[]> => {
    const response = await api.get('/quotes');
    return response.data;
  },

  // Get tips
  getTips: async (): Promise<string[]> => {
    const response = await api.get('/tips');
    return response.data;
  },
};

// Legacy API (for backward compatibility)
export const legacyApi = {
  // Submit score (legacy endpoint)
  submitScore: async (scoreData: { name: string; score: number; date: string; avatar?: string }): Promise<any> => {
    const response = await axios.post('http://127.0.0.1:8000/score', scoreData);
    return response.data;
  },

  // Get leaderboard (legacy endpoint)
  getLeaderboard: async (): Promise<{ leaderboard: any[] }> => {
    const response = await axios.get('http://127.0.0.1:8000/leaderboard');
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status === 400) {
    return 'Invalid request';
  }
  if (error.response?.status === 500) {
    return 'Server error';
  }
  return error.message || 'An unexpected error occurred';
};

// Local storage utilities
export const storage = {
  getNickname: (): string | null => {
    return localStorage.getItem('lq_nickname');
  },
  
  setNickname: (nickname: string): void => {
    localStorage.setItem('lq_nickname', nickname);
  },
  
  getAvatar: (): string | null => {
    return localStorage.getItem('lq_avatar');
  },
  
  setAvatar: (avatar: string): void => {
    localStorage.setItem('lq_avatar', avatar);
  },
  
  getSessionId: (): string | null => {
    return localStorage.getItem('lq_session_id');
  },
  
  setSessionId: (sessionId: string): void => {
    localStorage.setItem('lq_session_id', sessionId);
  },
  
  clearSession: (): void => {
    localStorage.removeItem('lq_session_id');
  },

  getLanguage: (): string | null => {
    return localStorage.getItem('lq_language');
  },

  setLanguage: (language: string): void => {
    localStorage.setItem('lq_language', language);
  },
};

export default api;
