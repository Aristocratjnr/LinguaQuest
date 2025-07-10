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
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-3 py-4" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow" 
        style={{ 
          maxWidth: 460, 
          width: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header text-center py-3 border-bottom" 
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <h2 className="card-title fw-bold mb-0" style={{ color: '#764ba2' }}>
            <i className="material-icons align-middle me-2">category</i>
            Choose Your Challenge
          </h2>
        </div>

        <div className="card-body p-4">
          <h5 className="text-primary mb-3 d-flex align-items-center">
            <i className="material-icons me-2" style={{ fontSize: '1.1rem' }}>view_module</i>
            Topic Category
          </h5>
          <div className="row g-3 mb-4">
            {CATEGORIES.map(c => (
              <div className="col-12 col-sm-6" key={c.key}>
                <motion.button
                  className={`btn w-100 py-3 position-relative ${category === c.key ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{ 
                    borderRadius: '.75rem', 
                    transition: 'all 0.2s ease',
                    boxShadow: category === c.key ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                  onClick={() => setCategory(c.key)}
                  whileHover={{ translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="material-icons me-2" style={{ fontSize: '1.5rem' }}>{c.icon}</i>
                    <span className="fw-medium">{c.label}</span>
                  </div>
                  {category === c.key && (
                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success p-2">
                      <i className="material-icons" style={{ fontSize: '.7rem' }}>check</i>
                      <span className="visually-hidden">Selected</span>
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
          
          <h5 className="text-primary mb-3 d-flex align-items-center">
            <i className="material-icons me-2" style={{ fontSize: '1.1rem' }}>signal_cellular_alt</i>
            Difficulty Level
          </h5>
          <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
            {DIFFICULTIES.map(d => (
              <motion.button
                key={d.key}
                className="btn py-2 flex-grow-1"
                style={{ 
                  borderRadius: '.75rem',
                  backgroundColor: difficulty === d.key ? d.color : 'transparent',
                  borderColor: d.color,
                  color: difficulty === d.key ? 'white' : d.color,
                  boxShadow: difficulty === d.key ? `0 4px 12px ${d.color}40` : 'none',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setDifficulty(d.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="d-flex align-items-center justify-content-center">
                  <span>{d.label}</span>
                  {difficulty === d.key && (
                    <i className="material-icons ms-2" style={{ fontSize: '.9rem' }}>check_circle</i>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <motion.button
            className="btn btn-lg w-100 py-3 text-white mt-2"
            style={{ 
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '.75rem',
              boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)'
            }}
            onClick={() => onConfirm(category, difficulty)}
            whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(118, 75, 162, 0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            <i className="material-icons align-middle me-2">play_arrow</i>
            Start Game
          </motion.button>
        </div>
        
        <div className="card-footer py-2 text-center text-muted small border-top" 
             style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>info</i>
          Choose a topic and difficulty to begin
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelector;