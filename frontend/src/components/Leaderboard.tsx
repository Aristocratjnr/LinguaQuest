import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultAvatar from './avatar.png';

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
    <div className="lq-leaderboard-bg">
      <div className="lq-leaderboard-card">
        <h2>Leaderboard</h2>
        <button className="lq-btn lq-btn-scenario" onClick={onClose}>Close</button>
        {loading && <div>Loading...</div>}
        {error && <div className="lq-feedback">{error}</div>}
        {!loading && !error && (
          <table className="lq-leaderboard-table">
            <thead>
              <tr><th>#</th><th>Avatar</th><th>Name</th><th>Score</th><th>Date</th></tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <img
                      src={e.avatar || defaultAvatar}
                      alt="avatar"
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #764ba2', objectFit: 'cover' }}
                    />
                  </td>
                  <td>{e.name}</td>
                  <td>{e.score}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 