import React from 'react';
import { motion } from 'framer-motion';

type ProgressBarProps = {
  round: number;
  totalRounds: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ round, totalRounds }) => {
  const progressPercent = Math.min(100, (round / totalRounds) * 100);
  
  return (
    <div className="progress-container" style={{
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      padding: '0 2vw',
      boxSizing: 'border-box',
    }}>
      {/* Round number indicator */}
      <div className="d-flex justify-content-between align-items-center mb-2" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <span className="text-muted small fw-bold" style={{
          color: '#58a700',
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          fontWeight: 700,
          letterSpacing: '0.01em',
        }}>
          Round {Math.min(round, totalRounds)} of {totalRounds}
        </span>
        <div className="round-indicator" style={{
          width: '2.2em',
          height: '2.2em',
          borderRadius: '50%',
          backgroundColor: '#58a700',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1em',
          boxShadow: '0 2px 8px #58a70022',
        }}>
          {round}
        </div>
      </div>
      {/* Start and Finish Flags */}
      <div className="d-flex justify-content-between align-items-center mb-1" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '0.2rem',
      }}>
        <span className="material-icons" style={{ color: '#58a700', fontSize: '1.3em' }}>flag</span>
        <span className="material-icons" style={{ color: '#764ba2', fontSize: '1.3em' }}>outlined_flag</span>
      </div>
      {/* Main progress bar */}
      <div className="progress" style={{ 
        height: '0.7em', 
        borderRadius: '0.4em', 
        backgroundColor: '#e5e5e5',
        overflow: 'visible',
        width: '100%',
        minWidth: 0,
      }}>
        <motion.div 
          className="progress-bar"
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: '#58a700',
            borderRadius: '0.4em',
            position: 'relative',
            minWidth: 0,
            height: '100%',
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
      <div className="d-flex justify-content-between mt-3" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'clamp(0.5em, 2vw, 1.2em)',
        position: 'relative',
        height: '2.5em',
        marginTop: '1.2em',
        width: '100%',
        minWidth: 0,
      }}>
        {Array.from({ length: totalRounds }).map((_, i) => {
          const isCompleted = i < round;
          const isCurrent = i === round - 1;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: isCurrent ? 1.3 : 1,
                boxShadow: isCurrent
                  ? '0 0 0 6px #b4e19755, 0 0 16px 6px #58a70033'
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
                width: isCurrent ? '2.1em' : '1.5em',
                height: isCurrent ? '2.1em' : '1.5em',
                borderRadius: '50%',
                border: '3px solid',
                zIndex: isCurrent ? 3 : 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                cursor: 'default',
                backgroundClip: 'padding-box',
                userSelect: 'none',
                position: 'relative',
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              }}
            >
              <span style={{
                fontWeight: 'bold',
                fontSize: isCurrent ? '1.1em' : '0.95em',
                color: isCurrent ? '#58a700' : isCompleted ? '#fff' : '#999',
                transition: 'color 0.3s',
              }}>{i + 1}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;