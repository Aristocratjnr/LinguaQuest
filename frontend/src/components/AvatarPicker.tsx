import React, { useState } from 'react';
import { motion } from 'framer-motion';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.png';
import avatar3 from '../assets/images/programmer.png';
import avatar4 from '../assets/images/avatar.png';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const AvatarPicker: React.FC<{ onConfirm: (avatar: string) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState(AVATARS[0]);

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div
        className="card shadow"
        style={{ 
          maxWidth: 450, 
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
            fontSize: '1.5rem',
            letterSpacing: '-0.01em'
          }}>
            <i className="material-icons align-middle me-2">account_circle</i>
            Choose Your Avatar
          </h2>
        </div>
        
        <div className="card-body p-4">
          <p className="text-center text-muted mb-4" style={{ 
            fontSize: '0.875rem',
            letterSpacing: '0.01em'
          }}>
            Select an avatar that will represent you in the game
          </p>
          
          <div className="d-flex justify-content-center flex-wrap gap-4 my-4">
            {AVATARS.map((a, i) => (
              <motion.div
                key={i}
                className="position-relative"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(a)}
                whileHover={{ 
                  scale: selected === a ? 1.05 : 1.05,
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.15)'
                }}
                whileTap={{ scale: 0.95 }}
                animate={selected === a ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="avatar-container" style={{
                  borderRadius: '50%',
                  padding: selected === a ? '3px' : '0px',
                  background: selected === a ? 'linear-gradient(to right, #4f46e5, #6366f1)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}>
                  <img
                    src={a}
                    alt={`Avatar ${i + 1}`}
                    className={`rounded-circle bg-white`}
                    style={{ 
                      width: 85, 
                      height: 85, 
                      boxShadow: selected === a ? '0 0 16px rgba(79, 70, 229, 0.3)' : '0 4px 8px rgba(0,0,0,0.08)',
                      opacity: selected === a ? 1 : 0.85,
                      transition: 'all 0.3s ease',
                      objectFit: 'cover',
                      border: '3px solid white'
                    }}
                  />
                </div>
                
                {selected === a && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="position-absolute top-0 end-0 translate-middle"
                    style={{ 
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      border: '2px solid white'
                    }}
                  >
                    <i className="material-icons" style={{ fontSize: '0.75rem' }}>check</i>
                    <span className="visually-hidden">Selected</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="d-flex justify-content-center mt-4 mb-2">
            <div className="text-center px-4 py-2 rounded-pill" style={{ 
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid rgba(79, 70, 229, 0.1)',
              fontSize: '0.75rem',
              color: '#4b5563'
            }}>
              <span style={{ color: '#4f46e5', fontWeight: 600 }}>Selected:</span> Avatar {AVATARS.indexOf(selected) + 1}
            </div>
          </div>
          
          <motion.button
            className="btn btn-primary btn-lg w-100 mt-3"
            style={{ 
              background: 'linear-gradient(to right, #4f46e5, #6366f1)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1rem',
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
            onClick={() => onConfirm(selected)}
            whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="material-icons align-middle me-2" style={{ fontSize: '1.1rem' }}>arrow_forward</i>
            Continue
          </motion.button>
        </div>
        
        <div className="card-footer py-2 text-center border-top" 
             style={{ 
               background: 'rgba(79, 70, 229, 0.05)',
               fontSize: '0.75rem',
               color: '#6b7280'
             }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.75rem' }}>info</i>
          <span style={{ letterSpacing: '0.01em' }}>
            Your avatar will appear in conversations and on the leaderboard
          </span>
        </div>
      </motion.div>
      
    </div>
  );
};

export default AvatarPicker;