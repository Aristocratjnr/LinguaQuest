import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC<{ 
  label?: string; 
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}> = ({ 
  label = 'Loading...', 
  size = 'md',
  fullScreen = false
}) => {
  const sizeMap = {
    sm: { 
      container: 32, 
      circle: 12, 
      stroke: 2,
      textSize: 'text-sm'
    },
    md: { 
      container: 48, 
      circle: 18, 
      stroke: 3,
      textSize: 'text-base'
    },
    lg: { 
      container: 64, 
      circle: 24, 
      stroke: 4,
      textSize: 'text-lg'
    }
  };

  const { container, circle, stroke, textSize } = sizeMap[size];
  const duration = size === 'sm' ? 0.8 : size === 'md' ? 1.0 : 1.2;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'fixed inset-0 bg-white bg-opacity-90 z-50' : 'min-h-[120px] w-full'}`}>
      <motion.div
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Main spinner */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity, 
            duration, 
            ease: 'linear' 
          }}
          style={{ width: container, height: container }}
        >
          <svg 
            width={container} 
            height={container} 
            viewBox={`0 0 ${container} ${container}`} 
            fill="none"
          >
            {/* Background circle */}
            <circle
              cx={container / 2}
              cy={container / 2}
              r={circle}
              stroke="#E5E7EB"
              strokeWidth={stroke}
              fill="none"
            />
            {/* Animated circle */}
            <motion.circle
              cx={container / 2}
              cy={container / 2}
              r={circle}
              stroke="url(#loader-gradient)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circle * 6}
              initial={{ pathLength: 0.25, rotate: 0 }}
              animate={{ 
                pathLength: [0.25, 1, 0.25],
                rotate: 90
              }}
              transition={{ 
                repeat: Infinity, 
                duration,
                ease: 'easeInOut',
                times: [0, 0.5, 1]
              }}
            />
            <defs>
              <linearGradient 
                id="loader-gradient" 
                x1="0" 
                y1="0" 
                x2="1" 
                y2="1"
              >
                <stop offset="0%" stopColor="#58A700" /> {/* Duolingo green */}
                <stop offset="50%" stopColor="#A5D6A7" /> {/* Light green */}
                <stop offset="100%" stopColor="#58A700" /> {/* Duolingo green */}
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Optional center icon */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: duration * 1.5
              }}
            >
              <i className="material-icons text-green-600">auto_awesome</i>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Label with pulsating animation */}
      {label && (
        <motion.div 
          className={`font-medium text-green-700 ${textSize}`}
          initial={{ opacity: 0.6, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: duration * 1.5,
            ease: 'easeInOut'
          }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
};

export default Loader;