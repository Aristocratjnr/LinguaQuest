import React, { useState } from 'react';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.png';
import avatar3 from '../assets/images/programmer.png';
import avatar4 from '../assets/images/avatar.png';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const AvatarPicker: React.FC<{ onConfirm: (avatar: string) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState(AVATARS[0]);

  return (
    <div className="lq-leaderboard-bg">
      <div className="lq-leaderboard-card">
        <h2>Choose Your Avatar</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
          {AVATARS.map((a, i) => (
            <img
              key={i}
              src={a}
              alt={`Avatar ${i + 1}`}
              className={`lq-avatar-pick${selected === a ? ' lq-avatar-pick-selected' : ''}`}
              style={{ cursor: 'pointer', width: 64, height: 64, borderRadius: '50%', border: selected === a ? '3px solid #764ba2' : '2px solid #e0e7ff', boxShadow: selected === a ? '0 0 12px #764ba288' : 'none' }}
              onClick={() => setSelected(a)}
            />
          ))}
        </div>
        <button className="lq-btn lq-btn-scenario" onClick={() => onConfirm(selected)}>Confirm</button>
      </div>
    </div>
  );
};

export default AvatarPicker; 