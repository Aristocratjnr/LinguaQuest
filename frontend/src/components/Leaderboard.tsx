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
  const [language] = useState('en'); // Default to English

  // Map language codes to BCP-47 language tags
  const langMap: Record<string, string> = {
    twi: 'tw',
    gaa: 'gaa',
    ewe: 'ee',
    en: 'en'
  };
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
        console.log('Fetching leaderboard data...');
        const leaderboardRes = await gameApi.getLeaderboard(limit, page * limit, sortBy, sortDir);
        console.log('Leaderboard response:', leaderboardRes);
        
        // Handle different response formats with proper typing
        let leaderboardData: LeaderboardEntry[] = [];
        
        if (Array.isArray(leaderboardRes)) {
          // Direct array response
          leaderboardData = leaderboardRes as LeaderboardEntry[];
        } else if (leaderboardRes && typeof leaderboardRes === 'object' && 'leaderboard' in leaderboardRes) {
          // Wrapped response format
          const wrappedData = leaderboardRes as { leaderboard: LeaderboardEntry[] };
          leaderboardData = Array.isArray(wrappedData.leaderboard) ? wrappedData.leaderboard : [];
        } else {
          console.error('Leaderboard data is not in expected format:', leaderboardRes);
          setError('Invalid leaderboard data format received from server.');
          setEntries([]);
          return;
        }
        
        console.log('Setting leaderboard entries:', leaderboardData);
        setEntries(leaderboardData);
      } catch (err: any) {
        console.error('Leaderboard fetch error:', err);
        
        // Provide fallback data when server is unavailable
        const fallbackEntries = [
          {
            rank: 1,
            nickname: "Demo Player 1",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo1",
            total_score: 1250,
            highest_score: 10,
            games_played: 15,
            current_streak: 5,
            longest_streak: 8,
            badges_count: 3,
            last_activity: new Date().toISOString(),
            favorite_language: "twi",
            level: 12
          },
          {
            rank: 2,
            nickname: "Demo Player 2", 
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo2",
            total_score: 1100,
            highest_score: 9,
            games_played: 12,
            current_streak: 3,
            longest_streak: 6,
            badges_count: 2,
            last_activity: new Date().toISOString(),
            favorite_language: "twi",
            level: 11
          },
          {
            rank: 3,
            nickname: "Demo Player 3",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo3", 
            total_score: 950,
            highest_score: 8,
            games_played: 10,
            current_streak: 2,
            longest_streak: 4,
            badges_count: 1,
            last_activity: new Date().toISOString(),
            favorite_language: "twi",
            level: 9
          }
        ];
        
        setEntries(fallbackEntries);
        setError('Using demo data - server connection failed.');
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

  // Remove leaderboardContent variable and all references to it
  // Render all modal content directly in the modal card (motion.div)
  if (modal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(20,20,30,0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5vh',
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #fffbe6 0%, #ffe082 100%)',
            borderRadius: 32,
            boxShadow: '0 0 0 4px #ffe08255, 0 16px 48px #ffb30033, 0 2px 8px #ffb30022',
            minWidth: 300,
            maxWidth: 650,
            width: '95vw',
            minHeight: 120,
            maxHeight: '70vh',
            overflowY: 'auto',
            // maxHeight: '90vh', // Remove this line
            padding: '40px 24px 32px 24px',
            // overflowY: 'auto', // Remove this line
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            border: '3px solid #ffb300',
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
              fontSize: 36,
              color: '#ffb300',
              cursor: 'pointer',
              zIndex: 10,
              padding: 0,
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 8px #ffb30088)'
            }}
            title="Close Leaderboard"
            aria-label="Close Leaderboard"
          >
            <span className="material-icons" style={{ fontSize: 36 }}>close</span>
          </button>
          {/* Header */}
          <div style={{ 
            background: 'none',
            borderTopLeftRadius: 32, 
            borderTopRightRadius: 32,
            padding: 'clamp(16px, 5vw, 32px)',
            borderBottom: '1px solid rgba(255, 193, 7, 0.18)',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            marginBottom: 0
          }}>
            <div className="d-flex align-items-center justify-content-between" style={{ position: 'relative', zIndex: 1 }}>
              <div className="d-flex align-items-center gap-4">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px #ffb30033',
                  border: '1px solid #ffecb3'
                }}>
                  <i className="material-icons" style={{ 
                    fontSize: '24px', 
                    color: '#ffb300',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }}>
                    leaderboard
                  </i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ 
                    color: '#b28704', 
                    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                    letterSpacing: '.01em',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    Leaderboard
                  </h2>
                  <span style={{
                    color: '#b28704',
                    fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                    fontFamily: 'JetBrains Mono, monospace',
                    minWidth: 0,
                    display: 'block',
                    overflow: 'visible',
                    whiteSpace: 'normal',
                  }}>
                    Global Rankings
                  </span>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fffde7 0%, #ffe082 100%)',
                  color: '#ffb300',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                  letterSpacing: '.01em',
                  border: '1px solid #ffe082',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px #ffb30022'
                }}>
                  <i className="material-icons" style={{ fontSize: '16px' }}>emoji_events</i>
                  Top Players
                </div>
              </div>
            </div>
          </div>
          {/* Controls and Content */}
          <div className="p-0 p-md-4" style={{ minHeight: 400, padding: 'clamp(8px, 3vw, 32px)', width: '100%' }}>
            {/* Controls */}
            <div style={{
              padding: '8px 8px',
              borderBottom: theme === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(88, 204, 2, 0.1)',
              background: theme === 'dark' 
                ? 'rgba(255,255,255,0.02)' 
                : 'rgba(88, 204, 2, 0.02)',
              marginBottom: 10,
            }}>
              <div style={{display: "flex", flexDirection: "column", gap: "12px", width: "100%"}} className="sm:flex-row sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-[320px]" style={{width: "100%"}}>
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
                    padding: '6px 10px 6px 36px',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
                    borderRadius: '10px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#2d3748',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                  }}
                  className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search players..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  lang="en"
                  onFocus={e => {
                    e.target.style.borderColor = '#58cc02';
                    e.target.style.boxShadow = '0 2px 8px rgba(88, 204, 2, 0.10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
                    e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
                  }}
                />
              </div>
                
                {/* Sort Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto" style={{display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "space-between"}}>
                  <div style={{ 
                    color: theme === 'dark' ? '#a0aec0' : '#718096',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    Sort by:
                  </div>
                <select
                  style={{
                    padding: '6px 10px',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)'}`,
                    borderRadius: '10px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#2d3748',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                  }}
                  className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  onFocus={e => {
                    e.target.style.borderColor = '#58cc02';
                    e.target.style.boxShadow = '0 2px 8px rgba(88, 204, 2, 0.10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(88, 204, 2, 0.2)';
                    e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
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
              // maxHeight and overflowY removed to make all content visible
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
                          gap: 'clamp(8px, 3vw, 16px)',
                          padding: 'clamp(12px, 4vw, 20px)',
                          flexWrap: 'nowrap',
                          borderRadius: '20px',
                          background: isCurrentUser 
                            ? 'linear-gradient(135deg, #d7f7c8 0%, #58cc02 100%)' 
                            : theme === 'dark' 
                              ? 'rgba(255,255,255,0.02)' 
                              : '#ffffff',
                          border: isCurrentUser
                            ? '2.5px solid #1cb0f6'
                            : theme === 'dark' 
                              ? '1px solid rgba(255,255,255,0.05)' 
                              : '1px solid rgba(88, 204, 2, 0.08)',
                          boxShadow: isCurrentUser
                            ? '0 0 16px 4px #1cb0f655, 0 8px 32px rgba(88, 204, 2, 0.18)'
                            : '0 2px 8px rgba(0,0,0,0.04)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          overflow: 'hidden'
                        }}
                        whileHover={{ 
                          y: -2,
                          boxShadow: isCurrentUser
                            ? '0 0 32px 8px #1cb0f6aa, 0 12px 40px rgba(88, 204, 2, 0.2)'
                            : '0 4px 16px rgba(0,0,0,0.08)'
                        }}
                       animate={isCurrentUser ? { boxShadow: [
                         '0 0 16px 4px #1cb0f655, 0 8px 32px rgba(88, 204, 2, 0.18)',
                         '0 0 32px 8px #1cb0f6aa, 0 8px 32px rgba(88, 204, 2, 0.18)',
                         '0 0 16px 4px #1cb0f655, 0 8px 32px rgba(88, 204, 2, 0.18)'
                       ] } : {}}
                       transition={isCurrentUser ? { duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' } : {}}
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
                              width: 'clamp(36px, 6vw, 48px)',
                              height: 'clamp(36px, 6vw, 48px)',
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
                            width: 'clamp(45px, 7vw, 56px)',
                            height: 'clamp(45px, 7vw, 56px)',
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
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', maxWidth: '100%' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: 'auto' }}>
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
              flexWrap: 'wrap',
              gap: '12px',
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
        </motion.div>
      </div>
    );
  } else {
    return (
      <div className="container my-4">
        {/* ... existing code ... */}
      </div>
    );
  }
};

export default Leaderboard;