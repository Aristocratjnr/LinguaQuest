import React, { useEffect, useState } from 'react';
import defaultAvatar from '../assets/images/avatar.jpg';
import Loader from './Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { gameApi, LeaderboardEntry } from '../services/api';

interface Entry extends LeaderboardEntry {
  date?: string;
  level?: number;
}

const Leaderboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useSettings();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [engagementMap, setEngagementMap] = useState<Record<string, {streak: number, level: number}>>({});
  const [sortBy, setSortBy] = useState<'score' | 'streak' | 'level'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [profileModal, setProfileModal] = useState<null | Entry>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const leaderboardRes = await gameApi.getLeaderboard(100);
        
        setEntries(leaderboardRes.leaderboard);
        
        // Create engagement map from leaderboard data
        const map: Record<string, {streak: number, level: number}> = {};
        leaderboardRes.leaderboard.forEach((entry) => {
          map[entry.nickname] = { 
            streak: entry.current_streak, 
            level: Math.min(10, Math.max(1, Math.floor(entry.current_streak / 3) + 1)) // Calculate level from streak
          };
        });
        setEngagementMap(map);
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorting/filtering logic
  const filteredEntries = entries
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    .map(e => ({
      ...e,
      streak: engagementMap[e.name]?.streak,
      level: engagementMap[e.name]?.level
    }));

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aVal = sortBy === 'score' ? a.score : 
                sortBy === 'streak' ? (a.streak ?? -1) : 
                (a.level ?? -1);
    const bVal = sortBy === 'score' ? b.score : 
                sortBy === 'streak' ? (b.streak ?? -1) : 
                (b.level ?? -1);
    
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Badge logic
  const getBadges = (entry: Entry, rank: number) => {
    const badges = [];
    if ((entry.streak ?? 0) >= 5) badges.push({ text: '🔥 Streaker', color: '#ff9500' });
    if ((entry.level ?? 0) >= 5) badges.push({ text: '🏅 Pro', color: '#34c759' });
    if (rank < 3) badges.push({ text: `🥇 Top ${rank+1}`, color: '#5856d6' });
    return badges;
  };

  const getRankColor = (rank: number) => {
    if (rank === 0) return '#ffcc00'; // Gold
    if (rank === 1) return '#c0c0c0'; // Silver
    if (rank === 2) return '#cd7f32'; // Bronze
    return '#58a700'; // Duolingo green
  };

  return (
    <motion.div
      className="fixed inset-0 d-flex align-items-center justify-content-center p-4 z-50"
      style={{ background: theme === 'dark' ? 'rgba(24,28,42,0.85)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-[#232946] rounded-4 overflow-hidden w-100 position-relative shadow-lg"
        style={{ maxWidth: 700, width: '100%', borderRadius: 24, boxShadow: theme === 'dark' ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <div className="d-flex align-items-center gap-2">
            <span className="d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
              <i className="material-icons" style={{ fontSize: '1.5rem' }}>leaderboard</i>
            </span>
            <h2 className="fw-bold mb-0" style={{ color: '#58a700', fontSize: '1.15rem', letterSpacing: '.01em' }}>Leaderboard</h2>
            <span className="badge px-3 py-1 d-flex align-items-center ms-2" style={{ backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '.01em' }}>
              <i className="material-icons me-1" style={{ fontSize: '1rem' }}>emoji_events</i>
              Top Players
            </span>
          </div>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary rounded-circle ms-2 d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, border: 'none', background: theme === 'dark' ? '#232946' : '#f8f9fa' }}
            aria-label="Close leaderboard"
          >
            <i className="material-icons">close</i>
          </motion.button>
        </div>
        {/* Controls and Content */}
        <div className="p-0 p-md-4" style={{ minHeight: 400 }}>
          {/* Controls */}
          <div className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-center border-b">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="material-icons text-gray-400">search</i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search players..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="text-sm font-medium" style={{ color: '#6c757d' }}>Sort by:</div>
              <select
                className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="score">Score</option>
                <option value="streak">Streak</option>
                <option value="level">Level</option>
              </select>
              <button
                className="p-2 rounded-xl hover:bg-gray-100"
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              >
                {sortDir === 'asc' ? (
                  <i className="material-icons text-green-600">arrow_upward</i>
                ) : (
                  <i className="material-icons text-green-600">arrow_downward</i>
                )}
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader label="Loading leaderboard..." size="md" />
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                {error}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEntries.map((entry, index) => {
                  const badges = getBadges(entry, index);
                  return (
                    <motion.div
                      key={entry.name + index}
                      className="flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-all"
                      style={{ backgroundColor: '#f8f9fa' }}
                      whileHover={{ y: -2 }}
                      onClick={() => setProfileModal(entry)}
                    >
                      <div className="flex-shrink-0 relative">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full font-bold"
                          style={{
                            backgroundColor: getRankColor(index),
                            color: 'white'
                          }}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <img
                        src={entry.avatar || defaultAvatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full border-2 border-white shadow"
                        style={{ borderColor: getRankColor(index) }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate" style={{ color: '#333' }}>{entry.name}</h3>
                        {badges.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {badges.map((badge, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: badge.color, color: 'white' }}
                              >
                                {badge.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-bold" style={{ color: '#58a700' }}>{entry.score}</div>
                        <div className="flex gap-3 text-sm text-gray-500">
                          <span title="Streak">
                            <i className="material-icons align-text-bottom text-sm text-yellow-600">local_fire_department</i> {entry.streak ?? '-'}
                          </span>
                          <span title="Level">
                            <i className="material-icons align-text-bottom text-sm text-blue-500">star</i> {entry.level ?? '-'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Info/Help Section */}
        <div className="text-muted small px-4 py-3 d-flex align-items-center gap-2 border-top" style={{ color: theme === 'dark' ? '#a5b4fc' : '#6c757d', fontSize: '0.9rem', background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <span className="d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
          </span>
          Scores update in real time. Click a player for details and badges.
        </div>
        {/* Profile Modal (unchanged) */}
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
                    style={{ borderColor: getRankColor(sortedEntries.findIndex(e => e.name === profileModal.name)) }}
                  />
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#333' }}>{profileModal.name}</h3>
                  <div className="text-gray-500 mb-4">{new Date(profileModal.date).toLocaleDateString()}</div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">Score</div>
                      <div className="text-2xl font-bold" style={{ color: '#58a700' }}>{profileModal.score}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-xl">
                      <div className="text-sm text-yellow-600 mb-1">Streak</div>
                      <div className="text-2xl font-bold" style={{ color: '#ff9500' }}>{profileModal.streak ?? '-'}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                      <div className="text-sm text-green-600 mb-1">Level</div>
                      <div className="text-2xl font-bold" style={{ color: '#34c759' }}>{profileModal.level ?? '-'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: '#58a700' }}>Badges</h4>
                    {getBadges(profileModal, sortedEntries.findIndex(e => e.name === profileModal.name)).length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-content-center">
                        {getBadges(profileModal, sortedEntries.findIndex(e => e.name === profileModal.name)).map((badge, i) => (
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
    </motion.div>
  );
};

export default Leaderboard;