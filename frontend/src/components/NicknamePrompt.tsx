import React, { useState } from 'react';
import { useActivityFeed } from './ActivityFeedContext';

const MAX_LENGTH = 16;

const NicknamePrompt: React.FC<{ onConfirm: (nickname: string) => void }> = ({ onConfirm }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const { addActivity } = useActivityFeed();

  const handleConfirm = () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname.');
      return;
    }
    if (nickname.length > MAX_LENGTH) {
      setError(`Nickname must be at most ${MAX_LENGTH} characters.`);
      return;
    }
    addActivity({ type: 'action', message: `Set nickname to ${nickname.trim()}.` });
    onConfirm(nickname.trim());
  };

  return (
    <div className="lq-leaderboard-bg flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="lq-leaderboard-card" style={{ maxWidth: 420, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem', textAlign: 'center' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#764ba2' }}>Enter Your Nickname</h2>
        <input
          className="lq-textarea text-lg mb-2 px-4 py-2 border-2 border-blue-200 focus:border-blue-500 focus:outline-none rounded-lg transition-all w-4/5 mx-auto"
          style={{ width: '80%', fontSize: '1.1rem', marginBottom: '1rem', borderRadius: 10, background: '#f8f6fc' }}
          value={nickname}
          onChange={e => { setNickname(e.target.value); setError(''); }}
          maxLength={MAX_LENGTH}
          placeholder="Nickname"
        />
        {error && <div className="lq-feedback text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-2">{error}</div>}
        <button
          className="lq-btn lq-btn-scenario w-full mt-2"
          style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderRadius: 12 }}
          onClick={handleConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default NicknamePrompt; 