import React from 'react';
import { motion } from 'framer-motion';
import defaultAvatar from '../assets/images/avatar.jpg';
import boyAvatar from '../assets/images/boy.png';
import womanAvatar from '../assets/images/woman.jpg';

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
      background: 'linear-gradient(135deg,rgb(237, 241, 233) 0%,rgb(235, 241, 235) 100%)', // solid green gradient
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
        className="language-club-modal"
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
        {/* Header styled like AvatarPicker */}
        <div style={{
          padding: '1.5rem',
          background: '#ffffff',
          textAlign: 'center',
          color: 'var(--text-light, #e0e7ff)',
          borderRadius: 24,
          marginBottom: 24,
          width: '100%',
          maxWidth: 420,
        }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              marginBottom: '0.75rem',
              boxShadow: '0 2px 8px #1cb0f622',
              overflow: 'hidden',
            }}>
              <img src={mascotImg} alt="mascot" style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 300,
              letterSpacing: '-0.025em',
              color: 'var(--text-light, #1cb0f6)',
              fontFamily: "Fira Mono, Menlo, Consolas, monospace"
            }}>
              {club.name}
            </h2>
            <p style={{
              margin: '0.5rem 0 0',
              opacity: 0.9,
              fontSize: '0.95rem',
              color: 'var(--text-dark, #6c6f7d)',
              fontWeight: 300,
              fontFamily: "Fira Mono, Menlo, Consolas, monospace"
            }}>
              {club.challenge}
            </p>
          </motion.div>
        </div>
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
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1cb0f6', fontSize: '1.15rem', letterSpacing: '.01em', fontFamily: "Fira Mono, Menlo, Consolas, monospace", fontWeight: 300 }}>
            <span className="material-icons" style={{ fontSize: 22, verticalAlign: 'middle', marginRight: 6, color: '#1cb0f6' }}>military_tech</span>
            {club.groupProgress} / {club.groupGoal} XP
          </div>
        </div>
        {/* Club Leaderboard */}
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
          <h3 style={{ color: '#1cb0f6', fontWeight: 300, fontSize: '1.1rem', marginBottom: 10, letterSpacing: '.01em', fontFamily: "Fira Mono, Menlo, Consolas, monospace" }}>
            <span className="material-icons" style={{ fontSize: 22, verticalAlign: 'middle', marginRight: 6 }}>leaderboard</span>
            Club Leaderboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedMembers.map((m, idx) => {
              // Assign avatars in round-robin order if member.avatar is not set
              const fallbackAvatars = [defaultAvatar, boyAvatar, womanAvatar];
              const assignedAvatar = m.avatar || fallbackAvatars[idx % fallbackAvatars.length] || mascotImg;
              return (
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
                  <span style={{ fontWeight: 300, fontSize: '1.15rem', minWidth: 24, textAlign: 'center', fontFamily: "Fira Mono, Menlo, Consolas, monospace" }}>{idx + 1}</span>
                  <img src={assignedAvatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #1cb0f6', objectFit: 'cover', background: '#fff', boxShadow: '0 2px 8px #1cb0f622' }} />
                  <span style={{ flex: 1, fontWeight: 300, fontFamily: "Fira Mono, Menlo, Consolas, monospace" }}>{m.nickname}</span>
                  <span style={{ fontWeight: 300, fontFamily: "Fira Mono, Menlo, Consolas, monospace" }}>{m.xp} XP</span>
                  {idx === 0 && <span className="material-icons" style={{ color: '#ffd700', fontSize: 22, marginLeft: 6 }}>emoji_events</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      <style>{`
        .language-club-modal::-webkit-scrollbar {
          display: none;
        }
        .language-club-modal {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};

export default LanguageClub; 