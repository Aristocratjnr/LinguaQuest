import React from 'react';
import { motion } from 'framer-motion';

interface ClubMember {
  nickname: string;
  xp: number;
  avatar?: string;
}

interface ClubData {
  name: string;
  members: ClubMember[];
  groupGoal: number;
  groupProgress: number;
  challenge: string;
}

interface LanguageClubProps {
  club: ClubData;
  mascotImg: string;
  onClose: () => void;
}

const LanguageClub: React.FC<LanguageClubProps> = ({ club, mascotImg, onClose }) => {
  const sortedMembers = [...club.members].sort((a, b) => b.xp - a.xp);
  const progressPercent = Math.min(100, (club.groupProgress / club.groupGoal) * 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.55)',
      zIndex: 4100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)',
          borderRadius: 32,
          boxShadow: '0 12px 40px #1cb0f622, 0 2px 8px #1cb0f622',
          minWidth: 320,
          maxWidth: '95vw',
          minHeight: 320,
          maxHeight: '90vh',
          padding: '40px 24px 32px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          border: '2.5px solid #1cb0f6',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: '#1cb0f6',
            cursor: 'pointer',
          }}
          title="Close"
        >
          <span className="material-icons">close</span>
        </button>
        <h2 style={{ color: '#1cb0f6', fontWeight: 800, marginBottom: 18, fontSize: '2rem', letterSpacing: '.01em' }}>
          <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: 32, marginRight: 8 }}>group</span>
          {club.name}
        </h2>
        <div style={{ fontSize: '1.1rem', color: '#6c6f7d', marginBottom: 18 }}>{club.challenge}</div>
        {/* Group Progress Bar */}
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto 24px auto', background: 'linear-gradient(90deg, #e3f2fd 0%, #b3e5fc 100%)', borderRadius: 18, height: 28, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px #1cb0f622', border: '2px solid #1cb0f6' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, type: 'spring' }}
            style={{
              background: 'linear-gradient(90deg, #1cb0f6 0%, #58cc02 100%)',
              height: '100%',
              borderRadius: 18,
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 1,
              boxShadow: '0 2px 8px #1cb0f655',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1cb0f6', fontSize: '1.15rem', letterSpacing: '.01em' }}>
            <span className="material-icons" style={{ fontSize: 22, verticalAlign: 'middle', marginRight: 6, color: '#1cb0f6' }}>military_tech</span>
            {club.groupProgress} / {club.groupGoal} XP
          </div>
        </div>
        {/* Club Leaderboard */}
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
          <h3 style={{ color: '#1cb0f6', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10, letterSpacing: '.01em' }}>
            <span className="material-icons" style={{ fontSize: 22, verticalAlign: 'middle', marginRight: 6 }}>leaderboard</span>
            Club Leaderboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedMembers.map((m, idx) => (
              <motion.div
                key={m.nickname}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: idx === 0 ? 'linear-gradient(90deg, #1cb0f6 0%, #58cc02 100%)' : 'linear-gradient(90deg, #f0f4f8 0%, #e3f2fd 100%)',
                  color: idx === 0 ? '#fff' : '#1cb0f6',
                  borderRadius: 16,
                  padding: '10px 18px',
                  fontWeight: idx === 0 ? 900 : 700,
                  fontSize: '1.08rem',
                  boxShadow: idx === 0 ? '0 2px 8px #1cb0f655' : 'none',
                  border: idx === 0 ? '2px solid #1cb0f6' : '2px solid #e3f2fd',
                  position: 'relative',
                }}
              >
                <span style={{ fontWeight: 900, fontSize: '1.15rem', minWidth: 24, textAlign: 'center' }}>{idx + 1}</span>
                <img src={m.avatar || mascotImg} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #1cb0f6', objectFit: 'cover', background: '#fff', boxShadow: '0 2px 8px #1cb0f622' }} />
                <span style={{ flex: 1 }}>{m.nickname}</span>
                <span style={{ fontWeight: 900 }}>{m.xp} XP</span>
                {idx === 0 && <span className="material-icons" style={{ color: '#ffd700', fontSize: 22, marginLeft: 6 }}>emoji_events</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LanguageClub; 