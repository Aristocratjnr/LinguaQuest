import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Engagement: React.FC<{ nickname: string; onStart: () => void }> = ({ nickname, onStart }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [streak, setStreak] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<{nickname: string, streak: number, level: number}[]>([]);
  const [userActionMsg, setUserActionMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`/api/engagement/streak`, { params: { nickname } }),
      axios.get(`/api/engagement/level`, { params: { nickname } }),
      axios.get<string[]>(`/api/engagement/quotes`),
      axios.get<string[]>(`/api/engagement/tips`),
    ])
      .then(([streakRes, levelRes, quotesRes, tipsRes]) => {
        if (!isMounted) return;
        setStreak(streakRes.data.streak);
        setLevel(levelRes.data.level);
        setQuotes(quotesRes.data);
        setTips(tipsRes.data);
        setQuoteIndex(Math.floor(Math.random() * quotesRes.data.length));
        setTipIndex(0);
      })
      .catch(async (err) => {
        // If user not found, create user and retry
        if (err.response && err.response.status === 404) {
          try {
            await axios.post('/api/engagement/user', { nickname });
            // Retry fetching streak and level
            const [streakRes, levelRes] = await Promise.all([
              axios.get(`/api/engagement/streak`, { params: { nickname } }),
              axios.get(`/api/engagement/level`, { params: { nickname } })
            ]);
            setStreak(streakRes.data.streak);
            setLevel(levelRes.data.level);
            // Quotes and tips may have loaded already
          } catch (createErr) {
            setError('Failed to create user.');
          }
        } else {
          setError('Failed to load engagement data.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [nickname]);

  // Demo: Increment streak
  const handleIncrementStreak = async () => {
    try {
      const res = await axios.patch('/api/engagement/streak', { nickname, increment: 1 });
      setStreak(res.data.streak);
    } catch (e) {
      setError('Failed to update streak.');
    }
  };
  // Demo: Increment level
  const handleIncrementLevel = async () => {
    try {
      const res = await axios.patch('/api/engagement/level', { nickname, increment: 1 });
      setLevel(res.data.level);
    } catch (e) {
      setError('Failed to update level.');
    }
  };

  // Feedback helpers
  const showSuccess = (msg: string) => toast.success(msg);
  const showError = (msg: string) => toast.error(msg);

  // Fetch all users
  const handleShowUsers = async () => {
    setShowUsers(true);
    setUserActionMsg(null);
    try {
      const res = await axios.get('/api/engagement/users');
      setUsers(res.data.users);
    } catch (e) {
      showError('Failed to fetch users.');
    }
  };

  // Reset streak
  const handleResetStreak = async () => {
    try {
      const res = await axios.patch('/api/engagement/streak', { nickname, streak: 1 });
      setStreak(res.data.streak);
      showSuccess('Streak reset to 1.');
    } catch (e) {
      showError('Failed to reset streak.');
    }
  };
  // Reset level
  const handleResetLevel = async () => {
    try {
      const res = await axios.patch('/api/engagement/level', { nickname, level: 1 });
      setLevel(res.data.level);
      showSuccess('Level reset to 1.');
    } catch (e) {
      showError('Failed to reset level.');
    }
  };
  // Delete user
  const handleDeleteUser = async () => {
    setShowDeleteModal(false);
    setDeleting(true);
    setUserActionMsg(null);
    try {
      await axios.delete('/api/engagement/user', { params: { nickname } });
      showSuccess('User deleted. Please refresh or choose another nickname.');
      setStreak(null);
      setLevel(null);
    } catch (e) {
      showError('Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div>Loading engagement...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow-lg w-100"
        style={{ 
          maxWidth: 500, 
          width: '100%',
          borderRadius: '1rem', 
          overflow: 'hidden',
          fontFamily: "'JetBrains Mono', monospace",
          minHeight: 420,
          boxSizing: 'border-box',
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Welcome Card */}
        <div className="card-header text-center py-4 border-bottom" 
             style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="mb-2"
          >
            <i className="material-icons" 
               style={{ 
                 fontSize: '2.2rem', 
                 color: '#4f46e5',
                 background: 'rgba(79, 70, 229, 0.1)',
                 padding: '0.6rem',
                 borderRadius: '50%'
               }}>
              travel_explore
            </i>
          </motion.div>
          <h2 className="fw-bold mb-1" style={{ color: '#4f46e5', fontSize: '1.3rem' }}>
            Welcome, {nickname}!
          </h2>
          <div className="text-muted" style={{ letterSpacing: '0.01em', fontSize: '1rem' }}>
            Ready to start your language quest?
          </div>
        </div>

        {/* Daily Streak / Progress */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3 py-3 px-2 px-sm-3" 
             style={{ background: 'rgba(243, 244, 246, 0.7)' }}>
          <div className="d-flex align-items-center w-100 justify-content-center mb-2 mb-md-0">
            <div className="d-flex flex-column align-items-center w-100">
              <div className="d-flex align-items-center mb-1 px-2 py-1 rounded w-100 justify-content-center"
                   style={{ 
                     background: 'rgba(253, 224, 71, 0.2)', 
                     border: '1px solid rgba(253, 224, 71, 0.4)',
                     maxWidth: 180
                   }}>
                <i className="material-icons align-middle me-1" 
                   style={{ fontSize: '1.1rem', color: '#d97706' }}>
                  local_fire_department
                </i>
                <span style={{ fontWeight: 600, color: '#b45309', fontSize: '1rem' }}>
                  {streak} day streak
                </span>
                <button className="btn btn-xs btn-outline-secondary ms-2" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }} onClick={handleIncrementStreak} disabled={deleting}>
                  +1
                </button>
                <button className="btn btn-xs btn-outline-danger ms-1" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }} onClick={handleResetStreak} disabled={deleting}>
                  Reset
                </button>
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Keep it up!</small>
            </div>
          </div>
          <div className="d-none d-md-block vr mx-2" style={{ height: 32, opacity: 0.2 }}></div>
          <div className="d-flex align-items-center w-100 justify-content-center">
            <div className="d-flex flex-column align-items-center w-100">
              <div className="d-flex align-items-center mb-1 px-2 py-1 rounded w-100 justify-content-center"
                   style={{ 
                     background: 'rgba(125, 211, 252, 0.2)', 
                     border: '1px solid rgba(125, 211, 252, 0.4)',
                     maxWidth: 180
                   }}>
                <i className="material-icons align-middle me-1" 
                   style={{ fontSize: '1.1rem', color: '#0284c7' }}>
                  emoji_events
                </i>
                <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '1rem' }}>
                  Level {level}
                </span>
                <button className="btn btn-xs btn-outline-secondary ms-2" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }} onClick={handleIncrementLevel} disabled={deleting}>
                  +1
                </button>
                <button className="btn btn-xs btn-outline-danger ms-1" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }} onClick={handleResetLevel} disabled={deleting}>
                  Reset
                </button>
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Next badge at 5 days</small>
            </div>
          </div>
        </div>
        {/* Advanced actions */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ background: 'rgba(243,244,246,0.7)' }}>
          <button className="btn btn-sm btn-outline-info" onClick={handleShowUsers} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Show All Users'}
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
            {deleting ? <span className="spinner-border spinner-border-sm" /> : 'Delete User'}
          </button>
        </div>
        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowDeleteModal(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this user? This cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDeleteUser} disabled={deleting}>
                    {deleting ? <span className="spinner-border spinner-border-sm" /> : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Toast container */}
        <ToastContainer position="top-center" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        {userActionMsg && (
          <div className="alert alert-info m-3 p-2 text-center">{userActionMsg}</div>
        )}
        {/* User list modal/simple list */}
        {showUsers && (
          <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowUsers(false)}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">All Users</h5>
                  <button type="button" className="btn-close" onClick={() => setShowUsers(false)}></button>
                </div>
                <div className="modal-body">
                  {users.length === 0 ? (
                    <div className="text-center py-3">No users found.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Nickname</th>
                            <th>Streak</th>
                            <th>Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.nickname}>
                              <td>{u.nickname}</td>
                              <td>{u.streak}</td>
                              <td>{u.level}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowUsers(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="px-2 px-sm-4 py-4 text-center border-bottom" 
             style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
          <div className="mb-2" style={{ 
            fontSize: '0.7rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            fontWeight: 600,
            color: '#6b7280'
          }}>
            Daily Inspiration
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="fst-italic"
              style={{ 
                minHeight: 48, 
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                lineHeight: 1.3,
                textAlign: 'center',
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <div style={{ maxWidth: '95%' }}>{Array.isArray(quotes) ? quotes[quoteIndex] : ''}</div>
            </motion.div>
          </AnimatePresence>
          <div className="d-flex justify-content-center mt-2">
            <button className="btn btn-sm text-muted" 
                    onClick={() => setQuoteIndex(i => (i + 1) % quotes.length)}
                    style={{ fontSize: '0.75rem' }}>
              <i className="material-icons align-middle me-1" 
                 style={{ fontSize: '0.9rem' }}>
                refresh
              </i>
              New Quote
            </button>
          </div>
        </div>

        {/* Quick Tips Carousel */}
        <div className="px-2 px-sm-4 py-4" style={{ background: 'rgba(243, 244, 246, 0.7)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              fontWeight: 600,
              color: '#4f46e5'
            }}>
              Quick Tips
            </span>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-1 px-2 py-0" 
                      style={{ borderRadius: '0.25rem' }}
                      onClick={() => setTipIndex(i => (i - 1 + tips.length) % tips.length)}>
                <i className="material-icons" style={{ fontSize: '1rem' }}>chevron_left</i>
              </button>
              <button className="btn btn-sm btn-outline-secondary px-2 py-0" 
                      style={{ borderRadius: '0.25rem' }}
                      onClick={() => setTipIndex(i => (i + 1) % tips.length)}>
                <i className="material-icons" style={{ fontSize: '1rem' }}>chevron_right</i>
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
              style={{ 
                minHeight: 32, 
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                fontSize: '1rem',
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <div className="p-2 rounded" style={{ 
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(209, 213, 219, 0.5)',
                width: '100%'
              }}>
                {tips[tipIndex]}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="d-flex justify-content-center mt-2">
            <div className="hstack gap-1">
              {Array.isArray(tips) && tips.map((_, i) => (
                <div 
                  key={i}
                  className="rounded-circle"
                  style={{
                    width: 8,
                    height: 8,
                    background: i === tipIndex ? '#4f46e5' : '#d1d5db',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTipIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="card-footer py-4 text-center" style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
          <motion.button
            className="btn btn-primary px-4 px-sm-5 py-3 fw-bold w-100 w-sm-auto"
            style={{ 
              borderRadius: '0.5rem', 
              fontSize: '1rem', 
              background: '#4f46e5',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.01em',
              maxWidth: 320,
              margin: '0 auto',
              display: 'block',
            }}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2), 0 4px 6px -2px rgba(79, 70, 229, 0.1)' 
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
          >
            <i className="material-icons align-middle me-2">play_circle</i>
            Start Your Quest
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Engagement;