import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ActivityItem = {
  id: string;
  type: 'action' | 'achievement' | 'system';
  message: string;
  timestamp: string; // ISO string
};

const typeColors = {
  action: '#58a700', // Duolingo green
  achievement: '#ffb800', // Gold for achievements
  system: '#6c757d' // Gray for system messages
};

const typeIcons = {
  action: 'edit_note',
  achievement: 'emoji_events',
  system: 'info'
};

const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => (
  <motion.div
    className="shadow"
    style={{ 
      maxWidth: 420, 
      margin: '2rem auto', 
      borderRadius: '16px',
      backgroundColor: 'white',
      overflow: 'hidden'
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Header */}
    <div className="p-4" style={{ 
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef'
    }}>
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center justify-content-center" style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          backgroundColor: '#e8f5e9',
          color: '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '1.5rem' }}>history</i>
        </div>
        <h2 className="mb-0" style={{ 
          color: '#58a700',
          fontWeight: 600,
          fontSize: '1.25rem'
        }}>
          Activity Feed
        </h2>
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <div className="d-flex flex-column gap-3">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-5"
              style={{ color: '#6c757d' }}
            >
              <div className="d-flex flex-column align-items-center">
                <i className="material-icons mb-2" style={{ 
                  fontSize: '2.5rem',
                  color: '#e8f5e9'
                }}>hourglass_empty</i>
                <div className="fw-medium">No activity yet</div>
                <small className="text-muted">Your actions will appear here</small>
              </div>
            </motion.div>
          ) : (
            items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="d-flex align-items-start gap-3 p-3 rounded-3"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  borderLeft: `4px solid ${typeColors[item.type]}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
                whileHover={{ 
                  y: -2,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <div className="d-flex align-items-center justify-content-center mt-1" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: `${typeColors[item.type]}20`,
                  color: typeColors[item.type],
                  flexShrink: 0
                }}>
                  <i className="material-icons" style={{ fontSize: '1.1rem' }}>
                    {typeIcons[item.type]}
                  </i>
                </div>
                <div className="flex-grow-1">
                  <div style={{ 
                    color: '#333',
                    fontWeight: 500,
                    lineHeight: 1.4
                  }}>
                    {item.message}
                  </div>
                  <div className="small mt-1" style={{ 
                    color: '#6c757d',
                    fontSize: '0.75rem'
                  }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Footer */}
    {items.length > 0 && (
      <div className="p-3 text-center small" style={{ 
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        color: '#6c757d'
      }}>
        <i className="material-icons align-middle me-1" style={{ fontSize: '0.9rem' }}>update</i>
        Updated just now
      </div>
    )}
  </motion.div>
);

export default ActivityFeed;