import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
          overflow: 'hidden'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header text-center py-3 border-bottom" 
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <h2 className="card-title fw-bold mb-0" style={{ color: '#764ba2' }}>
            <i className="material-icons align-middle me-2">person</i>
            Enter Your Nickname
          </h2>
        </div>
        
        <div className="card-body p-4 text-center">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="material-icons">badge</i>
            </span>
            <input
              type="text"
              className="form-control form-control-lg"
              style={{ 
                borderRadius: '0.5rem', 
                background: '#f8f6fc', 
                fontSize: '1.1rem',
                padding: '0.75rem 1rem'
              }}
              value={nickname}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={MAX_LENGTH}
              placeholder="Nickname"
              autoFocus
            />
          </div>
          
          <div className="d-flex justify-content-end small text-muted mb-3">
            <span>{nickname.length}/{MAX_LENGTH} characters</span>
          </div>
          
          {error && (
            <motion.div 
              className="alert alert-danger d-flex align-items-center mb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <i className="material-icons me-2">error</i>
              {error}
            </motion.div>
          )}
          
          <motion.button
            className="btn btn-primary btn-lg w-100"
            style={{ 
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '.75rem',
              padding: '0.75rem',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)'
            }}
            onClick={handleConfirm}
            whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(118, 75, 162, 0.6)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!nickname.trim()}
          >
            <i className="material-icons align-middle me-2">check_circle</i>
            Confirm
          </motion.button>
        </div>
        
        <div className="card-footer py-2 text-center text-muted small border-top" 
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>info</i>
          This name will be used on the leaderboard
        </div>
      </motion.div>
    </div>
  );
};

export default NicknamePrompt;