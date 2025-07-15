import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityFeed } from './ActivityFeedContext';
import { useUser } from '../context/UserContext';
import { userApi } from '../services/api';
import LogicFlowStepper from './LogicFlowStepper';

const MAX_LENGTH = 16;
const MIN_LENGTH = 3;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const NicknamePrompt: React.FC<{ onConfirm: (nickname: string, avatar: string) => void }> = ({ onConfirm }) => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addActivity } = useActivityFeed();
  const { createUser } = useUser();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Validate nickname with backend
  const validateNickname = useCallback(async (name: string) => {
    try {
      const res = await userApi.validateUsername(name);
      
      if (res.valid) {
        setValid(true);
        setFeedback(res.reason || 'Available!');
        setError('');
      } else {
        setValid(false);
        setFeedback('');
        setError(res.reason || 'Nickname not available');
      }
    } catch {
      setValid(false);
      setFeedback('');
      setError('Could not validate nickname');
    } finally {
      setChecking(false);
    }
  }, []);

  // Debounced validation
  useEffect(() => {
    const trimmed = nickname.trim();
    
    if (!trimmed) {
      setValid(false);
      setFeedback('');
      setError('');
      return;
    }

    if (trimmed.length < MIN_LENGTH) {
      setValid(false);
      setFeedback('');
      setError(`Nickname must be at least ${MIN_LENGTH} characters`);
      return;
    }

    setChecking(true);
    setFeedback('Checking availability...');
    setError('');

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateNickname(trimmed);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [nickname, validateNickname]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.match('image.*')) {
      setAvatarError('Please select an image file');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setAvatarError('Image must be less than 2MB');
      return;
    }

    setAvatarError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
        setAvatar(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = useCallback(async () => {
    const trimmedNickname = nickname.trim();
    if (!valid) return;

    setSubmitting(true);
    try {
      // Create user in database
      await createUser({
        nickname: trimmedNickname,
        avatar_url: avatarPreview || undefined
      });

      addActivity({ 
        type: 'action', 
        message: `Profile created: ${trimmedNickname}` 
      });
      onConfirm(trimmedNickname, avatarPreview || '');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  }, [nickname, valid, avatarPreview, addActivity, onConfirm, createUser]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_LENGTH);
    setNickname(value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && valid && !submitting) {
      handleConfirm();
    }
  }, [handleConfirm, valid, submitting]);

  // Character count color
  const getCountColor = () => {
    const ratio = nickname.length / MAX_LENGTH;
    if (ratio > 0.9) return '#ef4444'; // red
    if (ratio > 0.7) return '#f59e0b'; // amber
    return '#64748b'; // slate
  };

  return (
    <div  style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'var(--duo-bg, linear-gradient(135deg, #58cc02 0%, #4CAF50 100%))'
    }}>
      <motion.div 
        className="nickname-card"
        style={{
          width: '100%',
          maxWidth: '28rem',
          background: 'var(--duo-card, #fff)',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          color: 'inherit'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        {/* Stepper */}
        <LogicFlowStepper steps={[
          { label: 'Nickname', icon: 'person' },
          { label: 'Avatar', icon: 'face' },
          { label: 'Age', icon: 'cake' }
        ]} currentStep={0} />
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem 1rem 1.25rem',
          background: '#ffffff',
          textAlign: 'center',
          color: 'var(--text-light, #e0e7ff)'
        }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerFileInput}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '6rem',
                height: '6rem',
                borderRadius: '50%',
                background: avatarPreview ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '3px solid white',
                position: 'relative'
              }}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile preview" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <>
                  <span className="material-icons" style={{ 
                    fontSize: '2.5rem',
                    opacity: 0.8
                  }}>add_a_photo</span>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.25rem'
                  }}>
                    Add Photo
                  </div>
                </>
              )}
            </motion.div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-light, #e0e7ff'
            }}>
              Create Your Profile
            </h2>
            <p style={{
              margin: '0.5rem 0 0',
              opacity: 0.9,
              fontSize: '0.875rem',
              color: 'var(--text-dark, #222)'
            }}>
              Choose a nickname and profile picture
            </p>
          </motion.div>
        </div>
        
        {/* Body */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              ...(valid && nickname.trim() ? {
                borderColor: '#58cc02',
                boxShadow: '0 0 0 3px rgba(88, 204, 2, 0.1)'
              } : {}),
              ...(error ? {
                borderColor: '#ef4444',
                boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
              } : {})
            }}>
              <div style={{
                padding: '0.75rem',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-icons" style={{ 
                  color: '#64748b',
                  fontSize: '1.25rem'
                }}>alternate_email</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={nickname}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                maxLength={MAX_LENGTH}
                placeholder="e.g. langmaster123"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '1rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'var(--text-dark, #222)'
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <AnimatePresence mode="wait">
                {checking ? (
                  <motion.div
                    key="checking"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#64748b'
                    }}
                  >
                    <div style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderTopColor: '#64748b',
                      borderRadius: '50%',
                      marginRight: '0.25rem',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Checking...
                  </motion.div>
                ) : feedback ? (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#58cc02'
                    }}
                  >
                    <span className="material-icons" style={{ 
                      fontSize: '1rem',
                      marginRight: '0.25rem'
                    }}>check_circle</span>
                    {feedback}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              
              <div style={{ 
                color: getCountColor(),
                fontWeight: 500
              }}>
                {nickname.length}/{MAX_LENGTH}
              </div>
            </div>
            
            <AnimatePresence>
              {(error || avatarError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: '#fee2e2',
                    borderRadius: '0.375rem',
                    color: '#b91c1c',
                    fontSize: '0.875rem'
                  }}
                >
                  <span className="material-icons" style={{ 
                    fontSize: '1rem',
                    marginRight: '0.5rem'
                  }}>error</span>
                  {error || avatarError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            onClick={handleConfirm}
            disabled={!valid || submitting}
            whileHover={valid ? { scale: 1.02 } : {}}
            whileTap={valid ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: valid ? 
                'var(--duo-green, #58cc02)' : 
                '#e2e8f0',
              color: valid ? 'var(--text-light, #e0e7ff)' : '#94a3b8',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: valid ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: valid ? 
                '0 4px 0 #3caa3c' : 
                'none',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite'
                }} />
                Creating profile...
              </>
            ) : (
              <>
                <span className="material-icons" style={{ 
                  fontSize: '1.25rem',
                  marginRight: '0.5rem'
                }}>arrow_forward</span>
                Continue
              </>
            )}
          </motion.button>
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '1rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-dark, #64748b)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ 
              fontSize: '1rem',
              marginRight: '0.25rem',
              color: '#64748b'
            }}>lock</span>
            Your information is secure and private
          </div>
        </div>
      </motion.div>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        body {
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        .dark .nickname-prompt-container, body.dark .nickname-prompt-container {
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .nickname-card, body.dark .nickname-card {
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .nickname-card input, body.dark .nickname-card input {
          color: var(--text-light, #e0e7ff) !important;
          background: transparent !important;
        }
        .dark .nickname-card p, body.dark .nickname-card p {
          color: var(--text-light, #e0e7ff) !important;
        }
      `}</style>
    </div>
  );
};

export default NicknamePrompt;