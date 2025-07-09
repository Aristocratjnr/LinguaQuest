import React, { useState } from 'react';

const CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'environment', label: 'Environment' },
  { key: 'technology', label: 'Technology' },
  { key: 'culture', label: 'Culture' },
];
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

const CategorySelector: React.FC<{ onConfirm: (category: string, difficulty: string) => void }> = ({ onConfirm }) => {
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].key);

  return (
    <div className="lq-leaderboard-bg">
      <div className="lq-leaderboard-card">
        <h2>Choose Scenario Category</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              className={`lq-btn lq-btn-scenario${category === c.key ? ' lq-btn-selected' : ''}`}
              style={{ margin: '0.3rem' }}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <h3>Difficulty</h3>
        <div style={{ marginBottom: '1.5rem' }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.key}
              className={`lq-btn lq-btn-translate${difficulty === d.key ? ' lq-btn-selected' : ''}`}
              style={{ margin: '0.3rem' }}
              onClick={() => setDifficulty(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button className="lq-btn lq-btn-evaluate" onClick={() => onConfirm(category, difficulty)}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default CategorySelector; 