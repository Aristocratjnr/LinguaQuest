import React, { useState } from 'react';

const MAX_LENGTH = 16;

const NicknamePrompt: React.FC<{ onConfirm: (nickname: string) => void }> = ({ onConfirm }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname.');
      return;
    }
    if (nickname.length > MAX_LENGTH) {
      setError(`Nickname must be at most ${MAX_LENGTH} characters.`);
      return;
    }
    onConfirm(nickname.trim());
  };

  return (
    <div className="lq-leaderboard-bg">
      <div className="lq-leaderboard-card">
        <h2>Enter Your Nickname</h2>
        <input
          className="lq-textarea"
          style={{ width: '80%', fontSize: '1.1rem', marginBottom: '1rem' }}
          value={nickname}
          onChange={e => { setNickname(e.target.value); setError(''); }}
          maxLength={MAX_LENGTH}
          placeholder="Nickname"
        />
        {error && <div className="lq-feedback">{error}</div>}
        <button className="lq-btn lq-btn-scenario" onClick={handleConfirm}>Confirm</button>
      </div>
    </div>
  );
};

export default NicknamePrompt; 