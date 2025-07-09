import React from 'react';

type TimerProps = {
  seconds: number;
  timeLeft: number;
  isActive: boolean;
};

const Timer: React.FC<TimerProps> = ({ seconds, timeLeft, isActive }) => {
  const radius = 32;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = timeLeft / seconds;
  const strokeDashoffset = circumference * (1 - percent);
  return (
    <svg height={radius * 2} width={radius * 2} className="lq-timer-svg">
      <circle
        stroke="#e0e7ff"
        fill="none"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="url(#timer-gradient)"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: isActive ? 'stroke-dashoffset 1s linear' : 'none' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <defs>
        <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <text x="50%" y="54%" textAnchor="middle" fill="#764ba2" fontSize="1.2rem" fontWeight="bold" dy=".3em">{timeLeft}s</text>
    </svg>
  );
};

export default Timer; 