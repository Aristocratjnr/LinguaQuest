import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// Define proper types for your data
interface Category {
  key: string;
  label: string;
  icon: string;
}

interface Difficulty {
  key: string;
  label: string;
}

const CategorySelector: React.FC<{ onConfirm: (category: string, difficulty: string) => void }> = ({ onConfirm }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [catRes, diffRes] = await Promise.all([
          axios.get('http://localhost:8000/api/engagement/categories'),
          axios.get('http://localhost:8000/api/engagement/difficulties')
        ]);
        
        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          setCategory(catRes.data[0]?.key || '');
        } else {
          setError("No categories available");
        }
        
        if (diffRes.data && diffRes.data.length > 0) {
          setDifficulties(diffRes.data);
          setDifficulty(diffRes.data[0]?.key || '');
        } else {
          setError("No difficulties available");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load game options. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfirm = () => {
    // Add validation to ensure values are selected before proceeding
    if (!category || !difficulty) {
      setError("Please select both a category and difficulty");
      return;
    }
    onConfirm(category, difficulty);
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4"
           style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f3 100%)', fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading game options...</p>
        </div>
      </div>
    );
  }

  if (error && (!categories.length || !difficulties.length)) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4"
           style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f3 100%)', fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="card shadow-lg p-4 text-center" style={{ maxWidth: 420, borderRadius: '1.25rem' }}>
          <i className="material-icons text-danger mb-3" style={{ fontSize: '3rem' }}>error_outline</i>
          <h4 className="mb-3">Something went wrong</h4>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4"
         style={{ 
           background: 'linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%)', 
           fontFamily: "'JetBrains Mono', monospace",
           minHeight: '100vh',
           padding: '16px'
         }}>
      <motion.div 
        className="card shadow-lg w-100"
        style={{ 
          maxWidth: 480, 
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          minHeight: 420,
          background: 'white'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-header text-center py-4 border-bottom"
             style={{ background: '#58cc02', color: 'white' }}>
          <h2 className="card-title fw-bold mb-0" style={{ color: 'white', fontSize: '1.25rem', letterSpacing: '.01em' }}>
            <i className="material-icons align-middle me-2" style={{ color: 'rgba(255,255,255,0.9)' }}>category</i>
            CHOOSE YOUR CHALLENGE
          </h2>
        </div>

        <div className="card-body p-3 p-sm-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <i className="material-icons me-2">error_outline</i>
              <div>{error}</div>
            </div>
          )}
          
          <h5 className="mb-3 d-flex align-items-center" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#58cc02', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <i className="material-icons me-2" style={{ fontSize: '1.1rem', color: '#58cc02' }}>view_module</i>
            Topic Category
          </h5>
          <div className="row g-3 mb-4">
            {categories.map(c => (
              <div className="col-12 col-sm-6" key={c.key}>
                <motion.button
                  className={`btn w-100 py-3 px-2 position-relative ${category === c.key ? 'border-primary' : ''}`}
                  style={{ 
                    borderRadius: '12px', 
                    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                    boxShadow: category === c.key ? '0 4px 12px rgba(88,204,2,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                    fontWeight: 500,
                    fontSize: '1.05rem',
                    letterSpacing: '.01em',
                    background: category === c.key ? '#f0f9ff' : 'white',
                    color: '#22223b',
                    border: category === c.key ? '2px solid #58cc02' : '1.5px solid #e0e7ef',
                  }}
                  onClick={() => {
                    setCategory(c.key);
                    setError(null);
                  }}
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
                          style={{ fontSize: '.7rem', right: 8, top: 8, background: '#58cc02' }}>
                      <i className="material-icons" style={{ fontSize: '.8rem', color: 'white' }}>check</i>
                      <span className="visually-hidden">Selected</span>
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
          
          <h5 className="mb-3 d-flex align-items-center" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1cb0f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <i className="material-icons me-2" style={{ fontSize: '1.1rem', color: '#1cb0f6' }}>signal_cellular_alt</i>
            Difficulty Level
          </h5>
          <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
            {difficulties.map(d => (
              <motion.button
                key={d.key}
                className="btn py-2 flex-grow-1"
                style={{ 
                  borderRadius: '12px',
                  background: difficulty === d.key ? '#f0f9ff' : 'white',
                  border: difficulty === d.key ? `2px solid #1cb0f6` : '1.5px solid #e0e7ef',
                  color: '#22223b',
                  fontWeight: 500,
                  fontSize: '1.01rem',
                  boxShadow: difficulty === d.key ? `0 4px 12px rgba(28,176,246,0.2)` : '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)'
                }}
                onClick={() => {
                  setDifficulty(d.key);
                  setError(null);
                }}
                whileHover={{ scale: 1.03, boxShadow: `0 4px 16px #6366f11a` }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={difficulty === d.key}
              >
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <span>{d.label}</span>
                  {difficulty === d.key && (
                    <i className="material-icons ms-2" style={{ fontSize: '.95rem', color: '#1cb0f6' }}>check_circle</i>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <motion.button
            className="btn btn-lg w-100 py-3 text-white mt-2 shadow-sm"
            style={{ 
              background: '#58cc02',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1.08rem',
              letterSpacing: '.01em',
              boxShadow: '0 4px 18px rgba(88,204,2,0.2)'
            }}
            onClick={handleConfirm}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(60,60,60,0.13)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!category || !difficulty}
            aria-label="Start Game"
          >
            <i className="material-icons align-middle me-2">play_arrow</i>
            Start Game
          </motion.button>
        </div>
        
        <div className="card-footer py-3 text-center text-muted small border-top"
             style={{ background: '#f9f9f9', fontSize: '.97rem', letterSpacing: '.01em', color: '#6c6f7d' }}>
          <i className="material-icons align-middle me-1" style={{ fontSize: '.95rem', color: '#adb5bd' }}>info</i>
          Choose a topic and difficulty to begin
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelector;