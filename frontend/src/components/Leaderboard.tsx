import React, { useEffect, useState } from 'react';
import defaultAvatar from '../assets/images/avatar.jpg';
import Loader from './Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { gameApi, LeaderboardEntry } from '../services/api';
import { useUser } from '../context/UserContext';

interface LeaderboardProps {
  onClose: () => void;
  modal?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, modal = true }) => {
  const { theme } = useSettings();
  const { user } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'streak' | 'level'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [profileModal, setProfileModal] = useState<null | LeaderboardEntry>(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const leaderboardRes = await gameApi.getLeaderboard(limit, page * limit, sortBy, sortDir);
        console.log('Leaderboard response:', leaderboardRes);
        if (!Array.isArray(leaderboardRes)) {
          setError('Leaderboard data is not an array. Check backend response format.');
          setEntries([]);
        } else {
          setEntries(leaderboardRes);
        }
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sortBy, sortDir, page]);

  // Filtered and searched entries
  const filteredEntries = entries.filter(e =>
    e.nickname.toLowerCase().includes(search.toLowerCase())
  );

  // Badge logic
  const getBadges = (entry: LeaderboardEntry, rank: number) => {
    const badges = [];
    if ((entry.current_streak ?? 0) >= 5) badges.push({ text: '🔥 Streaker', color: '#ff9500' });
    if ((entry.level ?? 0) >= 5) badges.push({ text: '🏅 Pro', color: '#34c759' });
    if (rank < 3) badges.push({ text: `🥇 Top ${rank + 1}`, color: '#5856d6' });
    return badges;
  };

  const getRankColor = (rank: number) => {
    if (rank === 0) return '#ffcc00'; // Gold
    if (rank === 1) return '#c0c0c0'; // Silver
    if (rank === 2) return '#cd7f32'; // Bronze
    return '#58a700'; // Duolingo green
  };

  // Skeleton loader
  const skeletonRows = Array.from({ length: limit }, (_, i) => i);

  // Empty state
  const isEmpty = !loading && filteredEntries.length === 0;

  // Main leaderboard content (shared by modal and non-modal)
  const motionProps = modal
    ? {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 50, opacity: 0 },
        transition: { type: 'spring' as const, damping: 25 },
      }
    : {};

  const leaderboardContent = (
    <motion.div
      className={modal ? "bg-white dark:bg-[#232946] rounded-4 overflow-hidden w-100 position-relative shadow-lg" : "bg-white dark:bg-[#232946] rounded-4 overflow-hidden w-100 shadow-lg my-4"}
      style={{ 
        maxWidth: '95vw',
        width: '100%',
        minWidth: 0,
        borderRadius: 32, 
        boxShadow: theme === 'dark' 
          ? '0 20px 60px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.2)' 
          : '0 20px 60px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(88, 204, 2, 0.08)',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #232946 0%, #1a1f35 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        overflow: 'hidden',
      }}
      {...motionProps}
    >
      {/* Header */}
      <div style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32,
        padding: 'clamp(16px, 5vw, 32px)',
        borderBottom: theme === 'dark' 
          ? '1px solid rgba(255,255,255,0.1)' 
          : '1px solid rgba(88, 204, 2, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(88, 204, 2, 0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '-15px',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(28, 176, 246, 0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        
        <div className="d-flex align-items-center justify-content-between" style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #58cc02 0%, #3caa3c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(88, 204, 2, 0.25)',
              border: '1px solid rgba(88, 204, 2, 0.2)'
            }}>
              <i className="material-icons" style={{ 
                fontSize: '24px', 
                color: '#ffffff',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}>
                leaderboard
              </i>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ 
                color: theme === 'dark' ? '#ffffff' : '#2d3748', 
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                letterSpacing: '.01em',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700
              }}>
                Leaderboard
              </h2>
              <span style={{
                color: theme === 'dark' ? '#a0aec0' : '#718096',
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Global Rankings
          </span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
              color: '#58cc02',
              borderRadius: '20px',
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
              letterSpacing: '.01em',
              border: '1px solid rgba(88, 204, 2, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(88, 204, 2, 0.15)'
            }}>
              <i className="material-icons" style={{ fontSize: '16px' }}>emoji_events</i>
            Top Players
            </div>
        </div>
        {modal && (
            <motion.button 
              whileHover={{ scale: 1.08, rotate: 90 }} 
              whileTap={{ scale: 0.95 }}
            onClick={onClose}
              style={{
                width: '44px',
                height: '44px',
                border: 'none',
                borderRadius: '12px',
                background: theme === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(108, 122, 137, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme === 'dark' ? '#ffffff' : '#6c757d',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = theme === 'dark' 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'rgba(108, 122, 137, 0.2)';
                e.currentTarget.style.color = '#58cc02';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = theme === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(108, 122, 137, 0.1)';
                e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#6c757d';
              }}
            aria-label="Close leaderboard"
          >
              <i className="material-icons" style={{ fontSize: '20px' }}>close</i>
          </motion.button>
        )}
        </div>
      </div>
      {/* Controls and Content */}
      <div className="p-0 p-md-4" style={{ minHeight: 400, padding: 'clamp(8px, 3vw, 32px)' }}>
        {/* Controls */}
        <div style={{
          padding: 'clamp(12px, 3vw, 32px)',
          borderBottom: theme === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(88, 204, 2, 0.1)',
          background: theme === 'dark' 
            ? 'rgba(255,255,255,0.02)' 
            : 'rgba(88, 204, 2, 0.02)'
        }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="material-icons" style={{ 
                  color: theme === 'dark' ? '#a0aec0' : '#718096',
                  fontSize: '20px'
                }}>search</i>
            </div>
            <input
              type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
                  borderRadius: '16px',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#2d3748',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search players..."
              value={search}
              onChange={e => setSearch(e.target.value)}
                onFocus={e => {
                  e.target.style.borderColor = '#58cc02';
                  e.target.style.boxShadow = '0 4px 16px rgba(88, 204, 2, 0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
            />
          </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div style={{ 
                color: theme === 'dark' ? '#a0aec0' : '#718096',
                fontSize: 'clamp(0.8rem, 2vw, 14px)',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Sort by:
              </div>
            <select
                style={{
                  padding: '10px 16px',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
                  borderRadius: '12px',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#2d3748',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
                onFocus={e => {
                  e.target.style.borderColor = '#58cc02';
                  e.target.style.boxShadow = '0 4px 16px rgba(88, 204, 2, 0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
            >
              <option value="score">Score</option>
              <option value="streak">Streak</option>
              <option value="level">Level</option>
            </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                onMouseOver={e => {
                  e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.1)';
                  e.currentTarget.style.borderColor = '#58cc02';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)';
                  e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
                }}
              >
                <i className="material-icons" style={{ 
                  color: '#58cc02',
                  fontSize: '20px'
                }}>
                  {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </i>
              </motion.button>
            </div>
          </div>
        </div>
        {/* Content Table */}
        <div style={{ 
          padding: 'clamp(12px, 3vw, 32px)',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {skeletonRows.map(i => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '20px',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(88, 204, 2, 0.08)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#cbd5e0'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      height: '16px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                      borderRadius: '8px',
                      width: '60%',
                      marginBottom: '8px'
                    }}></div>
                    <div style={{
                      height: '12px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      borderRadius: '6px',
                      width: '40%'
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{
                      height: '16px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                      borderRadius: '8px',
                      width: '60px'
                    }}></div>
                    <div style={{
                      height: '12px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      borderRadius: '6px',
                      width: '40px'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
              color: theme === 'dark' ? '#fca5a5' : '#b91c1c',
              border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fecaca'
            }}>
              <i className="material-icons" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.7 }}>error_outline</i>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{error}</div>
            </div>
          ) : isEmpty ? (
            <div style={{
              padding: '48px 24px',
              borderRadius: '20px',
              textAlign: 'center',
              background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
              color: theme === 'dark' ? '#a0aec0' : '#718096',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(88, 204, 2, 0.08)'
            }}>
              <i className="material-icons" style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>search_off</i>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No players found</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Try adjusting your search criteria</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredEntries.map((entry, index) => {
                const badges = getBadges(entry, index);
                const isCurrentUser = user && user.nickname === entry.nickname;
                return (
                  <motion.div
                    key={entry.nickname + entry.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      borderRadius: '20px',
                      background: isCurrentUser 
                        ? theme === 'dark' 
                          ? 'linear-gradient(135deg, rgba(88, 204, 2, 0.15) 0%, rgba(88, 204, 2, 0.05) 100%)' 
                          : 'linear-gradient(135deg, rgba(88, 204, 2, 0.1) 0%, rgba(88, 204, 2, 0.05) 100%)'
                        : theme === 'dark' 
                          ? 'rgba(255,255,255,0.02)' 
                          : '#ffffff',
                      border: isCurrentUser
                        ? '2px solid #58cc02'
                        : theme === 'dark' 
                          ? '1px solid rgba(255,255,255,0.05)' 
                          : '1px solid rgba(88, 204, 2, 0.08)',
                      boxShadow: isCurrentUser
                        ? '0 8px 32px rgba(88, 204, 2, 0.15)'
                        : '0 2px 8px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{ 
                      y: -2,
                      boxShadow: isCurrentUser
                        ? '0 12px 40px rgba(88, 204, 2, 0.2)'
                        : '0 4px 16px rgba(0,0,0,0.08)'
                    }}
                    onClick={() => setProfileModal(entry)}
                  >
                    {/* Current user indicator */}
                    {isCurrentUser && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#58cc02',
                        boxShadow: '0 0 8px rgba(88, 204, 2, 0.5)'
                      }} />
                    )}
                    
                    {/* Rank */}
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${getRankColor(entry.rank - 1)} 0%, ${getRankColor(entry.rank - 1)}dd 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          color: '#ffffff',
                          boxShadow: `0 4px 16px ${getRankColor(entry.rank - 1)}40`,
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {entry.rank}
                      </div>
                    </div>
                    
                    {/* Avatar */}
                    <img
                      src={(entry as any).avatar_url || entry.avatar || defaultAvatar}
                      alt="avatar"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: `3px solid ${getRankColor(entry.rank - 1)}`,
                        objectFit: 'cover',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f0f2f5',
                        boxShadow: `0 4px 16px ${getRankColor(entry.rank - 1)}30`
                      }}
                      onError={e => { e.currentTarget.src = defaultAvatar; }}
                    />
                    
                    {/* Player Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        fontWeight: 700, 
                        color: theme === 'dark' ? '#ffffff' : '#2d3748',
                        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                        marginBottom: '8px',
                        fontFamily: 'JetBrains Mono, monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {entry.nickname}
                        {isCurrentUser && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            color: '#58cc02',
                            fontWeight: 600
                          }}>
                            (You)
                          </span>
                        )}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
                          color: theme === 'dark' ? '#93c5fd' : '#1e40af',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <i className="material-icons" style={{ fontSize: '14px' }}>language</i>
                          {entry.favorite_language}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                          color: theme === 'dark' ? '#86efac' : '#166534',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <i className="material-icons" style={{ fontSize: '14px' }}>military_tech</i>
                          {entry.badges_count} Badges
                        </span>
                        {badges.map((badge, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: badge.color,
                              color: '#ffffff',
                              fontWeight: 600,
                              boxShadow: `0 2px 8px ${badge.color}40`
                            }}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Score and Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: 'clamp(1.2rem, 3vw, 20px)',
                        color: '#58cc02',
                        textShadow: '0 1px 2px rgba(88, 204, 2, 0.1)'
                      }}>
                        {entry.total_score}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: 'clamp(0.9rem, 2vw, 14px)', color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="material-icons" style={{ fontSize: '16px', color: '#ff9500' }}>local_fire_department</i>
                          {entry.current_streak ?? '-'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="material-icons" style={{ fontSize: '16px', color: '#3b82f6' }}>star</i>
                          {entry.level ?? '-'}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 'clamp(0.8rem, 2vw, 12px)',
                        color: theme === 'dark' ? '#718096' : '#a0aec0',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        Last: {entry.last_activity ? new Date(entry.last_activity).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(12px, 3vw, 32px)',
          borderTop: theme === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(88, 204, 2, 0.1)',
          background: theme === 'dark' 
            ? 'rgba(255,255,255,0.02)' 
            : 'rgba(88, 204, 2, 0.02)'
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
              color: theme === 'dark' ? '#ffffff' : '#2d3748',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            onMouseOver={e => {
              if (!(page === 0 || loading)) {
                e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.1)';
                e.currentTarget.style.borderColor = '#58cc02';
              }
            }}
            onMouseOut={e => {
              if (!(page === 0 || loading)) {
                e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
              }
            }}
          >
            <i className="material-icons" style={{ fontSize: '18px' }}>chevron_left</i>
            Previous
          </motion.button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
            color: theme === 'dark' ? '#a0aec0' : '#718096',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <i className="material-icons" style={{ fontSize: '16px', color: '#58cc02' }}>pageview</i>
            Page {page + 1}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
              color: theme === 'dark' ? '#ffffff' : '#2d3748',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            onClick={() => setPage(p => p + 1)}
            disabled={loading || entries.length < limit}
            onMouseOver={e => {
              if (!(loading || entries.length < limit)) {
                e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.1)';
                e.currentTarget.style.borderColor = '#58cc02';
              }
            }}
            onMouseOut={e => {
              if (!(loading || entries.length < limit)) {
                e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(88, 204, 2, 0.05)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
              }
            }}
          >
            Next
            <i className="material-icons" style={{ fontSize: '18px' }}>chevron_right</i>
          </motion.button>
        </div>
      </div>
      {/* Info/Help Section */}
      <div style={{
        padding: 'clamp(10px, 2vw, 32px)',
        borderTop: theme === 'dark' 
          ? '1px solid rgba(255,255,255,0.1)' 
          : '1px solid rgba(88, 204, 2, 0.1)',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: theme === 'dark' ? '#a5b4fc' : '#6c757d',
        fontSize: 'clamp(12px, 2vw, 14px)',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(88, 204, 2, 0.15)',
          border: '1px solid rgba(88, 204, 2, 0.2)'
        }}>
          <i className="material-icons" style={{ 
            fontSize: '18px',
            color: '#58cc02'
          }}>info</i>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>
            Real-time Updates
          </div>
          <div style={{ opacity: 0.8, fontSize: '13px' }}>
            Scores update in real time. Click a player for detailed profile and badges.
          </div>
        </div>
      </div>
      {/* Profile Modal */}
      <AnimatePresence>
        {profileModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-content-center p-4 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProfileModal(null)}
          >
            <motion.div
              className="bg-white rounded-2xl overflow-hidden w-full max-w-md"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b flex items-center justify-content-between" style={{ backgroundColor: '#f8f9fa' }}>
                <h3 className="text-lg font-bold" style={{ color: '#58a700' }}>Player Profile</h3>
                <button
                  onClick={() => setProfileModal(null)}
                  className="rounded-full p-1 hover:bg-gray-200"
                >
                  <i className="material-icons">close</i>
                </button>
              </div>
              <div className="p-5 text-center">
                <img
                  src={profileModal.avatar || defaultAvatar}
                  alt="avatar"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-4"
                  style={{ borderColor: getRankColor(profileModal.rank - 1) }}
                />
                <h3 className="text-xl font-bold mb-1" style={{ color: '#333' }}>{profileModal.nickname}</h3>
                <div className="text-gray-500 mb-4">Last active: {profileModal.last_activity ? new Date(profileModal.last_activity).toLocaleDateString() : '-'}</div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="text-sm text-blue-600 mb-1">Score</div>
                    <div className="text-2xl font-bold" style={{ color: '#58a700' }}>{profileModal.total_score}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-xl">
                    <div className="text-sm text-yellow-600 mb-1">Streak</div>
                    <div className="text-2xl font-bold" style={{ color: '#ff9500' }}>{profileModal.current_streak ?? '-'}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl">
                    <div className="text-sm text-green-600 mb-1">Level</div>
                    <div className="text-2xl font-bold" style={{ color: '#34c759' }}>{profileModal.level ?? '-'}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 mr-2" title="Favorite Language">
                    <i className="material-icons align-text-bottom text-sm text-blue-500 mr-1">language</i> {profileModal.favorite_language}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700" title="Badges">
                    <i className="material-icons align-text-bottom text-sm text-green-500 mr-1">military_tech</i> {profileModal.badges_count} Badges
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#58a700' }}>Badges</h4>
                  {getBadges(profileModal, profileModal.rank - 1).length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-content-center">
                      {getBadges(profileModal, profileModal.rank - 1).map((badge, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-full flex items-center gap-1"
                          style={{ backgroundColor: badge.color, color: 'white' }}
                        >
                          <span>{badge.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400">No badges yet</div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t flex justify-content-center">
                <button
                  className="px-6 py-2 rounded-xl font-medium"
                  style={{ backgroundColor: '#58a700', color: 'white' }}
                  onClick={() => setProfileModal(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (modal) {
    return (
      <motion.div
        className="fixed inset-0 d-flex align-items-center justify-content-center p-4 z-50"
        style={{ background: theme === 'dark' ? 'rgba(24,28,42,0.85)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {leaderboardContent}
      </motion.div>
    );
  } else {
    return (
      <div className="container my-4">
        {leaderboardContent}
      </div>
    );
  }
};

export default Leaderboard;