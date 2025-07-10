import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo.png';

type OnboardingProps = {
  show: boolean;
  onStart: () => void;
  playClick: () => void;
};

const Onboarding: React.FC<OnboardingProps> = ({ show, onStart, playClick }) => {
  if (!show) return null;
  
  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-3" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow"
        style={{ 
          maxWidth: 480, 
          width: '100%',
          borderRadius: '1.25rem',
          overflow: 'hidden'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="card-body p-4 p-md-5 text-center">
          <header className="d-flex flex-column align-items-center mb-4">
            <div className="mb-3 p-3 rounded-circle" 
                 style={{ background: 'rgba(118, 75, 162, 0.1)' }}>
              <img 
                src={logo} 
                alt="LinguaQuest Logo" 
                className="img-fluid" 
                style={{ height: 60 }} 
              />
            </div>
            <h1 className="fw-bold" style={{ 
              color: '#764ba2', 
              letterSpacing: '1px',
              fontSize: '2.25rem'
            }}>
              LinguaQuest
            </h1>
          </header>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="fw-bold mb-3" style={{ 
              color: '#667eea',
              fontSize: '1.5rem'
            }}>
              <i className="material-icons align-middle me-2">explore</i>
              Welcome to Your Language Adventure!
            </h2>
            
            <div className="p-3 mb-4 rounded-3 text-start" 
                 style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
              <p className="mb-3 lh-lg">
                Persuade the AI character in their native language. Each round, you'll be given a scenario and must craft a convincing argument.
              </p>
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-start mb-2">
                  <i className="material-icons text-primary me-2">timer</i>
                  <span>You have 30 seconds per round</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <i className="material-icons text-primary me-2">translate</i>
                  <span>Use translation tools to help you</span>
                </li>
                <li className="d-flex align-items-start">
                  <i className="material-icons text-primary me-2">emoji_events</i>
                  <span>Try to win all 5 rounds!</span>
                </li>
              </ul>
            </div>
            
            <motion.button
              className="btn btn-lg w-100 py-3"
              style={{ 
                background: 'linear-gradient(to right, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)'
              }}
              onClick={() => { onStart(); playClick(); }}
              whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(118, 75, 162, 0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="material-icons align-middle me-2">play_arrow</i>
              Start Game
            </motion.button>
            
            <div className="text-muted mt-3 small">
              <i className="material-icons align-text-bottom me-1" style={{ fontSize: '0.9rem' }}>info</i>
              Your progress will be saved automatically
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;