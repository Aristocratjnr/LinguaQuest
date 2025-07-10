import React from 'react';
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
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframesStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <div style={{ width: '100%', margin: '0 auto 1.5rem', padding: '0 0.75rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.5rem' 
      }}>
        <div style={{ 
          color: '#6c757d', 
          fontSize: '0.875rem' 
        }}>
          <i className="material-icons" 
             style={{ 
               fontSize: '1rem', 
               verticalAlign: 'middle', 
               marginRight: '0.25rem' 
             }}>flag</i>
          Progress
        </div>
        <div style={{ 
          backgroundColor: '#4f46e5', 
          color: 'white', 
          padding: '0.35rem 0.75rem', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          Round {round} of {totalRounds}
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#e9ecef', 
        borderRadius: '6px', 
        height: '12px', 
        overflow: 'hidden' 
      }}>
        <motion.div 
          style={{ 
            width: `${progressPercent}%`, 
            height: '100%',
            background: 'linear-gradient(to right, #667eea, #764ba2)',
            backgroundSize: '1rem 1rem',
            backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
            animation: 'progress-bar-stripes 1s linear infinite'
          }}
          initial={{ width: `${((round - 2) / totalRounds) * 100}%` }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '0.25rem'
      }}>
        <div style={{ 
          color: '#6c757d', 
          fontSize: '0.875rem' 
        }}>Start</div>
        <div style={{ 
          color: '#6c757d', 
          fontSize: '0.875rem' 
        }}>Finish</div>
      </div>
    </div>
  );
};

export default ProgressBar;