import React from 'react';
import { motion } from 'framer-motion';
import streakIcon from '../assets/icons/fire.svg';
import highscoreIcon from '../assets/icons/trophy.svg';
import creativeIcon from '../assets/icons/sparkles.svg';
import perfectIcon from '../assets/icons/star.svg';

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
  <motion.div
    className="lq-card"
    style={{ maxWidth: 520, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem', textAlign: 'center' }}
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <h2 className="text-xl font-bold mb-6" style={{ color: '#764ba2' }}>Your Badges</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
      {badges.map(b => (
        <motion.div
          className="lq-badge flex flex-col items-center p-4 rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
          key={b}
          style={{ minWidth: 160 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <img src={BADGE_DATA[b].icon} alt={BADGE_DATA[b].label} className="lq-badge-icon mb-2" style={{ width: 48, height: 48 }} />
          <div className="lq-badge-label font-semibold text-lg text-blue-700 mb-1">{BADGE_DATA[b].label}</div>
          <div className="lq-badge-desc text-gray-600 text-sm">{BADGE_DATA[b].desc}</div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default Badges; 