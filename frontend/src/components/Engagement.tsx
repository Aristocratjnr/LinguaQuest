import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  '"Learning another language is like becoming another person." – Haruki Murakami',
  '"The limits of my language mean the limits of my world." – Ludwig Wittgenstein',
  '"Practice makes perfect. Keep going!"',
  '"Every day is a new chance to improve your skills."',
  '"Mistakes are proof that you are trying."',
];

const tips = [
  'Use persuasive arguments to convince the AI! 💡',
  'Try different tones: polite, passionate, formal, or casual.',
  'Switch languages to challenge yourself.',
  'Check the leaderboard to see how you rank!',
  'Collect badges for creative and high-scoring arguments.',
];

const Engagement: React.FC<{ nickname: string; onStart: () => void }> = ({ nickname, onStart }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

  // Simulate a daily streak (could be replaced with real data)
  const streak = 3;

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow-lg w-100"
        style={{ 
          maxWidth: 500, 
          width: '100%',
          borderRadius: '1rem', 
          overflow: 'hidden',
          fontFamily: "'JetBrains Mono', monospace",
          minHeight: 420,
          boxSizing: 'border-box',
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Welcome Card */}
        <div className="card-header text-center py-4 border-bottom" 
             style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="mb-2"
          >
            <i className="material-icons" 
               style={{ 
                 fontSize: '2.2rem', 
                 color: '#4f46e5',
                 background: 'rgba(79, 70, 229, 0.1)',
                 padding: '0.6rem',
                 borderRadius: '50%'
               }}>
              travel_explore
            </i>
          </motion.div>
          <h2 className="fw-bold mb-1" style={{ color: '#4f46e5', fontSize: '1.3rem' }}>
            Welcome, {nickname}!
          </h2>
          <div className="text-muted" style={{ letterSpacing: '0.01em', fontSize: '1rem' }}>
            Ready to start your language quest?
          </div>
        </div>

        {/* Daily Streak / Progress */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3 py-3 px-2 px-sm-3" 
             style={{ background: 'rgba(243, 244, 246, 0.7)' }}>
          <div className="d-flex align-items-center w-100 justify-content-center mb-2 mb-md-0">
            <div className="d-flex flex-column align-items-center w-100">
              <div className="d-flex align-items-center mb-1 px-2 py-1 rounded w-100 justify-content-center"
                   style={{ 
                     background: 'rgba(253, 224, 71, 0.2)', 
                     border: '1px solid rgba(253, 224, 71, 0.4)',
                     maxWidth: 180
                   }}>
                <i className="material-icons align-middle me-1" 
                   style={{ fontSize: '1.1rem', color: '#d97706' }}>
                  local_fire_department
                </i>
                <span style={{ fontWeight: 600, color: '#b45309', fontSize: '1rem' }}>
                  {streak} day streak
                </span>
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Keep it up!</small>
            </div>
          </div>
          <div className="d-none d-md-block vr mx-2" style={{ height: 32, opacity: 0.2 }}></div>
          <div className="d-flex align-items-center w-100 justify-content-center">
            <div className="d-flex flex-column align-items-center w-100">
              <div className="d-flex align-items-center mb-1 px-2 py-1 rounded w-100 justify-content-center"
                   style={{ 
                     background: 'rgba(125, 211, 252, 0.2)', 
                     border: '1px solid rgba(125, 211, 252, 0.4)',
                     maxWidth: 180
                   }}>
                <i className="material-icons align-middle me-1" 
                   style={{ fontSize: '1.1rem', color: '#0284c7' }}>
                  emoji_events
                </i>
                <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '1rem' }}>
                  Level 2
                </span>
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Next badge at 5 days</small>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="px-2 px-sm-4 py-4 text-center border-bottom" 
             style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
          <div className="mb-2" style={{ 
            fontSize: '0.7rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            fontWeight: 600,
            color: '#6b7280'
          }}>
            Daily Inspiration
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="fst-italic"
              style={{ 
                minHeight: 48, 
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                lineHeight: 1.3,
                textAlign: 'center',
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <div style={{ maxWidth: '95%' }}>{quotes[quoteIndex]}</div>
            </motion.div>
          </AnimatePresence>
          <div className="d-flex justify-content-center mt-2">
            <button className="btn btn-sm text-muted" 
                    onClick={() => setQuoteIndex(i => (i + 1) % quotes.length)}
                    style={{ fontSize: '0.75rem' }}>
              <i className="material-icons align-middle me-1" 
                 style={{ fontSize: '0.9rem' }}>
                refresh
              </i>
              New Quote
            </button>
          </div>
        </div>

        {/* Quick Tips Carousel */}
        <div className="px-2 px-sm-4 py-4" style={{ background: 'rgba(243, 244, 246, 0.7)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              fontWeight: 600,
              color: '#4f46e5'
            }}>
              Quick Tips
            </span>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-1 px-2 py-0" 
                      style={{ borderRadius: '0.25rem' }}
                      onClick={() => setTipIndex(i => (i - 1 + tips.length) % tips.length)}>
                <i className="material-icons" style={{ fontSize: '1rem' }}>chevron_left</i>
              </button>
              <button className="btn btn-sm btn-outline-secondary px-2 py-0" 
                      style={{ borderRadius: '0.25rem' }}
                      onClick={() => setTipIndex(i => (i + 1) % tips.length)}>
                <i className="material-icons" style={{ fontSize: '1rem' }}>chevron_right</i>
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
              style={{ 
                minHeight: 32, 
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                fontSize: '1rem',
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <div className="p-2 rounded" style={{ 
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(209, 213, 219, 0.5)',
                width: '100%'
              }}>
                {tips[tipIndex]}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="d-flex justify-content-center mt-2">
            <div className="hstack gap-1">
              {tips.map((_, i) => (
                <div 
                  key={i}
                  className="rounded-circle"
                  style={{
                    width: 8,
                    height: 8,
                    background: i === tipIndex ? '#4f46e5' : '#d1d5db',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTipIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="card-footer py-4 text-center" style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
          <motion.button
            className="btn btn-primary px-4 px-sm-5 py-3 fw-bold w-100 w-sm-auto"
            style={{ 
              borderRadius: '0.5rem', 
              fontSize: '1rem', 
              background: '#4f46e5',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.01em',
              maxWidth: 320,
              margin: '0 auto',
              display: 'block',
            }}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2), 0 4px 6px -2px rgba(79, 70, 229, 0.1)' 
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
          >
            <i className="material-icons align-middle me-2">play_circle</i>
            Start Your Quest
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Engagement;