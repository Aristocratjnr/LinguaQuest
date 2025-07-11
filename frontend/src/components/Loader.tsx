import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  label = 'Loading...', 
  size = 'md' 
}) => {
  const sizeMap = {
    sm: { container: 40, circle: 16, stroke: 3 },
    md: { container: 56, circle: 24, stroke: 4 },
    lg: { container: 72, circle: 32, stroke: 5 }
  };

  const { container, circle, stroke } = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center min-h-[120px] w-full gap-3">
      <motion.div
        className="flex items-center justify-center"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: size === 'sm' ? 0.8 : 1.2, 
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
          <circle
            cx={container / 2}
            cy={container / 2}
            r={circle}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={container / 2}
            cy={container / 2}
            r={circle}
            stroke="url(#loader-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circle * 6}
            strokeDashoffset={circle * 2}
            initial={{ pathLength: 0.2 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              repeat: Infinity, 
              duration: size === 'sm' ? 0.8 : 1.2, 
              ease: 'easeInOut' 
            }}
          />
          <defs>
            <linearGradient 
              id="loader-gradient" 
              x1="0" 
              y1="0" 
              x2="1" 
              y2="1"
              gradientTransform="rotate(45)"
            >
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {label && (
        <motion.div 
          className={`text-indigo-600 font-medium ${
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
          }`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1.5,
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