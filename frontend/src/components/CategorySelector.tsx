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
    <div className="lq-leaderboard-bg flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="lq-leaderboard-card" style={{ maxWidth: 420, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem', textAlign: 'center' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#764ba2' }}>Choose Scenario Category</h2>
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-3 mb-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                className={`lq-btn lq-btn-scenario${category === c.key ? ' lq-btn-selected' : ''}`}
                style={{ minWidth: 110, fontWeight: 600, borderRadius: 10, fontSize: '1.05rem', boxShadow: category === c.key ? '0 0 8px #764ba288' : '0 2px 8px #764ba233', border: category === c.key ? '2px solid #764ba2' : '2px solid transparent', transition: 'border 0.2s' }}
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#667eea' }}>Difficulty</h3>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {DIFFICULTIES.map(d => (
            <button
              key={d.key}
              className={`lq-btn lq-btn-translate${difficulty === d.key ? ' lq-btn-selected' : ''}`}
              style={{ minWidth: 110, fontWeight: 600, borderRadius: 10, fontSize: '1.05rem', boxShadow: difficulty === d.key ? '0 0 8px #22d3ee88' : '0 2px 8px #22d3ee33', border: difficulty === d.key ? '2px solid #22d3ee' : '2px solid transparent', transition: 'border 0.2s' }}
              onClick={() => setDifficulty(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          className="lq-btn lq-btn-evaluate w-full mt-2"
          style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderRadius: 12 }}
          onClick={() => onConfirm(category, difficulty)}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default CategorySelector; 