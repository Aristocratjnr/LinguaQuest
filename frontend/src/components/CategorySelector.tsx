import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useUser();
  const navigate = useNavigate();
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
          axios.get(`${API_BASE_URL}/api/engagement/categories`),
          axios.get(`${API_BASE_URL}/api/engagement/difficulties`)
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
        // Fallback to default categories if API fails
        const defaultCategories = [
          { key: 'food', label: 'Food', icon: 'restaurant' },
          { key: 'technology', label: 'Technology', icon: 'computer' },
          { key: 'culture', label: 'Culture', icon: 'public' }
        ];
        const defaultDifficulties = [
          { key: 'easy', label: 'Easy' },
          { key: 'medium', label: 'Medium' },
          { key: 'hard', label: 'Hard' }
        ];
        setCategories(defaultCategories);
        setDifficulties(defaultDifficulties);
        setCategory(defaultCategories[0].key);
        setDifficulty(defaultDifficulties[0].key);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      console.log('CategorySelector: No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleConfirm = () => {
    console.log('CategorySelector handleConfirm called with:', category, difficulty);
    console.log('CategorySelector current user:', user);
    
    if (!category || !difficulty) {
      setError("Please select both a category and difficulty");
      return;
    }
    
    console.log('About to call onConfirm with:', category, difficulty);
    
    // If user is not logged in, redirect to login
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      onConfirm(category, difficulty);
      console.log('onConfirm called successfully');
      
      // Fallback navigation in case onConfirm doesn't navigate
      setTimeout(() => {
        console.log('Fallback: Navigating to /app after 1 second');
        navigate('/app');
      }, 1000);
      
    } catch (error) {
      console.error('Error calling onConfirm:', error);
      // Direct navigation as fallback
      navigate('/app');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4"
           style={{ 
             background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f3 100%)', 
             fontFamily: "'JetBrains Mono', monospace",
             padding: 'clamp(8px, 2vw, 16px)'
           }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{
            width: 'clamp(2rem, 6vw, 3rem)',
            height: 'clamp(2rem, 6vw, 3rem)'
          }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted" style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
          }}>Loading game options...</p>
        </div>
      </div>
    );
  }

  if (error && (!categories.length || !difficulties.length)) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4"
           style={{ 
             background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f3 100%)', 
             fontFamily: "'JetBrains Mono', monospace",
             padding: 'clamp(8px, 2vw, 16px)'
           }}>
        <div className="card shadow-lg p-4 text-center" style={{ 
          maxWidth: 'clamp(320px, 90vw, 420px)', 
          borderRadius: 'clamp(12px, 3vw, 20px)',
          padding: 'clamp(16px, 4vw, 24px)'
        }}>
          <i className="material-icons text-danger mb-3" style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 3rem)' 
          }}>error_outline</i>
          <h4 className="mb-3" style={{
            fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)'
          }}>Something went wrong</h4>
          <p className="text-muted mb-4" style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
          }}>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{
              padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              borderRadius: 'clamp(6px, 1.5vw, 8px)'
            }}
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
           background: 'var(--duo-bg, linear-gradient(135deg, #58cc02 0%, #4CAF50 100%))',
           fontFamily: "'JetBrains Mono', monospace",
           minHeight: '100vh',
           padding: 'clamp(8px, 2vw, 16px)'
         }}>
      <motion.div 
        className="card shadow-lg w-100"
        style={{ 
          maxWidth: 'clamp(320px, 95vw, 480px)', 
          width: '100%',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          minHeight: 'clamp(400px, 80vh, 420px)',
          background: 'white'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-header text-center py-4 border-bottom"
             style={{ 
               color: 'white',
               padding: 'clamp(16px, 4vw, 24px)'
             }}>
          <h2 className="card-title fw-bold mb-0" style={{ 
            color: 'white', 
            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
            letterSpacing: '.01em' 
          }}>
            <i className="material-icons align-middle me-2" style={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'
            }}>category</i>
            CHOOSE YOUR CHALLENGE
          </h2>
        </div>

        <div className="card-body p-3 p-sm-4" style={{
          padding: 'clamp(16px, 4vw, 24px)'
        }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <i className="material-icons me-2">error_outline</i>
              <div>{error}</div>
            </div>
          )}
          
          <h5 className="mb-3 d-flex align-items-center" style={{ 
            fontWeight: 600, 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', 
            color: '#58cc02', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}>
            <i className="material-icons me-2" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', color: '#58cc02' }}>view_module</i>
            Topic Category
          </h5>
          <div className="row g-3 mb-4" style={{
            marginBottom: 'clamp(20px, 5vw, 24px)',
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            {categories.map(c => (
              <div className="col-12 col-sm-6" key={c.key}>
                <motion.button
                  className="btn w-100 py-3 px-2 position-relative"
                  style={{ 
                    borderRadius: 'clamp(8px, 2vw, 12px)', 
                    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                    boxShadow: category === c.key ? '0 4px 12px rgba(88,204,2,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                    fontWeight: 500,
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                    letterSpacing: '.01em',
                    background: category === c.key ? '#e8f5e8' : 'white',
                    color: '#22223b',
                    border: category === c.key ? '2px solid #58cc02' : '1.5px solid #e0e7ef',
                    padding: 'clamp(12px, 3vw, 16px)',
                    minHeight: 'clamp(48px, 12vw, 56px)'
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
                    <i className="material-icons" style={{ 
                      fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', 
                      color: '#adb5bd' 
                    }}>{c.icon}</i>
                    <span className="fw-medium">{c.label}</span>
                  </div>
                  {category === c.key && (
                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill p-2 shadow"
                          style={{ 
                            fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', 
                            right: 'clamp(6px, 2vw, 8px)', 
                            top: 'clamp(6px, 2vw, 8px)', 
                            background: '#58cc02',
                            minWidth: 'clamp(20px, 5vw, 24px)',
                            minHeight: 'clamp(20px, 5vw, 24px)'
                          }}>
                      <i className="material-icons" style={{ 
                        fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', 
                        color: 'white' 
                      }}>check</i>
                      <span className="visually-hidden">Selected</span>
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
          
          <h5 className="mb-3 d-flex align-items-center" style={{ 
            fontWeight: 600, 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', 
            color: '#58cc02', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}>
            <i className="material-icons me-2" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', color: '#58cc02' }}>signal_cellular_alt</i>
            Difficulty Level
          </h5>
          <div className="d-flex flex-column flex-sm-row gap-2 mb-4" style={{
            marginBottom: 'clamp(20px, 5vw, 24px)',
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            {difficulties.map(d => (
              <motion.button
                key={d.key}
                className="btn py-2 flex-grow-1"
                style={{ 
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: difficulty === d.key ? '#e8f5e8' : 'white',
                  border: difficulty === d.key ? '2px solid #58cc02' : '1.5px solid #e0e7ef',
                  color: '#22223b',
                  fontWeight: 500,
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.01rem)',
                  boxShadow: difficulty === d.key ? '0 4px 12px rgba(88,204,2,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                  padding: 'clamp(10px, 2.5vw, 12px)',
                  minHeight: 'clamp(40px, 10vw, 44px)'
                }}
                onClick={() => {
                  setDifficulty(d.key);
                  setError(null);
                }}
                whileHover={{ scale: 1.03, boxShadow: '0 4px 16px rgba(99,102,241,0.1)' }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={difficulty === d.key}
              >
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <span>{d.label}</span>
                  {difficulty === d.key && (
                    <i className="material-icons ms-2" style={{ 
                      fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', 
                      color: '#58cc02' 
                    }}>check_circle</i>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
            <motion.button
              onClick={handleConfirm}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: '0 6px 0 #3caa3c',
                transition: { type: 'spring', stiffness: 400 }
              }}
              whileTap={{ 
                scale: 0.98, 
                boxShadow: '0 2px 0 #3caa3c',
                transition: { duration: 0.1 }
              }}
              style={{
                background: '#58cc02',
                color: 'white',
                border: 'none',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 32px)',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                maxWidth: 'clamp(280px, 80vw, 400px)',
                boxShadow: '0 4px 0 #3caa3c',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                minHeight: 'clamp(48px, 12vw, 56px)'
              }}
              disabled={!category || !difficulty}
              aria-label="Start Game"
            >
              <i className="material-icons align-middle me-2" style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'
              }}>play_arrow</i>
              START GAME
            </motion.button>
          </div>
        </div>
        
        <div className="card-footer py-3 text-center text-muted small border-top"
             style={{ 
               background: '#f9f9f9', 
               fontSize: 'clamp(0.8rem, 2vw, 0.97rem)', 
               letterSpacing: '.01em', 
               color: '#6c6f7d',
               padding: 'clamp(12px, 3vw, 16px)'
             }}>
          <i className="material-icons align-middle me-1" style={{ 
            fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', 
            color: '#adb5bd' 
          }}>info</i>
          Choose a topic and difficulty to begin
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelector;