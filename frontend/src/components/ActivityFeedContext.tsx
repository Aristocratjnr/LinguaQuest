import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ActivityItem } from './ActivityFeed';

interface ActivityFeedContextType {
  items: ActivityItem[];
  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

const ActivityFeedContext = createContext<ActivityFeedContextType | undefined>(undefined);

export const useActivityFeed = () => {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useActivityFeed must be used within an ActivityFeedProvider');
  }
  return context;
};

interface ActivityFeedProviderProps {
  children: ReactNode;
}

export const ActivityFeedProvider: React.FC<ActivityFeedProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ActivityItem[]>([]);

  const addActivity = (item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newItem: ActivityItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev.slice(0, 9)]); // Keep only last 10 items
  };

  const clearActivities = () => {
    setItems([]);
  };

  return (
    <ActivityFeedContext.Provider value={{ items, addActivity, clearActivities }}>
      {children}
    </ActivityFeedContext.Provider>
  );
}; 