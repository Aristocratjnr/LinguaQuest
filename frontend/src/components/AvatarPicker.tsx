import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import avatar1 from '../assets/images/boy.jpg';
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
      background: 'linear-gradient(135deg, #e0f7fa 0%, #f5f5f5 100%)',
      padding: '1rem',
      fontFamily: '"JetBrains Mono", monospace',
      color: '#1a1a1a'
    }}>
      <motion.div 
        className="avatar-picker-card"
        style={{
          width: '100%',
          maxWidth: '32rem',
          background: '#ffffff',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          color: '#1a1a1a'
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
                  border: selected === avatar ? '4px solid #58cc02' : '3px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  boxShadow: selected === avatar ? 
                    '0 12px 20px -4px rgba(88, 204, 2, 0.4), 0 4px 8px -2px rgba(88, 204, 2, 0.2)' : 
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  minWidth: '80px',  
                  minHeight: '80px'  
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 12px 20px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.08)'
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
                      width: '1.75rem',
                      height: '1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <span className="material-icons" style={{ 
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
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
                '#58cc02' : 
                '#e2e8f0',
              color: selected ? '#ffffff' : '#94a3b8',
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
          color: '#64748b'
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
        /* Mobile responsiveness */
        @media (max-width: 600px) {
          .avatar-picker-container {
            padding: 0;
            min-height: 100vh;
            width: 100vw;
            box-sizing: border-box;
           /* Mobile devices (max-width: 600px) */
        @media (max-width: 600px) {
          .avatar-picker-card {
            max-width: 100vw;
            width: 100vw;
            border-radius: 0;
            box-shadow: none;
            min-height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            padding: 24px 16px;
          }
          .avatar-picker-card h2 {
            font-size: 24px;
            margin-top: 8px;
            text-align: center;
          }
          .avatar-picker-card p {
            font-size: 16px;
            line-height: 1.5;
            text-align: center;
            margin: 8px 0 24px;
          }
          .avatar-picker-card [style*='padding: 1.5rem'] {
            padding: 24px 16px;
          }
          .avatar-picker-card [style*='grid-template-columns'] {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-bottom: 24px;
          }
          .avatar-picker-card [style*='position: relative'] {
            min-width: 80px;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .avatar-picker-card img {
            min-width: 72px;
            min-height: 72px;
            width: 72px;
            height: 72px;
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
            border: 3px solid transparent;
            transition: all 0.2s ease;
            border-radius: 50%;
          }
          .avatar-picker-card img:hover {
            transform: scale(1.05);
          }
          .avatar-picker-card button, .avatar-picker-card [role='button'] {
            font-size: 16px;
            padding: 16px;
            margin-top: 8px;
            border-radius: 12px;
            min-height: 48px;
            width: 100%;
            box-sizing: border-box;
          }
          /* Material icons adjustments */
          .avatar-picker-card .material-icons {
            font-size: 32px;
          }
          /* Stepper adjustments */
          .logic-flow-stepper {
            margin: 0 0 24px;
          }
        }
        
        /* Extra small devices (phones, less than 360px) */
        @media (max-width: 360px) {
{{ ... }}
            padding: 14px;
          }
        }
        
        /* Landscape orientation adjustments */
        /* Mobile devices (max-width: 600px) */
        @media (max-width: 600px) {
          .avatar-picker-container {
            padding: 0;
            min-height: 100vh;
          }
          .avatar-picker-card {
            width: 100vw;
            max-width: 100vw;
            min-height: 100vh;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
          }
        }padding: 24px;
          }
        }
      `}</style>
      <style>{`
        body.dark .avatar-picker-container,
        .dark .avatar-picker-container {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        body.dark .avatar-picker-card,
        .dark .avatar-picker-card {
          background: #1e293b;
          color: #e2e8f0 !important;
        }
        body.dark .avatar-picker-card h2,
        .dark .avatar-picker-card h2 {
          color: #ffffff !important;
        }
        body.dark .avatar-picker-card p,
        .dark .avatar-picker-card p {
          color: #e2e8f0 !important;
        }
        body.dark .avatar-picker-card button,
        .dark .avatar-picker-card button {
          background: #58cc02 !important;
          color: #ffffff !important;
        }
        body.dark .avatar-picker-card button:disabled,
        .dark .avatar-picker-card button:disabled {
          background: #444c6e !important;
          color: #94a3b8 !important;
        }
        body.dark .avatar-picker-card .material-icons,
        .dark .avatar-picker-card .material-icons {
          color: #94a3b8;
        }
        body.dark .avatar-picker-footer,
        .dark .avatar-picker-footer {
          background: #0f172a !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
};

export default AvatarPicker;