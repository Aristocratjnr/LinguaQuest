import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.jpg';
import avatar3 from '../assets/images/programmer.jpg';
import avatar4 from '../assets/images/avatar.jpg';
import LogicFlowStepper from './LogicFlowStepper';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const AvatarPicker: React.FC<{ onConfirm: (avatar: string) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(selected);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="avatar-picker-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--duo-bg, linear-gradient(135deg, #58cc02 0%, #4CAF50 100%))',
      padding: '1rem',
      fontFamily: '"JetBrains Mono", monospace',
      color: 'var(--text-dark, #222)'
    }}>
      <motion.div 
        className="avatar-picker-card"
        style={{
          width: '100%',
          maxWidth: '32rem',
          background: 'var(--duo-card, #fff)',
          borderRadius: '1.25rem',
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
        <div style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>
          <LogicFlowStepper steps={[
            { label: 'Nickname', icon: 'person' },
            { label: 'Avatar', icon: 'face' },
            { label: 'Age', icon: 'cake' }
          ]} currentStep={1} />
        </div>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: ' #ffffff',
          textAlign: 'center',
          color: 'var(--text-light, #e0e7ff)'
        }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              marginBottom: '0.75rem'
            }}>
              <span className="material-icons" style={{ fontSize: '1.5rem' }}>face</span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-light, #e0e7ff)'
            }}>
              Choose Your Avatar
            </h2>
            <p style={{
              margin: '0.5rem 0 0',
              opacity: 0.9,
              fontSize: '0.875rem',
              color: 'var(--text-dark, #222)'
            }}>
              Select an image that represents you
            </p>
          </motion.div>
        </div>
        
        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {AVATARS.map((avatar, index) => (
              <motion.div
                key={index}
                onClick={() => setSelected(avatar)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  aspectRatio: '1/1',
                  border: selected === avatar ? '3px solid #58cc02' : '3px solid #e2e8f0',
                  transition: 'all 0.2s',
                  boxShadow: selected === avatar ? 
                    '0 10px 15px -3px rgba(88, 204, 2, 0.3), 0 4px 6px -2px rgba(88, 204, 2, 0.1)' : 
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {selected === avatar && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      background: '#58cc02',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <span className="material-icons" style={{ 
                      fontSize: '1rem'
                    }}>check</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          <motion.button
            onClick={handleConfirm}
            disabled={!selected || isSubmitting}
            whileHover={selected ? { scale: 1.02 } : {}}
            whileTap={selected ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: selected ? 
                'var(--duo-green, #58cc02)' : 
                '#e2e8f0',
              color: selected ? 'var(--text-light, #e0e7ff)' : '#94a3b8',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: selected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: selected ? 
                '0 4px 0 #3caa3c' : 
                'none',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? (
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
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons" style={{ 
                  fontSize: '1.25rem',
                  marginRight: '0.5rem'
                }}>check_circle</span>
                Confirm Selection
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
            }}>info</span>
            Your avatar will appear on your profile and leaderboard
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
      `}</style>
      <style>{`
        .dark .avatar-picker-container, body.dark .avatar-picker-container {
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .avatar-picker-card, body.dark .avatar-picker-card {
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .avatar-picker-card p, body.dark .avatar-picker-card p {
          color: var(--text-light, #e0e7ff) !important;
        }
      `}</style>
    </div>
  );
};

export default AvatarPicker;