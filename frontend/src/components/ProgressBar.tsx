import React from 'react';

type ProgressBarProps = {
  round: number;
  totalRounds: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ round, totalRounds }) => {
  const progressPercent = ((round - 1) / totalRounds) * 100;
  return (
    <div className="lq-progress-bar-bg">
      <div className="lq-progress-bar" style={{ width: `${progressPercent}%` }} />
      <span className="lq-progress-label">Round {round} / {totalRounds}</span>
    </div>
  );
};

export default ProgressBar; 