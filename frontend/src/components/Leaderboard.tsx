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
      style={{ maxWidth: 800, width: '100%', borderRadius: 24, boxShadow: theme === 'dark' ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}
      {...motionProps}
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
        {modal && (
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary rounded-circle ms-2 d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, border: 'none', background: theme === 'dark' ? '#232946' : '#f8f9fa' }}
            aria-label="Close leaderboard"
          >
            <i className="material-icons">close</i>
          </motion.button>
        )}
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
        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {skeletonRows.map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl animate-pulse" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="flex-shrink-0 relative">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold bg-gray-300 text-gray-200">{i + 1}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-4 bg-gray-200 rounded w-10 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              {error}
            </div>
          ) : isEmpty ? (
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
              No players found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => {
                const badges = getBadges(entry, index);
                const isCurrentUser = user && user.nickname === entry.nickname;
                return (
                  <motion.div
                    key={entry.nickname + entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-all ${isCurrentUser ? 'ring-2 ring-green-500' : ''}`}
                    style={{ backgroundColor: '#f8f9fa' }}
                    whileHover={{ y: -2 }}
                    onClick={() => setProfileModal(entry)}
                  >
                    <div className="flex-shrink-0 relative">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full font-bold"
                        style={{
                          backgroundColor: getRankColor(entry.rank - 1),
                          color: 'white'
                        }}
                      >
                        {entry.rank}
                      </div>
                    </div>
                    <img
                      src={(entry as any).avatar_url || entry.avatar || defaultAvatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full border-2 shadow"
                      style={{
                        borderColor: getRankColor(entry.rank - 1),
                        objectFit: 'cover',
                        background: '#f0f2f5'
                      }}
                      onError={e => { e.currentTarget.src = defaultAvatar; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" style={{ color: '#333' }}>{entry.nickname}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap items-center">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700" title="Favorite Language">
                          <i className="material-icons align-text-bottom text-sm text-blue-500 mr-1">language</i> {entry.favorite_language}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700" title="Badges">
                          <i className="material-icons align-text-bottom text-sm text-green-500 mr-1">military_tech</i> {entry.badges_count} Badges
                        </span>
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
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-bold" style={{ color: '#58a700' }}>{entry.total_score}</div>
                      <div className="flex gap-3 text-sm text-gray-500">
                        <span title="Streak">
                          <i className="material-icons align-text-bottom text-sm text-yellow-600">local_fire_department</i> {entry.current_streak ?? '-'}
                        </span>
                        <span title="Level">
                          <i className="material-icons align-text-bottom text-sm text-blue-500">star</i> {entry.level ?? '-'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1" title="Last Activity">
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
        <div className="flex justify-between items-center mt-4 px-4">
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            Previous
          </button>
          <span className="text-muted small">Page {page + 1}</span>
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill"
            onClick={() => setPage(p => p + 1)}
            disabled={loading || entries.length < limit}
          >
            Next
          </button>
        </div>
      </div>
      {/* Info/Help Section */}
      <div className="text-muted small px-4 py-3 d-flex align-items-center gap-2 border-top" style={{ color: theme === 'dark' ? '#a5b4fc' : '#6c757d', fontSize: '0.9rem', background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <span className="d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
          <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
        </span>
        Scores update in real time. Click a player for details and badges.
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