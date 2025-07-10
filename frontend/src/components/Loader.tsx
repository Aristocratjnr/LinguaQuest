import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center min-h-[120px] w-full">
    <motion.div
      className="flex items-center justify-center"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      style={{ width: 56, height: 56 }}
    >
      <svg width={56} height={56} viewBox="0 0 56 56" fill="none">
        <circle
          cx={28}
          cy={28}
          r={24}
          stroke="#e0e7ff"
          strokeWidth={6}
          fill="none"
        />
        <motion.circle
          cx={28}
          cy={28}
          r={24}
          stroke="url(#loader-gradient)"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={150}
          strokeDashoffset={40}
          initial={{ pathLength: 0.2 }}
          animate={{ pathLength: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="loader-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
    {label && <div className="mt-3 text-blue-700 font-semibold text-base animate-pulse">{label}</div>}
  </div>
);

export default Loader; 