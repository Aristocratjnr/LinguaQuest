import React from 'react';
import { motion } from 'framer-motion';

type TimerProps = {
  seconds: number;
  timeLeft: number;
  isActive: boolean;
};

const Timer: React.FC<TimerProps> = ({ seconds, timeLeft, isActive }) => {
  const radius = 40;  // Increased for better visibility
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = timeLeft / seconds;
  const strokeDashoffset = circumference * (1 - percent);
  
  // Color changes based on time left
  const getTimeColor = () => {
    if (timeLeft > seconds * 0.6) return '#28a745'; // Green
    if (timeLeft > seconds * 0.3) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };
  
  // Format time as mm:ss or ss
  const formatTime = (t: number) => {
    if (t >= 60) {
      const m = Math.floor(t / 60);
      const s = t % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return `${t}s`;
  };
  
  return (
    <div className="d-flex flex-column align-items-center justify-content-center my-4">
      <motion.div
        className="position-relative"
        animate={{ 
          scale: isActive && timeLeft <= 5 ? [1, 1.1, 1] : 1 
        }}
        transition={{ 
          repeat: isActive && timeLeft <= 5 ? Infinity : 0,
          duration: 0.5
        }}
      >
        <svg height={radius * 2} width={radius * 2} className="drop-shadow">
          {/* Background circle */}
          <circle
            stroke="#e0e7ff"
            fill="none"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          {/* Progress circle */}
          <circle
            stroke={timeLeft <= 5 && isActive ? getTimeColor() : "url(#timer-gradient)"}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ 
              strokeDashoffset, 
              transition: isActive ? 'stroke-dashoffset 1s linear' : 'none', 
              filter: 'drop-shadow(0 2px 8px rgba(118, 75, 162, 0.3))'
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          
          {/* Timer text */}
          <text 
            x="50%" 
            y="54%" 
            textAnchor="middle" 
            fill={timeLeft <= 5 && isActive ? getTimeColor() : "#764ba2"} 
            fontSize="1.4rem" 
            fontWeight="bold" 
            dy=".3em"
          >
            {formatTime(timeLeft)}
          </text>
        </svg>
        
        {/* Small pulse circles for urgency */}
        {isActive && timeLeft <= 5 && (
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: -1 }}>
            <motion.div 
              className="position-absolute top-0 start-0 w-100 h-100 rounded-circle"
              style={{ 
                backgroundColor: `${getTimeColor()}20`,
                zIndex: -1 
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </div>
        )}
      </motion.div>
      
      <div className="text-center mt-2 small text-muted">
        {isActive ? 'Time Remaining' : 'Time Paused'}
      </div>
    </div>
  );
};

export default Timer;