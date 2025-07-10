import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityFeed } from './ActivityFeedContext';

const MAX_LENGTH = 16;

const NicknamePrompt: React.FC<{ onConfirm: (nickname: string) => void }> = ({ onConfirm }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const { addActivity } = useActivityFeed();

  // Use useCallback for better performance
  const handleConfirm = useCallback(() => {
    const trimmedNickname = nickname.trim();
    
    if (!trimmedNickname) {
      setError('Please enter a nickname.');
      return;
    }
    
    if (trimmedNickname.length > MAX_LENGTH) {
      setError(`Nickname must be at most ${MAX_LENGTH} characters.`);
      return;
    }
    
    addActivity({ type: 'action', message: `Set nickname to ${trimmedNickname}.` });
    onConfirm(trimmedNickname);
  }, [nickname, addActivity, onConfirm]);

  // Use useCallback for input handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setError('');
  }, []);

  // Add keyboard support for better UX
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  }, [handleConfirm]);

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-3" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow" 
        style={{ 
          maxWidth: 420, 
          width: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          fontFamily: "'JetBrains Mono', monospace"
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header text-center py-3 border-bottom" 
             style={{ background: 'rgba(79, 70, 229, 0.05)' }}>
          <h2 className="card-title fw-bold mb-0" style={{ 
            color: '#4f46e5', 
            letterSpacing: '-0.01em',
            fontSize: '1.5rem'
          }}>
            <i className="material-icons align-middle me-2">person</i>
            Choose Your Nickname
          </h2>
        </div>
        
        <div className="card-body p-4 text-center">
          <p className="text-muted mb-3" style={{ fontSize: '0.875rem', letterSpacing: '0.01em' }}>
            This will identify you on the leaderboard and in conversations.
          </p>
          
          <div className="input-group mb-2">
            <span className="input-group-text" style={{
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRight: 0,
              borderRadius: '0.5rem 0 0 0.5rem'
            }}>
              <i className="material-icons" style={{ color: '#4f46e5' }}>badge</i>
            </span>
            <input
              type="text"
              className="form-control form-control-lg"
              style={{ 
                borderRadius: '0 0.5rem 0.5rem 0', 
                background: '#ffffff', 
                fontSize: '1rem',
                padding: '0.75rem 1rem',
                fontFamily: "'JetBrains Mono', monospace",
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderLeft: 0,
                letterSpacing: '0.01em'
              }}
              value={nickname}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={MAX_LENGTH}
              placeholder="Enter nickname here"
              autoFocus
            />
          </div>
          
          <div className="d-flex justify-content-between align-items-center small mb-3">
            <div className="text-muted ms-2" style={{ 
              fontSize: '0.75rem',
              visibility: nickname ? 'visible' : 'hidden'
            }}>
              <i className="material-icons align-text-bottom" 
                 style={{ fontSize: '0.75rem' }}>check</i> Looks good
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              <span className={nickname.length > MAX_LENGTH * 0.8 ? 'text-warning' : ''}>
                {nickname.length}
              </span>/{MAX_LENGTH} characters
            </div>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                className="alert alert-danger d-flex align-items-center mb-3 p-2"
                style={{ borderRadius: '0.375rem', fontSize: '0.875rem' }}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <i className="material-icons me-2" style={{ fontSize: '1rem' }}>error_outline</i>
                <span style={{ letterSpacing: '0.01em' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            className="btn btn-primary btn-lg w-100"
            style={{ 
              background: nickname.trim() ? 'linear-gradient(to right, #4f46e5, #6366f1)' : '#cbd5e1',
              border: 'none',
              borderRadius: '.5rem',
              padding: '0.75rem',
              fontSize: '1rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              letterSpacing: '0.01em',
              boxShadow: nickname.trim() ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={handleConfirm}
            whileHover={nickname.trim() ? { 
              scale: 1.02, 
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)' 
            } : {}}
            whileTap={nickname.trim() ? { scale: 0.98 } : {}}
            disabled={!nickname.trim()}
          >
            <i className="material-icons align-middle me-2" 
               style={{ fontSize: '1.1rem' }}>arrow_forward</i>
            Continue
          </motion.button>
        </div>
        
        <div className="card-footer py-2 text-center border-top" 
             style={{ 
               background: 'rgba(79, 70, 229, 0.05)',
               fontSize: '0.75rem',
               color: '#6b7280'
             }}>
          <div className="d-flex align-items-center justify-content-center">
            <i className="material-icons me-1" style={{ fontSize: '.7rem' }}>shield</i>
            <span style={{ letterSpacing: '0.01em' }}>
              Your information is kept private
            </span>
          </div>
        </div>
      </motion.div>
      
    </div>
  );
};

export default NicknamePrompt;