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
    <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? '' : 'min-h-[120px] w-full'}`}
      style={fullScreen ? {
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } : {}}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glowing effect around spinner */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: container + 18,
            height: container + 18,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #a5d6a7 0%, transparent 70%)',
            zIndex: 0,
            filter: 'blur(4px)',
            opacity: 0.7,
          }}
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        />
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
          style={{ width: container, height: container, zIndex: 1, boxShadow: '0 4px 16px #58a70033' }}
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
              strokeWidth={stroke + 1.5}
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
              style={{ filter: 'drop-shadow(0 2px 8px #58a70055)' }}
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
                <stop offset="50%" stopColor="#FFD700" /> {/* Gold accent */}
                <stop offset="100%" stopColor="#58A700" /> {/* Duolingo green */}
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        {/* Optional center icon */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: duration * 1.5
              }}
            >
              <i className="material-icons" style={{ color: '#FFD700', fontSize: container / 2 }}>{size === 'lg' ? 'emoji_events' : 'auto_awesome'}</i>
            </motion.div>
          </div>
        )}
      </motion.div>
      {/* Label with pulsating animation */}
      {label && (
        <motion.div 
          className={`font-bold text-green-800 ${textSize}`}
          initial={{ opacity: 0.7, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: duration * 1.5,
            ease: 'easeInOut'
          }}
          style={{ textShadow: '0 2px 8px #fff, 0 1px 2px #0008', letterSpacing: '0.01em' }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
};

export default Loader;