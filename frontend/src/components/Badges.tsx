import React from 'react';
import streakIcon from './badge-streak.svg';
import highscoreIcon from './badge-highscore.svg';
import creativeIcon from './badge-creative.svg';
import perfectIcon from './badge-perfect.svg';

const BADGE_DATA: Record<string, { icon: string; label: string; desc: string }> = {
  streak: {
    icon: streakIcon,
    label: 'Streak Master',
    desc: 'Win 3+ rounds in a row',
  },
  highscore: {
    icon: highscoreIcon,
    label: 'High Scorer',
    desc: 'Score 8 or more points',
  },
  creative: {
    icon: creativeIcon,
    label: 'Creative Persuader',
    desc: 'Use a wide vocabulary or unique arguments',
  },
  perfect: {
    icon: perfectIcon,
    label: 'Perfect Game',
    desc: 'Persuade the AI in every round',
  },
};

const Badges: React.FC<{ badges: string[] }> = ({ badges }) => (
  <div className="lq-badges">
    {badges.map(b => (
      <div className="lq-badge" key={b}>
        <img src={BADGE_DATA[b].icon} alt={BADGE_DATA[b].label} className="lq-badge-icon" />
        <div className="lq-badge-label">{BADGE_DATA[b].label}</div>
        <div className="lq-badge-desc">{BADGE_DATA[b].desc}</div>
      </div>
    ))}
  </div>
);

export default Badges; 