import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { key: 'food', label: 'Food', icon: 'restaurant' },
  { key: 'environment', label: 'Environment', icon: 'eco' },
  { key: 'technology', label: 'Technology', icon: 'devices' },
  { key: 'culture', label: 'Culture', icon: 'diversity_3' },
];

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', color: '#28a745' },
  { key: 'medium', label: 'Medium', color: '#fd7e14' },
  { key: 'hard', label: 'Hard', color: '#dc3545' },
];

const CategorySelector: React.FC<{ onConfirm: (category: string, difficulty: string) => void }> = ({ onConfirm }) => {
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].key);

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow" 
        style={{ maxWidth: 460, borderRadius: '1rem' }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-body p-4 p-md-5">
          <h2 className="card-title text-center fw-bold mb-4" style={{ color: '#764ba2' }}>
            <i className="material-icons align-middle me-2">category</i>
            Choose Your Challenge
          </h2>
          
          <h5 className="text-primary mb-3">Topic Category</h5>
          <div className="row g-3 mb-4">
            {CATEGORIES.map(c => (
              <div className="col-6" key={c.key}>
                <motion.button
                  className={`btn w-100 py-3 ${category === c.key ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{ borderRadius: '.75rem', position: 'relative' }}
                  onClick={() => setCategory(c.key)}
                  whileHover={{ translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="material-icons d-block mb-2">{c.icon}</i>
                  {c.label}
                  {category === c.key && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                      <i className="material-icons" style={{ fontSize: '.7rem' }}>check</i>
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
          
          <h5 className="text-primary mb-3">Difficulty Level</h5>
          <div className="d-flex gap-2 mb-4">
            {DIFFICULTIES.map(d => (
              <motion.button
                key={d.key}
                className={`btn flex-grow-1 py-2 ${difficulty === d.key ? 'text-white' : 'btn-outline-secondary'}`}
                style={{ 
                  borderRadius: '.75rem',
                  backgroundColor: difficulty === d.key ? d.color : 'transparent',
                  borderColor: d.color,
                  color: difficulty === d.key ? 'white' : d.color
                }}
                onClick={() => setDifficulty(d.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {d.label}
              </motion.button>
            ))}
          </div>
          
          <motion.button
            className="btn btn-lg w-100 py-3 text-white"
            style={{ 
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '.75rem' 
            }}
            onClick={() => onConfirm(category, difficulty)}
            whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            <i className="material-icons align-middle me-2">play_arrow</i>
            Start Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelector;