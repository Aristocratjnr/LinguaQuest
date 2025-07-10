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
          overflow: 'hidden'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header text-center py-3 border-bottom" 
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <h2 className="card-title fw-bold mb-0" style={{ color: '#764ba2' }}>
            <i className="material-icons align-middle me-2">face</i>
            Choose Your Avatar
          </h2>
        </div>
        
        <div className="card-body p-4">
          <p className="text-center text-muted mb-4">
            Select an avatar that represents you best
          </p>
          
          <div className="d-flex justify-content-center flex-wrap gap-4 my-4">
            {AVATARS.map((a, i) => (
              <motion.div
                key={i}
                className="position-relative"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(a)}
                whileHover={{ 
                  scale: selected === a ? 1.15 : 1.1,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
                whileTap={{ scale: 0.9 }}
                animate={selected === a ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div className="avatar-container" style={{
                  borderRadius: '50%',
                  padding: selected === a ? '4px' : '0px',
                  background: selected === a ? 'linear-gradient(to right, #667eea, #764ba2)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}>
                  <img
                    src={a}
                    alt={`Avatar ${i + 1}`}
                    className={`rounded-circle bg-white`}
                    style={{ 
                      width: 85, 
                      height: 85, 
                      boxShadow: selected === a ? '0 0 16px rgba(118, 75, 162, 0.5)' : '0 4px 8px rgba(0,0,0,0.1)',
                      opacity: selected === a ? 1 : 0.75,
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
                    className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success p-2"
                    style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
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
              boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)'
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
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>tips_and_updates</i>
          Your avatar will appear in conversations and on the leaderboard
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarPicker;