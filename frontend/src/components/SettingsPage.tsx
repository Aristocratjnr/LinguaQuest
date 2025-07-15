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
      axios.get(`/streak`, { params: { nickname } }),
      axios.get(`/level`, { params: { nickname } })
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
      const res = await axios.patch(`/streak?nickname=${encodeURIComponent(nickname)}&streak=1`);
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
      const res = await axios.patch(`/level?nickname=${encodeURIComponent(nickname)}&level=1`);
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
  const cardBg = isDark ? '#232946' : '#fff';
  const cardHeaderBg = isDark ? 'rgba(79, 70, 229, 0.10)' : 'rgba(79, 70, 229, 0.05)';
  const cardFooterBg = cardHeaderBg;
  const textColor = isDark ? '#e0e7ff' : '#4f46e5';
  const labelColor = isDark ? '#a5b4fc' : '#4f46e5';
  const borderColor = isDark ? '#444c6e' : '#e0e7ef';
  const inputBg = isDark ? '#181c2a' : '#fff';
  const inputText = isDark ? '#e0e7ff' : '#22223b';

  return (
    <div className={`container-fluid d-flex align-items-center justify-content-center min-vh-100 px-6 px-sm-3 px-md-4${isDark ? ' dark' : ''}`}
         style={{ background: bgGradient }}>
      <motion.div
        className="card shadow-lg w-100"
        style={{ maxWidth: 480, borderRadius: 16, fontFamily: "'JetBrains Mono', monospace", minHeight: 440, background: cardBg, color: inputText, boxShadow: isDark ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* --- HEADER --- */}
        <div className="card-header d-flex justify-content-between align-items-center border-bottom py-3 px-3 px-sm-4"
             style={{ background: 'transparent', borderBottom: isDark ? '1.5px solid #444c6e' : '1.5px solid #e0e7ef' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="d-flex align-items-center justify-content-center me-2" style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: isDark ? '#232946' : '#e8f5e9',
              color: '#58a700', boxShadow: '0 2px 8px rgba(88,167,0,0.07)'
            }}>
              <i className="material-icons" style={{ fontSize: '1.5rem' }}>settings</i>
            </span>
            <h2 className="fw-bold mb-0" style={{ color: isDark ? '#e0e7ff' : '#58a700', fontSize: '1.15rem', letterSpacing: '.01em' }}>
              Settings
            </h2>
            <span className="badge px-3 py-1 d-flex align-items-center ms-2" style={{
              backgroundColor: isDark ? '#232946' : '#e8f5e9',
              color: '#58a700', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '.01em'
            }}>
              <i className="material-icons me-1" style={{ fontSize: '1rem' }}>tune</i>
              Profile
            </span>
          </div>
          <button className={`btn btn-sm btn-outline-secondary rounded-circle ms-2${isDark ? ' border-light text-light' : ''}`} onClick={onClose} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: isDark ? '#232946' : '#f8f9fa' }}>
            <i className="material-icons align-middle">close</i>
          </button>
        </div>
        <div className="card-body p-3 p-sm-4">
          {/* Profile Section */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2 fw-bold" style={{ fontSize: '1rem', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: isDark ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>face</i>
              </span>
              Profile
            </div>
            <div className="row g-3 align-items-center flex-column flex-sm-row">
              <div className="col-12 col-sm-4 text-center mb-2 mb-sm-0">
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {AVATARS.map((a, i) => (
                    <motion.img
                      key={i}
                      src={a}
                      alt={`Avatar ${i + 1}`}
                      className={`rounded-circle bg-white border ${avatar === a ? 'border-primary' : ''}`}
                      style={{ width: 44, height: 44, cursor: 'pointer', boxShadow: avatar === a ? '0 0 8px #4f46e5' : '0 2px 6px #0001', opacity: avatar === a ? 1 : 0.7, borderWidth: 2 }}
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
                <label className="form-label mb-1" style={{ color: labelColor }}>Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  value={nickname}
                  onChange={handleNicknameChange}
                  maxLength={16}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', background: inputBg, color: inputText, borderColor }}
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2 fw-bold" style={{ fontSize: '1rem', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: isDark ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>tune</i>
              </span>
              Preferences
            </div>
            <div className="row g-3 align-items-center">
              <div className="col-12 col-sm-6 mb-2 mb-sm-0">
                <label className="form-label mb-1" style={{ color: labelColor }}>Language</label>
                <select className="form-select" value={language} onChange={handleLanguageChange} style={{ fontFamily: "'JetBrains Mono', monospace", background: inputBg, color: inputText, borderColor }}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label mb-1" style={{ color: labelColor }}>Theme</label>
                <select className="form-select" value={theme} onChange={handleThemeChange} style={{ fontFamily: "'JetBrains Mono', monospace", background: inputBg, color: inputText, borderColor }}>
                  {THEMES.map(t => (
                    <option key={t.code} value={t.code}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Real-Time Toggles */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2 fw-bold" style={{ fontSize: '1rem', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: isDark ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>volume_up</i>
              </span>
              Real-Time Controls
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="soundSwitch" checked={sound} onChange={handleSoundToggle} />
                <label className="form-check-label" htmlFor="soundSwitch" style={{ fontFamily: "'JetBrains Mono', monospace", color: labelColor }}>
                  Sound {sound ? 'On' : 'Off'}
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mb-2">
            <div className="d-flex align-items-center gap-2 mb-2 fw-bold" style={{ fontSize: '1rem', color: '#58a700' }}>
              <span className="d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: isDark ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>visibility</i>
              </span>
              Live Preview
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex flex-column align-items-center">
                <img src={avatar} alt="Preview Avatar" className="rounded-circle mb-2" style={{ width: 44, height: 44, border: '2px solid #4f46e5' }} />
                <span className="badge bg-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{nickname || 'Player'}</span>
              </div>
              <div className="d-flex flex-column align-items-start">
                <span className="text-muted small">Language: <b>{LANGUAGES.find(l => l.code === language)?.label}</b></span>
                <span className="text-muted small">Theme: <b>{THEMES.find(t => t.code === theme)?.label}</b></span>
                <span className="text-muted small">Sound: <b>{sound ? 'On' : 'Off'}</b></span>
              </div>
            </div>
          </div>

          <hr className="my-4" />
          <div className="d-flex align-items-center gap-2 mb-3 fw-bold" style={{ fontSize: '1rem', color: '#58a700' }}>
            <span className="d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: isDark ? '#232946' : '#e8f5e9', color: '#58a700' }}>
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>emoji_events</i>
            </span>
            Engagement Stats
          </div>
          {loading ? (
            <div className="text-center py-3"><span className="spinner-border" /></div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : (
            <div className="d-flex flex-column gap-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="badge px-3 py-2 d-flex align-items-center" style={{ backgroundColor: '#fff3cd', color: '#b68900', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', letterSpacing: '.01em' }}>
                  <i className="material-icons me-1" style={{ fontSize: '1.1rem', color: '#b68900' }}>local_fire_department</i>
                  Streak: {streak}
                </span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn btn-xs btn-outline-danger ms-2 rounded-pill" style={{ fontSize: '0.8rem', padding: '0.1rem 0.6rem', borderRadius: 16 }} onClick={handleResetStreak} disabled={resetting}>
                  <i className="material-icons align-middle me-1" style={{ fontSize: '1rem' }}>restart_alt</i>Reset
                </motion.button>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge px-3 py-2 d-flex align-items-center" style={{ backgroundColor: '#e0f7fa', color: '#007b83', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', letterSpacing: '.01em' }}>
                  <i className="material-icons me-1" style={{ fontSize: '1.1rem', color: '#007b83' }}>military_tech</i>
                  Level: {level}
                </span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn btn-xs btn-outline-danger ms-2 rounded-pill" style={{ fontSize: '0.8rem', padding: '0.1rem 0.6rem', borderRadius: 16 }} onClick={handleResetLevel} disabled={resetting}>
                  <i className="material-icons align-middle me-1" style={{ fontSize: '1rem' }}>restart_alt</i>Reset
                </motion.button>
              </div>
            </div>
          )}
        </div>
        <ToastContainer position="top-center" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Notification Toasts" />
        <div className="text-muted small mt-4 d-flex align-items-center justify-content-center gap-2" style={{ color: isDark ? '#a5b4fc' : '#6c757d', fontSize: '0.85rem' }}>
          <span className="d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isDark ? '#232946' : '#e8f5e9', color: '#58a700' }}>
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
          </span>
          Your settings are saved automatically. Need help? Contact support or check the FAQ.
        </div>
        <div className="card-footer py-3 text-center border-top" style={{ background: cardFooterBg, fontSize: '0.9rem', borderTop: isDark ? '1.5px solid #444c6e' : '1.5px solid #e0e7ef' }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`btn btn-outline-primary px-4 w-100 w-sm-auto rounded-pill${isDark ? ' border-light text-light' : ''}`} onClick={onClose} style={{ borderRadius: 16, fontWeight: 600, letterSpacing: '.01em' }}>
            <i className="material-icons align-middle me-2">arrow_back</i>
            Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage; 