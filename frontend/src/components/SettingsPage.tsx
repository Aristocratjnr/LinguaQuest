import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.jpg';
import avatar3 from '../assets/images/programmer.jpg';
import avatar4 from '../assets/images/avatar.jpg';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];
const LANGUAGES = [
  { code: 'twi', label: 'Twi' },
  { code: 'gaa', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
];
const THEMES = [
  { code: 'light', label: 'Light' },
  { code: 'dark', label: 'Dark' },
  { code: 'system', label: 'System' },
];

const SettingsPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { nickname, setNickname, avatar, setAvatar, language, setLanguage, theme, setTheme, sound, setSound } = useSettings();
  // Engagement state
  const [streak, setStreak] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`http://127.0.0.1:8000/api/v1/streak`, { params: { nickname } }),
      axios.get(`http://127.0.0.1:8000/api/v1/level`, { params: { nickname } })
    ])
      .then(([streakRes, levelRes]) => {
        setStreak(streakRes.data.streak);
        setLevel(levelRes.data.level);
      })
      .catch(() => setError('Failed to load engagement stats.'))
      .finally(() => setLoading(false));
  }, [nickname]);

  const handleResetStreak = async () => {
    setResetting(true);
    try {
      const res = await axios.patch(`http://127.0.0.1:8000/api/v1/streak?nickname=${encodeURIComponent(nickname)}&streak=1`);
      setStreak(res.data.streak);
      toast.success('Streak reset to 1.');
    } catch {
      toast.error('Failed to reset streak.');
    } finally {
      setResetting(false);
    }
  };
  const handleResetLevel = async () => {
    setResetting(true);
    try {
      const res = await axios.patch(`http://127.0.0.1:8000/api/v1/level?nickname=${encodeURIComponent(nickname)}&level=1`);
      setLevel(res.data.level);
      toast.success('Level reset to 1.');
    } catch {
      toast.error('Failed to reset level.');
    } finally {
      setResetting(false);
    }
  };

  // Real-time update handlers
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };
  const handleAvatarChange = (a: string) => {
    setAvatar(a);
  };
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };
  const handleSoundToggle = () => {
    setSound(!sound);
  };

  // Theme-aware styles
  const isDark = theme === 'dark';
  const bgGradient = isDark
    ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
    : 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f3 100%)';
  
  // Glassmorphism styles
  const glassBackground = isDark 
    ? 'rgba(35, 41, 70, 0.25)'
    : 'rgba(255, 255, 255, 0.25)';
  const glassBackdropFilter = 'blur(12px)';
  const glassBorder = isDark
    ? '1px solid rgba(255, 255, 255, 0.05)'
    : '1px solid rgba(255, 255, 255, 0.3)';
  const glassBoxShadow = isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(31, 38, 135, 0.15)';
  
  const cardHeaderBg = 'transparent';
  const cardFooterBg = 'transparent';
  const textColor = isDark ? '#e0e7ff' : '#4f46e5';
  const labelColor = isDark ? '#a5b4fc' : '#4f46e5';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)';
  const inputBg = isDark ? 'rgba(24, 28, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  const inputText = isDark ? '#e0e7ff' : '#22223b';

  return (
    <div className={`container-fluid d-flex align-items-center justify-content-center min-vh-100${isDark ? ' dark' : ''}`}
         style={{ 
           background: bgGradient,
           padding: '1rem',
           paddingTop: '2rem',
           paddingBottom: '2rem',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <motion.div
        className="card shadow-lg w-100"
        style={{ 
          maxWidth: 'min(95vw, 500px)',
          width: '100%',
          borderRadius: 16, 
          fontFamily: "'JetBrains Mono', monospace", 
          minHeight: 'auto',
          background: glassBackground,
          backdropFilter: glassBackdropFilter,
          WebkitBackdropFilter: glassBackdropFilter, // for Safari
          border: glassBorder,
          boxShadow: glassBoxShadow,
          color: inputText, 
          margin: '0 auto'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* --- HEADER --- */}
        <div className="card-header d-flex justify-content-between align-items-center border-bottom py-3 px-3 px-sm-4"
             style={{ 
               background: 'transparent', 
               borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)'
             }}>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="d-flex align-items-center justify-content-center me-2" style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
              backdropFilter: 'blur(4px)',
              color: '#58a700', 
              boxShadow: '0 2px 8px rgba(88,167,0,0.07)'
            }}>
              <i className="material-icons" style={{ fontSize: '1.5rem' }}>settings</i>
            </span>
            <h2 className="fw-bold mb-0" style={{ color: isDark ? '#e0e7ff' : '#58a700', fontSize: 'clamp(1rem, 4vw, 1.15rem)', letterSpacing: '.01em' }}>
              Settings
            </h2>
            <span className="badge px-3 py-1 d-flex align-items-center ms-2" style={{
              backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
              backdropFilter: 'blur(4px)',
              color: '#58a700', 
              borderRadius: '12px', 
              fontWeight: 600, 
              fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', 
              letterSpacing: '.01em'
            }}>
              <i className="material-icons me-1" style={{ fontSize: '1rem' }}>tune</i>
              Profile
            </span>
          </div>
          <button 
            className={`btn btn-sm rounded-circle ms-2${isDark ? ' text-light' : ''}`} 
            onClick={onClose} 
            style={{ 
              width: 40, 
              height: 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: 'none', 
              background: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(248, 249, 250, 0.6)',
              backdropFilter: 'blur(4px)',
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            <i className="material-icons align-middle">close</i>
          </button>
        </div>
        <div className="card-body p-3 p-sm-4">
          {/* Profile Section */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3 fw-bold" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 8, 
                backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
                backdropFilter: 'blur(4px)',
                color: '#58a700' 
              }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>face</i>
              </span>
              Profile
            </div>
            <div className="row g-3 align-items-start">
              <div className="col-12 col-sm-4 text-center mb-3 mb-sm-0">
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {AVATARS.map((a, i) => (
                    <motion.img
                      key={i}
                      src={a}
                      alt={`Avatar ${i + 1}`}
                      className={`rounded-circle bg-white border ${avatar === a ? 'border-primary' : ''}`}
                      style={{ 
                        width: 'clamp(44px, 8vw, 52px)', 
                        height: 'clamp(44px, 8vw, 52px)', 
                        cursor: 'pointer', 
                        boxShadow: avatar === a ? '0 0 8px #4f46e5' : '0 2px 6px rgba(0,0,0,0.1)', 
                        opacity: avatar === a ? 1 : 0.7, 
                        borderWidth: 2,
                        minWidth: '44px',
                        minHeight: '44px'
                      }}
                      onClick={() => handleAvatarChange(a)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      animate={avatar === a ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-12 col-sm-8">
                <label className="form-label mb-2" style={{ color: labelColor, fontSize: 'clamp(0.85rem, 3vw, 0.9rem)' }}>Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  value={nickname}
                  onChange={handleNicknameChange}
                  maxLength={16}
                  style={{ 
                    fontFamily: "'JetBrains Mono', monospace", 
                    fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', 
                    background: inputBg, 
                    backdropFilter: 'blur(4px)',
                    color: inputText, 
                    borderColor,
                    padding: '0.75rem 1rem',
                    minHeight: '44px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3 fw-bold" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 8, 
                backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
                backdropFilter: 'blur(4px)',
                color: '#58a700' 
              }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>tune</i>
              </span>
              Preferences
            </div>
            <div className="row g-3">
              <div className="col-12 col-sm-6 mb-3 mb-sm-0">
                <label className="form-label mb-2" style={{ color: labelColor, fontSize: 'clamp(0.85rem, 3vw, 0.9rem)' }}>Language</label>
                <div className="position-relative" style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <select 
                    className="form-select" 
                    value={language} 
                    onChange={handleLanguageChange} 
                    style={{ 
                      fontFamily: "'JetBrains Mono', monospace", 
                      background: inputBg, 
                      color: inputText, 
                      borderColor,
                      fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
                      padding: '0.75rem 1rem',
                      minHeight: '44px',
                      borderRadius: '12px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: isDark ? 'inset 0 1px 3px rgba(0, 0, 0, 0.1)' : 'inset 0 1px 3px rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      border: glassBorder
                    }}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                  <div className="position-absolute" style={{
                    top: '50%',
                    right: '1rem',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'
                  }}>
                    <i className="material-icons" style={{ fontSize: '1.4rem' }}>expand_more</i>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label mb-2" style={{ color: labelColor, fontSize: 'clamp(0.85rem, 3vw, 0.9rem)' }}>Theme</label>
                <div className="position-relative" style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <select 
                    className="form-select" 
                    value={theme} 
                    onChange={handleThemeChange} 
                    style={{ 
                      fontFamily: "'JetBrains Mono', monospace", 
                      background: inputBg, 
                      color: inputText, 
                      borderColor,
                      fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
                      padding: '0.75rem 1rem',
                      minHeight: '44px',
                      borderRadius: '12px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: isDark ? 'inset 0 1px 3px rgba(0, 0, 0, 0.1)' : 'inset 0 1px 3px rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      border: glassBorder
                    }}
                  >
                    {THEMES.map(t => (
                      <option key={t.code} value={t.code}>{t.label}</option>
                    ))}
                  </select>
                  <div className="position-absolute" style={{
                    top: '50%',
                    right: '1rem',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'
                  }}>
                    <i className="material-icons" style={{ fontSize: '1.4rem' }}>expand_more</i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Toggles */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3 fw-bold" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 8, 
                backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
                backdropFilter: 'blur(4px)',
                color: '#58a700' 
              }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>volume_up</i>
              </span>
              Real-Time Controls
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="soundSwitch" 
                  checked={sound} 
                  onChange={handleSoundToggle}
                  style={{ 
                    width: '3rem',
                    height: '1.5rem',
                    cursor: 'pointer'
                  }}
                />
                <label 
                  className="form-check-label" 
                  htmlFor="soundSwitch" 
                  style={{ 
                    fontFamily: "'JetBrains Mono', monospace", 
                    color: labelColor,
                    fontSize: 'clamp(0.85rem, 3vw, 0.9rem)',
                    cursor: 'pointer',
                    paddingLeft: '0.5rem'
                  }}
                >
                  Sound {sound ? 'On' : 'Off'}
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3 fw-bold" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 8, 
                backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
                backdropFilter: 'blur(4px)',
                color: '#58a700' 
              }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>visibility</i>
              </span>
              Live Preview
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex flex-column align-items-center">
                <img 
                  src={avatar} 
                  alt="Preview Avatar" 
                  className="rounded-circle mb-2" 
                  style={{ 
                    width: 'clamp(44px, 8vw, 52px)', 
                    height: 'clamp(44px, 8vw, 52px)', 
                    border: '2px solid #4f46e5',
                    minWidth: '44px',
                    minHeight: '44px'
                  }} 
                />
                <span 
                  className="badge bg-primary" 
                  style={{ 
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 'clamp(0.75rem, 3vw, 0.85rem)'
                  }}
                >
                  {nickname || 'Player'}
                </span>
              </div>
              <div className="d-flex flex-column align-items-start">
                <span className="text-muted small" style={{ fontSize: 'clamp(0.75rem, 3vw, 0.85rem)' }}>
                  Language: <b>{LANGUAGES.find(l => l.code === language)?.label}</b>
                </span>
                <span className="text-muted small" style={{ fontSize: 'clamp(0.75rem, 3vw, 0.85rem)' }}>
                  Theme: <b>{THEMES.find(t => t.code === theme)?.label}</b>
                </span>
                <span className="text-muted small" style={{ fontSize: 'clamp(0.75rem, 3vw, 0.85rem)' }}>
                  Sound: <b>{sound ? 'On' : 'Off'}</b>
                </span>
              </div>
            </div>
          </div>

          <hr className="my-4" />
          <div className="d-flex align-items-center gap-2 mb-3 fw-bold" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: '#58a700' }}>
            <span className="d-flex align-items-center justify-content-center" style={{ 
              width: 28, 
              height: 28, 
              borderRadius: 8, 
              backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
              backdropFilter: 'blur(4px)',
              color: '#58a700' 
            }}>
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>emoji_events</i>
            </span>
            Engagement Stats
          </div>
          {loading ? (
            <div className="text-center py-3">
              <span className="spinner-border" style={{ width: '2rem', height: '2rem' }} />
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center" style={{ fontSize: 'clamp(0.8rem, 3vw, 0.9rem)' }}>{error}</div>
          ) : (
            <div className="d-flex flex-column gap-3 align-items-center">
              <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
                <span className="badge px-3 py-2 d-flex align-items-center" style={{ 
                  backgroundColor: '#fff3cd', 
                  color: '#b68900', 
                  borderRadius: '12px', 
                  fontWeight: 600, 
                  fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', 
                  letterSpacing: '.01em' 
                }}>
                  <i className="material-icons me-1" style={{ fontSize: '1.1rem', color: '#b68900' }}>local_fire_department</i>
                  Streak: {streak}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.97 }} 
                  className="btn btn-xs btn-outline-danger ms-2 rounded-pill" 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 3vw, 0.8rem)', 
                    padding: '0.5rem 1rem', 
                    borderRadius: 16,
                    minHeight: '36px',
                    minWidth: '60px'
                  }} 
                  onClick={handleResetStreak} 
                  disabled={resetting}
                >
                  <i className="material-icons align-middle me-1" style={{ fontSize: '1rem' }}>restart_alt</i>Reset
                </motion.button>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
                <span className="badge px-3 py-2 d-flex align-items-center" style={{ 
                  backgroundColor: '#e0f7fa', 
                  color: '#007b83', 
                  borderRadius: '12px', 
                  fontWeight: 600, 
                  fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', 
                  letterSpacing: '.01em' 
                }}>
                  <i className="material-icons me-1" style={{ fontSize: '1.1rem', color: '#007b83' }}>military_tech</i>
                  Level: {level}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.97 }} 
                  className="btn btn-xs btn-outline-danger ms-2 rounded-pill" 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 3vw, 0.8rem)', 
                    padding: '0.5rem 1rem', 
                    borderRadius: 16,
                    minHeight: '36px',
                    minWidth: '60px'
                  }} 
                  onClick={handleResetLevel} 
                  disabled={resetting}
                >
                  <i className="material-icons align-middle me-1" style={{ fontSize: '1rem' }}>restart_alt</i>Reset
                </motion.button>
              </div>
            </div>
          )}
        </div>
        <ToastContainer position="top-center" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Notification Toasts" />
        <div className="text-muted small mt-4 d-flex align-items-center justify-content-center gap-2 text-center px-3" style={{ 
          color: isDark ? '#a5b4fc' : '#6c757d', 
          fontSize: 'clamp(0.75rem, 3vw, 0.85rem)',
          lineHeight: '1.4'
        }}>
          <span className="d-flex align-items-center justify-content-center" style={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            backgroundColor: isDark ? 'rgba(35, 41, 70, 0.6)' : 'rgba(232, 245, 233, 0.6)',
            backdropFilter: 'blur(4px)',
            color: '#58a700' 
          }}>
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
          </span>
          Your settings are saved automatically. Need help? Contact support or check the FAQ.
        </div>
        <div className="card-footer py-3 text-center border-top" style={{ 
          background: 'transparent', 
          fontSize: 'clamp(0.8rem, 3.5vw, 0.9rem)', 
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }} 
            className={`btn btn-outline-primary px-4 w-100 w-sm-auto rounded-pill${isDark ? ' text-light' : ''}`} 
            onClick={onClose} 
            style={{ 
              borderRadius: 16, 
              fontWeight: 600, 
              letterSpacing: '.01em',
              minHeight: '44px',
              fontSize: 'clamp(0.85rem, 3.5vw, 0.9rem)',
              background: isDark ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.05)',
              backdropFilter: 'blur(4px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(79, 70, 229, 0.3)'
            }}
          >
            <i className="material-icons align-middle me-2">arrow_back</i>
            Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;