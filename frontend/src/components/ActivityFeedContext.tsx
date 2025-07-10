import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ActivityItem } from './ActivityFeed';

interface ActivityFeedContextType {
  activity: ActivityItem[];
  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

const ActivityFeedContext = createContext<ActivityFeedContextType | undefined>(undefined);

export const ActivityFeedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const addActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivity(prev => [
      {
        ...item,
        id: Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  return (
    <ActivityFeedContext.Provider value={{ activity, addActivity }}>
      {children}
    </ActivityFeedContext.Provider>
  );
};

export function useActivityFeed() {
  const ctx = useContext(ActivityFeedContext);
  if (!ctx) throw new Error('useActivityFeed must be used within an ActivityFeedProvider');
  return ctx;
} 