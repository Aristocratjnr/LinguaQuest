import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

type ProgressBarProps = {
  round: number;
  totalRounds: number;
};

// Define keyframes animation in a separate style element
const keyframesStyle = `
  @keyframes progress-bar-stripes {
    from { background-position: 1rem 0; }
    to { background-position: 0 0; }
  }
`;

const ProgressBar: React.FC<ProgressBarProps> = ({ round, totalRounds }) => {
  const progressPercent = ((round - 1) / totalRounds) * 100;
  
  // Add the keyframes style to the document head once
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframesStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <motion.div 
      className="card shadow-sm mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center text-muted">
            <i className="material-icons me-2" style={{ fontSize: '1.1rem' }}>flag</i>
            <span className="small fw-medium">Progress</span>
          </div>
          <div className="badge bg-primary px-3 py-2 d-flex align-items-center">
            <i className="material-icons me-1" style={{ fontSize: '0.9rem' }}>timer</i>
            <span>Round {round} of {totalRounds}</span>
          </div>
        </div>
        
        <div className="progress" style={{ height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          <motion.div 
            className="progress-bar"
            style={{ 
              width: `${progressPercent}%`,
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              backgroundSize: '1rem 1rem',
              backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
              animation: 'progress-bar-stripes 1s linear infinite'
            }}
            initial={{ width: `${Math.max(0, ((round - 2) / totalRounds) * 100)}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        
        <div className="d-flex justify-content-between mt-2">
          <div className="d-flex align-items-center">
            <i className="material-icons me-1" style={{ fontSize: '0.8rem', color: '#6c757d' }}>start</i>
            <span className="text-muted small">Start</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="text-muted small me-1">Finish</span>
            <i className="material-icons" style={{ fontSize: '0.8rem', color: '#6c757d' }}>flag</i>
          </div>
        </div>
        
        <div className="progress mt-1" style={{ height: '4px', borderRadius: '2px' }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div 
              key={i}
              className={`progress-bar ${i < round - 1 ? 'bg-success' : 'bg-light'}`}
              role="progressbar"
              style={{ 
                width: `${100 / totalRounds}%`,
                borderRight: i < totalRounds - 1 ? '2px solid white' : 'none',
              }}
              aria-valuenow={100 / totalRounds}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressBar;