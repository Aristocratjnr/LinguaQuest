import React from 'react';

type ProgressBarProps = {
  round: number;
  totalRounds: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ round, totalRounds }) => {
  const progressPercent = ((round - 1) / totalRounds) * 100;
  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <div className="relative h-5 bg-blue-100 rounded-full shadow-inner overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-400 to-purple-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%`, minWidth: round > 1 ? 24 : 0 }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-900" style={{ letterSpacing: 0.5 }}>
          Round {round} / {totalRounds}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar; 