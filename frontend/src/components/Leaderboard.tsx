import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultAvatar from '../assets/images/avatar.png';
import Loader from './Loader';

interface Entry {
  name: string;
  score: number;
  date: string;
  avatar?: string;
}

const Leaderboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        {loading && <Loader label="Loading leaderboard..." />}
        {error && <div className="lq-feedback text-base">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="lq-leaderboard-table w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-3 py-2 rounded-l-lg">#</th>
                  <th className="px-3 py-2">Avatar</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} className="bg-white shadow-sm hover:bg-blue-50 transition-all">
                    <td className="px-3 py-2 font-bold text-indigo-600">{i + 1}</td>
                    <td className="px-3 py-2">
                      <img
                        src={e.avatar || defaultAvatar}
                        alt="avatar"
                        style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #764ba2', objectFit: 'cover', boxShadow: '0 2px 8px #764ba233' }}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-800">{e.name}</td>
                    <td className="px-3 py-2 font-bold text-blue-700">{e.score}</td>
                    <td className="px-3 py-2 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 