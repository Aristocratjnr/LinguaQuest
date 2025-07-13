import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultAvatar from '../assets/images/avatar.jpg';
import Loader from './Loader';

interface Entry {
  name: string;
  score: number;
  date: string;
  avatar?: string;
  streak?: number;
  level?: number;
}

const Leaderboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [engagementMap, setEngagementMap] = useState<Record<string, {streak: number, level: number}>>({});
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'streak' | 'level'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [profileModal, setProfileModal] = useState<null | Entry>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('/leaderboard')
      .then(res => {
        setEntries(res.data.leaderboard);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load leaderboard.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setEngagementLoading(true);
    setEngagementError('');
    axios.get('/users')
      .then(res => {
        const map: Record<string, {streak: number, level: number}> = {};
        for (const u of res.data.users) {
          map[u.nickname] = { streak: u.streak, level: u.level };
        }
        setEngagementMap(map);
        setEngagementLoading(false);
      })
      .catch(() => {
        setEngagementError('Failed to load engagement stats.');
        setEngagementLoading(false);
      });
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
    let aVal, bVal;
    if (sortBy === 'score') {
      aVal = a.score;
      bVal = b.score;
    } else if (sortBy === 'streak') {
      aVal = a.streak ?? -1;
      bVal = b.streak ?? -1;
    } else {
      aVal = a.level ?? -1;
      bVal = b.level ?? -1;
    }
    if (aVal === bVal) return 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Badge logic
  function getBadges(entry: Entry, rank: number) {
    const badges = [];
    if ((entry.streak ?? 0) >= 5) badges.push('🔥 Streaker');
    if ((entry.level ?? 0) >= 5) badges.push('🏅 Level Up');
    if (rank < 3) badges.push('🥇 Top 3');
    return badges;
  }

  return (
    <div className="lq-leaderboard-bg flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="lq-leaderboard-card" style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#764ba2' }}>Leaderboard</h2>
          <button
            className="lq-btn lq-btn-scenario px-4 py-2 text-base font-semibold rounded-lg"
            style={{ borderRadius: 10 }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {/* Sorting/filtering controls */}
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
          <div className="input-group" style={{ maxWidth: 220 }}>
            <span className="input-group-text"><i className="material-icons">search</i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search nickname..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontFamily: 'inherit', fontSize: '1rem' }}
            />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <label className="me-1 fw-bold">Sort by:</label>
            <select className="form-select form-select-sm" value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ width: 110 }}>
              <option value="score">Score</option>
              <option value="streak">Streak</option>
              <option value="level">Level</option>
            </select>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? <i className="material-icons">arrow_upward</i> : <i className="material-icons">arrow_downward</i>}
            </button>
          </div>
        </div>
        {loading && <Loader label="Loading leaderboard..." />}
        {error && <div className="lq-feedback text-base">{error}</div>}
        {engagementLoading && <div className="lq-feedback text-base">Loading engagement stats...</div>}
        {engagementError && <div className="lq-feedback text-base text-danger">{engagementError}</div>}
        {!loading && !error && !engagementLoading && (
          <div className="overflow-x-auto">
            <table className="lq-leaderboard-table w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-3 py-2 rounded-l-lg">#</th>
                  <th className="px-3 py-2">Avatar</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Streak</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((e, i) => (
                  <tr key={i} className="bg-white shadow-sm hover:bg-blue-50 transition-all">
                    <td className="px-3 py-2 font-bold text-indigo-600">{i + 1}</td>
                    <td className="px-3 py-2">
                      <img
                        src={e.avatar || defaultAvatar}
                        alt="avatar"
                        style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #764ba2', objectFit: 'cover', boxShadow: '0 2px 8px #764ba233' }}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-800">
                      <button className="btn btn-link p-0 m-0 align-baseline" style={{ color: '#4f46e5', textDecoration: 'underline', fontWeight: 600 }} onClick={() => setProfileModal(e)}>
                        {e.name}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-bold text-blue-700">{e.score}</td>
                    <td className="px-3 py-2">{e.streak ?? '-'}</td>
                    <td className="px-3 py-2">{e.level ?? '-'}</td>
                    <td className="px-3 py-2 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Profile modal */}
        {profileModal && (
          <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setProfileModal(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Profile: {profileModal.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setProfileModal(null)}></button>
                </div>
                <div className="modal-body text-center">
                  <img src={profileModal.avatar || defaultAvatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #764ba2', objectFit: 'cover', boxShadow: '0 2px 8px #764ba233', marginBottom: 12 }} />
                  <h4 className="fw-bold mt-2 mb-1">{profileModal.name}</h4>
                  <div className="mb-2">Score: <span className="fw-bold text-blue-700">{profileModal.score}</span></div>
                  <div className="mb-2">Streak: <span className="fw-bold text-warning">{profileModal.streak ?? '-'}</span></div>
                  <div className="mb-2">Level: <span className="fw-bold text-info">{profileModal.level ?? '-'}</span></div>
                  <div className="mb-2">Date: <span className="text-muted">{new Date(profileModal.date).toLocaleDateString()}</span></div>
                  <div className="mt-3">
                    <h6 className="fw-bold">Badges</h6>
                    {getBadges(profileModal, sortedEntries.findIndex(e => e.name === profileModal.name))?.length ? (
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        {getBadges(profileModal, sortedEntries.findIndex(e => e.name === profileModal.name)).map(badge => (
                          <span key={badge} className="badge bg-success bg-gradient px-3 py-2" style={{ fontSize: '1rem' }}>{badge}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">No badges yet</span>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setProfileModal(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 