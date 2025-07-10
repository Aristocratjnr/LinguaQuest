import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ActivityItem = {
  id: string;
  type: 'action' | 'achievement' | 'system';
  message: string;
  timestamp: string; // ISO string
};

const typeStyles: Record<string, string> = {
  action: 'text-blue-700',
  achievement: 'text-green-700',
  system: 'text-gray-500',
};

const typeIcons: Record<string, string> = {
  action: '📝',
  achievement: '🏆',
  system: 'ℹ️',
};

const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => (
  <motion.div
    className="lq-card"
    style={{ maxWidth: 420, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem', textAlign: 'left' }}
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <h2 className="text-xl font-bold mb-4" style={{ color: '#764ba2' }}>Activity Feed</h2>
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400 text-center py-6">
            No recent activity yet.
          </motion.div>
        )}
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`flex items-center gap-3 bg-blue-50/60 rounded-lg px-3 py-2 shadow-sm border-l-4 ${
              item.type === 'achievement' ? 'border-green-400' : item.type === 'action' ? 'border-blue-400' : 'border-gray-300'
            }`}
          >
            <span className="text-2xl" aria-label={item.type}>{typeIcons[item.type]}</span>
            <div className="flex-1">
              <div className={`font-medium ${typeStyles[item.type]}`}>{item.message}</div>
              <div className="text-xs text-gray-400 mt-0.5">{new Date(item.timestamp).toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </motion.div>
);

export default ActivityFeed; 