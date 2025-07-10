import React, { useState } from 'react';
import { motion } from 'framer-motion';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.png';
import avatar3 from '../assets/images/programmer.png';
import avatar4 from '../assets/images/avatar.png';
// Import Bootstrap CSS in your main index file if not already imported

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const AvatarPicker: React.FC<{ onConfirm: (avatar: string) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState(AVATARS[0]);

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div
        className="card shadow"
        style={{ maxWidth: 450, borderRadius: '1rem' }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-body p-4 p-md-5">
          <h2 className="card-title text-center mb-4 fw-bold" style={{ color: '#764ba2' }}>
            <i className="material-icons align-middle me-2">face</i>
            Choose Your Avatar
          </h2>
          
          <div className="d-flex justify-content-center flex-wrap gap-4 my-4">
            {AVATARS.map((a, i) => (
              <motion.div
                key={i}
                className="position-relative"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(a)}
                whileTap={{ scale: 0.9 }}
                animate={selected === a ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <img
                  src={a}
                  alt={`Avatar ${i + 1}`}
                  className={`rounded-circle ${selected === a ? 'border border-3 border-primary' : 'opacity-75'}`}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    boxShadow: selected === a ? '0 0 16px rgba(118, 75, 162, 0.5)' : 'none',
                    transition: 'all 0.2s'
                  }}
                />
                {selected === a && (
                  <div className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success">
                    <i className="material-icons" style={{ fontSize: '1rem' }}>check</i>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <button
              className="btn btn-primary btn-lg px-5 py-3 w-100"
              style={{ 
                background: 'linear-gradient(to right, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '0.8rem' 
              }}
              onClick={() => onConfirm(selected)}
            >
              <i className="material-icons align-middle me-2">check_circle</i>
              Confirm Selection
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarPicker;