import React from 'react';
import { motion } from 'framer-motion';

type ProgressBarProps = {
  round: number;
  totalRounds: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ round, totalRounds }) => {
  const progressPercent = Math.min(100, (round / totalRounds) * 100);
  
  return (
    <div className="progress-container">
      {/* Round number indicator */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted small fw-bold" style={{ color: '#58a700' }}>
          Round {Math.min(round, totalRounds)} of {totalRounds}
        </span>
        <div className="round-indicator" style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#58a700',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.8rem'
        }}>
          {round}
        </div>
      </div>
      
      {/* Start and Finish Flags */}
      <div className="d-flex justify-content-between align-items-center mb-1" style={{ position: 'relative' }}>
        <span className="material-icons" style={{ color: '#58a700', fontSize: '1.3rem' }}>flag</span>
        <span className="material-icons" style={{ color: '#764ba2', fontSize: '1.3rem' }}>outlined_flag</span>
      </div>
      {/* Main progress bar */}
      <div className="progress" style={{ 
        height: '8px', 
        borderRadius: '4px', 
        backgroundColor: '#e5e5e5',
        overflow: 'visible'
      }}>
        <motion.div 
          className="progress-bar"
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: '#58a700',
            borderRadius: '4px',
            position: 'relative'
          }}
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ 
            duration: 0.6, 
            ease: "easeOut"
          }}
        />
      </div>
      
      {/* Round indicators with animation */}
      <div className="d-flex justify-content-between mt-3" style={{ position: 'relative', height: 40 }}>
        {Array.from({ length: totalRounds }).map((_, i) => {
          const isCompleted = i < round;
          const isCurrent = i === round - 1;
          const isUpcoming = i >= round;
          return (
            <React.Fragment key={i}>
              {/* Animated Progress Dots */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.35 : 1,
                  boxShadow: isCurrent
                    ? '0 0 0 4px #b4e19755, 0 0 12px 4px #58a70055'
                    : isCompleted
                      ? '0 1px 4px #58a70033'
                      : '0 1px 4px #e5e5e5',
                  backgroundColor: isCurrent
                    ? '#fff'
                    : isCompleted
                      ? '#58a700'
                      : '#e5e5e5',
                  borderColor: isCurrent
                    ? '#58a700'
                    : isCompleted
                      ? '#58a700'
                      : '#ccc',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 24,
                  duration: 0.4,
                }}
                style={{
                  position: 'absolute',
                  left: `${(i / (totalRounds - 1)) * 100}%`,
                  top: 0,
                  width: isCurrent ? 28 : 20,
                  height: isCurrent ? 28 : 20,
                  borderRadius: '50%',
                  border: '3px solid',
                  zIndex: isCurrent ? 3 : 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateX(-50%)',
                  boxSizing: 'border-box',
                  cursor: 'default',
                  backgroundClip: 'padding-box',
                  userSelect: 'none',
                }}
              >
                <span style={{
                  fontWeight: 'bold',
                  fontSize: isCurrent ? '1.1rem' : '0.85rem',
                  color: isCurrent ? '#58a700' : isCompleted ? '#fff' : '#999',
                  transition: 'color 0.3s',
                }}>{i + 1}</span>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;