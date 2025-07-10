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
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4"
         style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f3 100%)', fontFamily: "'JetBrains Mono', monospace" }}>
      <motion.div 
        className="card shadow-lg w-100"
        style={{ 
          maxWidth: 420, 
          width: '100%',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
          minHeight: 420,
          background: 'white'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header text-center py-3 border-bottom"
             style={{ background: 'rgba(0,0,0,0.01)' }}>
          <h2 className="card-title fw-bold mb-0" style={{ color: '#22223b', fontSize: '1.18rem', letterSpacing: '.01em' }}>
            <i className="material-icons align-middle me-2" style={{ color: '#6c6f7d' }}>category</i>
            Choose Your Challenge
          </h2>
        </div>

        <div className="card-body p-3 p-sm-4">
          <h5 className="mb-3 d-flex align-items-center" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#495057' }}>
            <i className="material-icons me-2" style={{ fontSize: '1.1rem', color: '#adb5bd' }}>view_module</i>
            Topic Category
          </h5>
          <div className="row g-3 mb-4">
            {CATEGORIES.map(c => (
              <div className="col-12 col-sm-6" key={c.key}>
                <motion.button
                  className={`btn w-100 py-3 px-2 position-relative ${category === c.key ? 'border-primary' : ''}`}
                  style={{ 
                    borderRadius: '.85rem', 
                    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                    boxShadow: category === c.key ? '0 2px 8px rgba(60,60,60,0.07)' : '0 1px 4px #0001',
                    fontWeight: 500,
                    fontSize: '1.05rem',
                    letterSpacing: '.01em',
                    background: category === c.key ? '#f1f3f8' : 'white',
                    color: '#22223b',
                    border: category === c.key ? '2px solid #6366f1' : '1.5px solid #e0e7ef',
                  }}
                  onClick={() => setCategory(c.key)}
                  whileHover={{ translateY: -2, boxShadow: '0 4px 16px rgba(60,60,60,0.10)' }}
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={category === c.key}
                >
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <i className="material-icons" style={{ fontSize: '1.35rem', color: '#adb5bd' }}>{c.icon}</i>
                    <span className="fw-medium">{c.label}</span>
                  </div>
                  {category === c.key && (
                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-primary p-2 shadow"
                          style={{ fontSize: '.7rem', right: 8, top: 8, background: '#6366f1' }}>
                      <i className="material-icons" style={{ fontSize: '.8rem', color: 'white' }}>check</i>
                      <span className="visually-hidden">Selected</span>
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
          
          <h5 className="mb-3 d-flex align-items-center" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#495057' }}>
            <i className="material-icons me-2" style={{ fontSize: '1.1rem', color: '#adb5bd' }}>signal_cellular_alt</i>
            Difficulty Level
          </h5>
          <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
            {DIFFICULTIES.map(d => (
              <motion.button
                key={d.key}
                className="btn py-2 flex-grow-1"
                style={{ 
                  borderRadius: '.85rem',
                  background: difficulty === d.key ? '#f1f3f8' : 'white',
                  border: difficulty === d.key ? `2px solid #6366f1` : '1.5px solid #e0e7ef',
                  color: '#22223b',
                  fontWeight: 500,
                  fontSize: '1.01rem',
                  boxShadow: difficulty === d.key ? `0 2px 8px #6366f11a` : '0 1px 4px #0001',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)'
                }}
                onClick={() => setDifficulty(d.key)}
                whileHover={{ scale: 1.03, boxShadow: `0 4px 16px #6366f11a` }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={difficulty === d.key}
              >
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <span>{d.label}</span>
                  {difficulty === d.key && (
                    <i className="material-icons ms-2" style={{ fontSize: '.95rem', color: '#6366f1' }}>check_circle</i>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <motion.button
            className="btn btn-lg w-100 py-3 text-white mt-2 shadow-sm"
            style={{ 
              background: '#6366f1',
              border: 'none',
              borderRadius: '.85rem',
              fontWeight: 600,
              fontSize: '1.08rem',
              letterSpacing: '.01em',
              boxShadow: '0 4px 18px rgba(60,60,60,0.10)'
            }}
            onClick={() => onConfirm(category, difficulty)}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(60,60,60,0.13)' }}
            whileTap={{ scale: 0.97 }}
            aria-label="Start Game"
          >
            <i className="material-icons align-middle me-2">play_arrow</i>
            Start Game
          </motion.button>
        </div>
        
        <div className="card-footer py-2 text-center text-muted small border-top"
             style={{ background: 'rgba(0,0,0,0.01)', fontSize: '.97rem', letterSpacing: '.01em', color: '#6c6f7d' }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.95rem', color: '#adb5bd' }}>info</i>
          Choose a topic and difficulty to begin
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelector;