import React, { useState } from 'react';
import { motion } from 'framer-motion';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.png';
import avatar3 from '../assets/images/programmer.png';
import avatar4 from '../assets/images/avatar.png';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const AvatarPicker: React.FC<{ onConfirm: (avatar: string) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState(AVATARS[0]);

  return (
    <div className="lq-leaderboard-bg flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div
        className="lq-leaderboard-card"
        style={{ maxWidth: 420, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem', textAlign: 'center' }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#764ba2' }}>Choose Your Avatar</h2>
        <div className="flex justify-center gap-8 my-6">
          {AVATARS.map((a, i) => (
            <motion.div
              key={i}
              className={`transition-transform duration-150 ${selected === a ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(a)}
              whileTap={{ scale: 0.9 }}
              animate={selected === a ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <img
                src={a}
                alt={`Avatar ${i + 1}`}
                className={`lq-avatar-pick${selected === a ? ' lq-avatar-pick-selected' : ''}`}
                style={{ width: 72, height: 72, borderRadius: '50%', border: selected === a ? '3px solid #764ba2' : '2px solid #e0e7ff', boxShadow: selected === a ? '0 0 16px #764ba288' : '0 2px 8px #764ba233', transition: 'all 0.2s' }}
              />
            </motion.div>
          ))}
        </div>
        <button
          className="lq-btn lq-btn-scenario w-full mt-2"
          style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderRadius: 12 }}
          onClick={() => onConfirm(selected)}
        >
          Confirm
        </button>
      </motion.div>
    </div>
  );
};

export default AvatarPicker; 