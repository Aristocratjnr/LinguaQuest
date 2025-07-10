import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.png';
import avatar3 from '../assets/images/programmer.png';
import avatar4 from '../assets/images/avatar.png';

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
    <div className={`container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4${isDark ? ' dark' : ''}`}
         style={{ background: bgGradient }}>
      <motion.div
        className="card shadow-lg w-100"
        style={{ maxWidth: 420, borderRadius: '1rem', fontFamily: "'JetBrains Mono', monospace", minHeight: 420, background: cardBg, color: inputText }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="card-header d-flex justify-content-between align-items-center border-bottom py-3"
             style={{ background: cardHeaderBg }}>
          <h2 className="fw-bold mb-0" style={{ color: textColor, fontSize: '1.1rem' }}>
            <i className="material-icons align-middle me-2">settings</i>
            Settings
          </h2>
          <button className={`btn btn-sm btn-outline-secondary${isDark ? ' border-light text-light' : ''}`} onClick={onClose}>
            <i className="material-icons align-middle">close</i>
          </button>
        </div>
        <div className="card-body p-3 p-sm-4">
          {/* Profile Section */}
          <div className="mb-4">
            <div className="mb-2 fw-bold" style={{ fontSize: '1rem', color: labelColor }}>Profile</div>
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
            <div className="mb-2 fw-bold" style={{ fontSize: '1rem', color: labelColor }}>Preferences</div>
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
            <div className="mb-2 fw-bold" style={{ fontSize: '1rem', color: labelColor }}>Real-Time Controls</div>
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
            <div className="mb-2 fw-bold" style={{ fontSize: '1rem', color: labelColor }}>Live Preview</div>
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
        </div>
        <div className="card-footer py-3 text-center border-top" style={{ background: cardFooterBg, fontSize: '0.9rem' }}>
          <button className={`btn btn-outline-primary px-4 w-100 w-sm-auto${isDark ? ' border-light text-light' : ''}`} onClick={onClose}>
            <i className="material-icons align-middle me-2">arrow_back</i>
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage; 