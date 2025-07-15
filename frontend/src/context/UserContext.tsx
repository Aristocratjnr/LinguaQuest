import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userApi, gameApi, engagementApi, storage, User, UserCreate, UserUpdate, ScoreCreate, GameSessionCreate, GameSessionUpdate, UserStats } from '../services/api';

interface UserContextType {
  // User state
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // User actions
  createUser: (userData: UserCreate) => Promise<void>;
  loginUser: (nickname: string) => Promise<void>;
  updateUser: (userData: UserUpdate) => Promise<void>;
  logout: () => void;
  
  // Game actions
  submitScore: (scoreData: ScoreCreate) => Promise<void>;
  startGameSession: (sessionData: GameSessionCreate) => Promise<string>;
  endGameSession: (sessionId: string, sessionData: GameSessionUpdate) => Promise<void>;
  
  // Engagement actions
  incrementStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
  awardBadge: (badgeType: string, badgeName: string, badgeDescription?: string) => Promise<void>;
  
  // Data
  userStats: UserStats | null;
  refreshUserStats: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = async () => {
      const nickname = storage.getNickname();
      if (nickname) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Try to get user from database
          const userData = await userApi.getUser(nickname);
          setUser(userData);
          
          // Record login
          await userApi.login(nickname);
          
          // Load user stats
          await refreshUserStats();
        } catch (err: any) {
          console.error('Failed to initialize user:', err);
          // If user doesn't exist in database, clear localStorage
          storage.setNickname('');
          storage.setAvatar('');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeUser();
  }, []);

  const createUser = async (userData: UserCreate) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newUser = await userApi.createUser(userData);
      setUser(newUser);
      
      // Save to localStorage
      storage.setNickname(newUser.nickname);
      if (userData.avatar_url) {
        storage.setAvatar(userData.avatar_url);
      }
      
      // Load user stats
      await refreshUserStats();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (nickname: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await userApi.getUser(nickname);
      setUser(userData);
      
      // Record login
      await userApi.login(nickname);
      
      // Save to localStorage
      storage.setNickname(nickname);
      
      // Load user stats
      await refreshUserStats();
    } catch (err: any) {
      setError(err.message || 'Failed to login user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: UserUpdate) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = await userApi.updateUser(user.nickname, userData);
      setUser(updatedUser);
      
      // Update localStorage if avatar changed
      if (userData.avatar_url) {
        storage.setAvatar(userData.avatar_url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserStats(null);
    storage.setNickname('');
    storage.setAvatar('');
    storage.clearSession();
  };

  const submitScore = async (scoreData: ScoreCreate) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await gameApi.submitScore(user.nickname, scoreData);
      // Refresh user stats after submitting score
      await refreshUserStats();
    } catch (err: any) {
      setError(err.message || 'Failed to submit score');
      throw err;
    }
  };

  const startGameSession = async (sessionData: GameSessionCreate): Promise<string> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const session = await gameApi.startSession(user.nickname, sessionData);
      storage.setSessionId(session.session_id);
      return session.session_id;
    } catch (err: any) {
      setError(err.message || 'Failed to start game session');
      throw err;
    }
  };

  const endGameSession = async (sessionId: string, sessionData: GameSessionUpdate) => {
    try {
      await gameApi.endSession(sessionId, sessionData);
      storage.clearSession();
      // Refresh user stats after ending session
      await refreshUserStats();
    } catch (err: any) {
      setError(err.message || 'Failed to end game session');
      throw err;
    }
  };

  const incrementStreak = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const result = await engagementApi.incrementStreak(user.nickname);
      setUser(prev => prev ? { ...prev, current_streak: result.streak } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to increment streak');
      throw err;
    }
  };

  const resetStreak = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const result = await engagementApi.resetStreak(user.nickname);
      setUser(prev => prev ? { ...prev, current_streak: result.streak } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to reset streak');
      throw err;
    }
  };

  const awardBadge = async (badgeType: string, badgeName: string, badgeDescription?: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await engagementApi.awardBadge(user.nickname, badgeType, badgeName, badgeDescription);
    } catch (err: any) {
      setError(err.message || 'Failed to award badge');
      throw err;
    }
  };

  const refreshUserStats = async () => {
    if (!user) return;
    
    try {
      const stats = await gameApi.getUserStats(user.nickname);
      setUserStats(stats);
      
      // Also update the user object to reflect the latest streak info
      const updatedUser = await userApi.getUser(user.nickname);
      setUser(updatedUser);
    } catch (err: any) {
      console.error('Failed to refresh user stats:', err);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    error,
    createUser,
    loginUser,
    updateUser,
    logout,
    submitScore,
    startGameSession,
    endGameSession,
    incrementStreak,
    resetStreak,
    awardBadge,
    userStats,
    refreshUserStats,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 