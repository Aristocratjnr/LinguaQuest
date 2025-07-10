import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ActivityItem = {
  id: string;
  type: 'action' | 'achievement' | 'system';
  message: string;
  timestamp: string; // ISO string
};

const typeStyles: Record<string, string> = {
  action: 'text-primary',
  achievement: 'text-success',
  system: 'text-secondary',
};

const typeIcons: Record<string, string> = {
  action: 'edit_note',
  achievement: 'emoji_events',
  system: 'info',
};

const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => (
  <motion.div
    className="card shadow"
    style={{ maxWidth: 420, margin: '2rem auto', borderRadius: '1rem' }}
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <div className="card-body p-4">
      <h2 className="card-title fw-bold mb-4" style={{ color: '#764ba2' }}>
        <i className="material-icons align-middle me-2">history</i>
        Activity Feed
      </h2>
      <div className="d-flex flex-column gap-3">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-secondary text-center py-4"
            >
              <i className="material-icons d-block mb-2" style={{ fontSize: '2rem' }}>hourglass_empty</i>
              No recent activity yet.
            </motion.div>
          ) : (
            items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`d-flex align-items-center gap-3 bg-light rounded p-3 shadow-sm border-start border-4 ${
                  item.type === 'achievement' ? 'border-success' : item.type === 'action' ? 'border-primary' : 'border-secondary'
                }`}
              >
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${item.type === 'achievement' ? 'bg-success' : item.type === 'action' ? 'bg-primary' : 'bg-secondary'}`}
                  style={{ width: 40, height: 40, opacity: 0.8 }}>
                  <i className="material-icons text-white">{typeIcons[item.type]}</i>
                </div>
                <div className="flex-grow-1">
                  <div className={`fw-medium ${typeStyles[item.type]}`}>{item.message}</div>
                  <div className="text-muted small mt-1">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
);

export default ActivityFeed;