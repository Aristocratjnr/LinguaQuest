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
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div
        className="card shadow w-100"
        style={{ 
          maxWidth: 450, 
          width: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          minHeight: 420,
          boxSizing: 'border-box',
          fontFamily: "'JetBrains Mono', monospace"
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header text-center py-3 border-bottom" 
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <h2 className="card-title fw-bold mb-0" style={{ color: '#764ba2', fontSize: '1.3rem' }}>
            <i className="material-icons align-middle me-2">face</i>
            Choose Your Avatar
          </h2>
        </div>
        
        <div className="card-body p-3 p-sm-4">
          <p className="text-center text-muted mb-3 mb-md-4" style={{ fontSize: '1rem' }}>
            Select an avatar that represents you best
          </p>
          
          <div className="d-flex justify-content-center flex-wrap gap-3 gap-md-4 my-3 my-md-4"
               style={{ rowGap: 18, columnGap: 18 }}>
            {AVATARS.map((a, i) => (
              <motion.div
                key={i}
                className="position-relative"
                style={{ cursor: 'pointer', minWidth: 64, minHeight: 64 }}
                onClick={() => setSelected(a)}
                whileHover={{ 
                  scale: selected === a ? 1.12 : 1.06,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }}
                whileTap={{ scale: 0.95 }}
                animate={selected === a ? { scale: 1.12 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div className="avatar-container" style={{
                  borderRadius: '50%',
                  padding: selected === a ? '4px' : '0px',
                  background: selected === a ? 'linear-gradient(to right, #667eea, #764ba2)' : 'transparent',
                  transition: 'all 0.3s ease',
                  width: 'clamp(64px, 18vw, 85px)',
                  height: 'clamp(64px, 18vw, 85px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={a}
                    alt={`Avatar ${i + 1}`}
                    className={`rounded-circle bg-white`}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      maxWidth: 85, 
                      maxHeight: 85, 
                      minWidth: 48, 
                      minHeight: 48, 
                      boxShadow: selected === a ? '0 0 16px rgba(118, 75, 162, 0.5)' : '0 4px 8px rgba(0,0,0,0.08)',
                      opacity: selected === a ? 1 : 0.8,
                      transition: 'all 0.3s ease',
                      objectFit: 'cover',
                      border: '3px solid white',
                    }}
                  />
                </div>
                {selected === a && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success p-2"
                    style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                  >
                    <i className="material-icons" style={{ fontSize: '0.85rem' }}>check</i>
                    <span className="visually-hidden">Selected</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          <motion.button
            className="btn btn-primary btn-lg w-100 mt-4"
            style={{ 
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '0.8rem',
              padding: '0.75rem',
              boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)',
              fontSize: '1.05rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
            onClick={() => onConfirm(selected)}
            whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(118, 75, 162, 0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            <i className="material-icons align-middle me-2">check_circle</i>
            Confirm Selection
          </motion.button>
        </div>
        
        <div className="card-footer py-2 text-center text-muted small border-top" 
             style={{ background: 'rgba(118, 75, 162, 0.05)', fontSize: '0.95rem' }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>tips_and_updates</i>
          Your avatar will appear in conversations and on the leaderboard
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarPicker;