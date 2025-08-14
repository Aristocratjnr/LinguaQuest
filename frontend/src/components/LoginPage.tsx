import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

// Add Material Icons font
const materialIconsFont = (
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet"
  />
);

const LoginPage: React.FC = () => {
  const { loginUser } = useUser();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginUser(nickname.trim());
      // After successful login, navigate to the dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error details:', err);
      if (err.message && err.message.includes('Network Error')) {
        setError('Backend server is not running. Please start the server first.');
      } else if (err.response && err.response.status === 404) {
        setError('No profile found with that nickname. Please check spelling or ask an admin to create a profile.');
      } else {
        setError('Login failed. Please check if the backend server is running and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPlay = async () => {
    setError('');
    setLoading(true);
    try {
      await loginUser(nickname.trim());
      // Skip category selection and go directly to the dashboard with default settings
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error details:', err);
      if (err.message && err.message.includes('Network Error')) {
        setError('Backend server is not running. Please start the server first.');
      } else if (err.response && err.response.status === 404) {
        setError('No profile found with that nickname. Please check spelling or ask an admin to create a profile.');
      } else {
        setError('Login failed. Please check if the backend server is running and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    setShowContactInfo(true);
  };

  return (
    <div className="duo-login-bg">
      {materialIconsFont}
      <div className="duo-login-card">
        <div className="duo-mascot-container">
          <img src={logo} alt="LinguaQuest Mascot" className="duo-login-logo" />
          <div className="duo-mascot-speech-bubble">
            <div className="speech-text">Ready to continue your quest?</div>
          </div>
        </div>
        <h1 className="duo-login-title">Welcome back!</h1>
        <div className="duo-login-subtitle">
          Sign in to pick up where you left off
        </div>
        <div className="duo-form-container">
          <div className="duo-input-group">
            <div className="duo-input-wrapper">
              <span className="material-icons duo-input-icon">person</span>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Nickname"
                className="duo-login-input"
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter' && nickname.trim()) handleLogin(); }}
              />
            </div>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !nickname.trim()}
            className={`duo-login-btn ${loading ? 'loading' : ''} ${!nickname.trim() ? 'disabled' : ''}`}
          >
            <span className="btn-content">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>CONTINUE</span>
                  <span className="material-icons">arrow_forward</span>
                </>
              )}
            </span>
          </button>
          
          <div style={{ margin: '12px 0', textAlign: 'center', color: '#777', fontSize: '14px' }}>
            or
          </div>
          
          <button
            onClick={handleQuickPlay}
            disabled={loading || !nickname.trim()}
            className={`duo-login-btn-secondary ${loading ? 'loading' : ''} ${!nickname.trim() ? 'disabled' : ''}`}
          >
            <span className="btn-content">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span className="material-icons">play_arrow</span>
                  <span>QUICK PLAY</span>
                </>
              )}
            </span>
          </button>
        </div>
        {error && (
          <div className="duo-login-error">
            <span className="material-icons">error_outline</span>
            {error}
          </div>
        )}
        <div className="duo-login-footer">
          <span>Don't have a profile?</span>
          <br />
          <span 
            className="duo-login-link"
            onClick={handleContactAdmin}
          >
            Ask an admin to create one for you
          </span>
        </div>
        
        {/* Contact Info Modal */}
        {showContactInfo && (
          <div className="contact-modal-overlay" onClick={() => setShowContactInfo(false)}>
            <div className="contact-modal" onClick={e => e.stopPropagation()}>
              <div className="contact-modal-header">
                <h3>Contact Administrator</h3>
                <button 
                  className="contact-modal-close"
                  onClick={() => setShowContactInfo(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="contact-modal-body">
                <p>To create a new profile, please contact your administrator using one of these methods:</p>
                <div className="contact-options">
                  <div className="contact-option">
                    <span className="material-icons">email</span>
                    <div>
                      <strong>Email</strong>
                      <p>admin@linguaquest.com</p>
                    </div>
                  </div>
                  <div className="contact-option">
                    <span className="material-icons">school</span>
                    <div>
                      <strong>Ask your teacher</strong>
                      <p>Contact your instructor or supervisor</p>
                    </div>
                  </div>
                  <div className="contact-option">
                    <span className="material-icons">support</span>
                    <div>
                      <strong>Support</strong>
                      <p>Use the feedback option in the app</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="contact-modal-footer">
                <button 
                  className="contact-modal-btn"
                  onClick={() => setShowContactInfo(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .duo-login-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #ffffff, #ffffff); 
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .duo-login-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .duo-login-card {
          background: var(--duo-card);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.06);
          padding: 48px 40px 40px;
          max-width: 400px;
          width: calc(100vw - 40px);
          text-align: center;
          border: 2px solid rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
          animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(10px);
        }
        
        .duo-mascot-container {
          position: relative;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .duo-login-logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #58cc02, #89e219);
          padding: 4px;
          box-shadow: 0 8px 32px rgba(88, 204, 2, 0.3);
          animation: bounce 2s infinite;
          transition: transform 0.3s ease;
        }
        
        .duo-login-logo:hover {
          transform: scale(1.05);
        }
        
        .duo-mascot-speech-bubble {
          position: relative;
          background: var(--duo-card);
          border-radius: 20px;
          padding: 12px 20px;
          margin-top: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          animation: fadeInDelay 0.8s ease 0.3s both;
        }
        
        .duo-mascot-speech-bubble::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid var(--duo-card);
        }
        
        .speech-text {
          font-size: 14px;
          color: var(--lq-text-main);
          font-weight: 600;
        }
        
        .duo-login-title {
          color: var(--lq-text-main);
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          animation: fadeInDelay 0.6s ease 0.2s both;
        }
        
        .duo-login-subtitle {
          color: var(--lq-text-muted);
          font-size: 16px;
          font-weight: 400;
          margin: 0 0 32px 0;
          line-height: 1.4;
          animation: fadeInDelay 0.6s ease 0.4s both;
        }
        
        .duo-form-container {
          margin-bottom: 24px;
          animation: fadeInDelay 0.6s ease 0.6s both;
        }
        
        .duo-input-group {
          margin-bottom: 20px;
        }
        
        .duo-input-wrapper {
          position: relative;
          width: 100%;
        }
        
        .duo-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--lq-text-muted);
          font-size: 24px;
          z-index: 2;
          transition: color 0.2s ease;
        }
        
        .duo-login-input {
          width: 100%;
          padding: 16px 16px 16px 52px;
          border: 2px solid var(--lq-border);
          border-radius: 16px;
          font-size: 16px;
          font-weight: 400;
          background: var(--duo-card);
          color: var(--lq-text-main);
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .duo-login-input:focus {
          border-color: var(--duo-card);
          background: var(--duo-card);
          box-shadow: 0 0 0 4px rgba(88, 204, 2, 0.1);
        }
        
        .duo-login-input:focus + .duo-input-icon,
        .duo-login-input:not(:placeholder-shown) + .duo-input-icon {
          color: var(--duo-card);
        }
        
        .duo-login-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(180deg, var(--duo-card), var(--duo-card));
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 0 var(--duo-card), 0 8px 25px rgba(88, 204, 2, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .duo-login-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 var(--duo-card), 0 12px 35px rgba(88, 204, 2, 0.4);
        }
        
        .duo-login-btn:active:not(.disabled) {
          transform: translateY(2px);
          box-shadow: 0 2px 0 var(--duo-card), 0 4px 15px rgba(88, 204, 2, 0.2);
        }
        
        .duo-login-btn.disabled {
          background: var(--lq-disabled);
          color: var(--lq-text-disabled);
          cursor: not-allowed;
          box-shadow: 0 4px 0 var(--lq-disabled);
          transform: none;
        }
        
        .duo-login-btn.loading {
          pointer-events: none;
        }
        
        .duo-login-btn-secondary {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(180deg, var(--duo-card), var(--duo-card));
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 3px 0 var(--duo-card), 0 6px 20px rgba(28, 176, 246, 0.25);
          position: relative;
          overflow: hidden;
        }
        
        .duo-login-btn-secondary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 0 var(--duo-card), 0 10px 30px rgba(28, 176, 246, 0.35);
        }
        
        .duo-login-btn-secondary:active:not(.disabled) {
          transform: translateY(1px);
          box-shadow: 0 2px 0 var(--duo-card), 0 4px 15px rgba(28, 176, 246, 0.2);
        }
        
        .duo-login-btn-secondary.disabled {
          background: var(--lq-disabled);
          color: var(--lq-text-disabled);
          cursor: not-allowed;
          box-shadow: 0 3px 0 var(--lq-disabled);
          transform: none;
        }
        
        .duo-login-btn-secondary.loading {
          pointer-events: none;
        }
        
        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .duo-login-error {
          background: var(--lq-error);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.5s ease-in-out;
        }
        
        .duo-login-footer {
          color: var(--lq-text-muted);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.4;
          animation: fadeInDelay 0.6s ease 0.8s both;
        }
        
        .duo-login-link {
          color: var(--duo-card);
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .duo-login-link:hover {
          color: var(--duo-card);
        }
        
        .contact-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          padding: 16px;
        }
        
        .contact-modal {
          background: var(--duo-card);
          border-radius: 20px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        
        .contact-modal-header {
          padding: 24px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .contact-modal-header h3 {
          margin: 0;
          color: var(--lq-text-main);
          font-size: 24px;
          font-weight: 700;
        }
        
        .contact-modal-close {
          background: none;
          border: none;
          color: var(--lq-text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .contact-modal-close:hover {
          background: var(--lq-disabled);
          color: var(--lq-text-disabled);
        }
        
        .contact-modal-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }
        
        .contact-modal-body p {
          color: var(--lq-text-muted);
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
        
        .contact-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .contact-option {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: var(--duo-card);
          border-radius: 12px;
          transition: all 0.2s ease;
          margin-bottom: 2px;
        }
        
        .contact-option:hover {
          background: var(--lq-disabled);
          transform: translateY(-1px);
        }
        
        .contact-option .material-icons {
          color: var(--duo-card);
          font-size: 28px;
          margin-top: 2px;
        }
        
        .contact-option div {
          flex: 1;
        }
        
        .contact-option strong {
          color: var(--lq-text-main);
          font-size: 16px;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }
        
        .contact-option p {
          color: var(--lq-text-muted);
          font-size: 14px;
          margin: 0;
          line-height: 1.4;
        }
        
        .contact-modal-footer {
          padding: 0 24px 24px;
        }
        
        .contact-modal-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(180deg, #58cc02 0%, #4eb600 100%);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 0 #46a302;
        }
        
        .contact-modal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.3);
        }
        
        .contact-modal-btn:active {
          transform: translateY(1px);
          box-shadow: 0 2px 0 #46a302;
        }
        
        .material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeInDelay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Light theme specific styles */
        body:not(.dark) .duo-login-bg {
          background: linear-gradient(135deg, #e0f7fa 0%, #f5f5f5 100%);
        }
        
        body:not(.dark) .duo-login-card {
          background: white;
          box-shadow: 0 8px 32px rgba(88, 204, 2, 0.12);
        }
        
        body:not(.dark) .duo-login-title {
          color: #1a1a1a;
        }
        
        body:not(.dark) .duo-login-subtitle {
          color: #666666;
        }
        
        body:not(.dark) .duo-input-icon {
          color: #888888;
        }
        
        body:not(.dark) .duo-login-input {
          background: white;
          border-color: #e0e0e0;
          color: #333333;
        }
        
        body:not(.dark) .duo-login-input:focus {
          border-color: #58cc02;
          box-shadow: 0 0 0 4px rgba(88, 204, 2, 0.1);
        }
        
        body:not(.dark) .duo-login-input:focus + .duo-input-icon,
        body:not(.dark) .duo-login-input:not(:placeholder-shown) + .duo-input-icon {
          color: #58cc02;
        }
        
        body:not(.dark) .duo-login-btn {
          background: linear-gradient(180deg, #58cc02 0%, #46a302 100%);
          color: white;
          box-shadow: 0 4px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.3);
        }
        
        body:not(.dark) .duo-login-btn:hover:not(.disabled) {
          box-shadow: 0 6px 0 #46a302, 0 12px 35px rgba(88, 204, 2, 0.4);
        }
        
        body:not(.dark) .duo-login-btn:active:not(.disabled) {
          box-shadow: 0 2px 0 #46a302;
        }
        
        body:not(.dark) .duo-login-btn.disabled {
          background: #e0e0e0;
          color: #999999;
          box-shadow: 0 4px 0 #cccccc;
        }
        
        body:not(.dark) .quick-play-btn,
        .quick-play-btn,
        .duo-login-bg .quick-play-btn {
          background: linear-gradient(180deg, #1cb0f6 0%, #1899d6 100%) !important;
          color: white !important;
          box-shadow: 0 4px 0 #1899d6, 0 8px 25px rgba(28, 176, 246, 0.3) !important;
        }
        
        body:not(.dark) .quick-play-btn:hover,
        .quick-play-btn:hover,
        .duo-login-bg .quick-play-btn:hover {
          box-shadow: 0 6px 0 #1899d6, 0 12px 35px rgba(28, 176, 246, 0.4) !important;
        }
        
        body:not(.dark) .quick-play-btn:active,
        .quick-play-btn:active,
        .duo-login-bg .quick-play-btn:active {
          box-shadow: 0 2px 0 #1899d6 !important;
        }
        
        /* Login link styles */
        .duo-login-link {
          color: #1cb0f6;
          cursor: pointer;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
          margin-top: 4px;
          display: inline-block;
        }
        
        .duo-login-link:hover {
          color: #1899d6;
          text-decoration: underline;
        }
        
        /* Dark theme overrides */
        body.dark .duo-login-link,
        .dark .duo-login-link {
          color: #58cc02;
        }
        
        body.dark .duo-login-link:hover,
        .dark .duo-login-link:hover {
          color: #46a302;
        }
        
        body:not(.dark) .duo-login-btn-secondary,
        .duo-login-btn-secondary,
        .duo-login-bg .duo-login-btn-secondary {
          background: linear-gradient(180deg, #1cb0f6 0%, #1899d6 100%) !important;
          color: white !important;
          box-shadow: 0 3px 0 #1899d6, 0 6px 20px rgba(28, 176, 246, 0.25) !important;
        }
        
        body:not(.dark) .duo-login-btn-secondary:hover:not(.disabled),
        .duo-login-btn-secondary:hover:not(.disabled),
        .duo-login-bg .duo-login-btn-secondary:hover:not(.disabled) {
          box-shadow: 0 5px 0 #1899d6, 0 10px 30px rgba(28, 176, 246, 0.35) !important;
        }
        
        body:not(.dark) .duo-login-btn-secondary:active:not(.disabled),
        .duo-login-btn-secondary:active:not(.disabled),
        .duo-login-bg .duo-login-btn-secondary:active:not(.disabled) {
          box-shadow: 0 2px 0 #1899d6 !important;
          transform: translateY(1px);
        }
        
        body:not(.dark) .duo-login-btn-secondary.disabled,
        .duo-login-btn-secondary.disabled,
        .duo-login-bg .duo-login-btn-secondary.disabled {
          background: #f0f0f0 !important;
          color: #999999 !important;
          box-shadow: 0 3px 0 #e0e0e0 !important;
        }
        
        body:not(.dark) .contact-admin-btn {
          color: #666666;
          border: 2px solid #e0e0e0;
        }
        
        body:not(.dark) .contact-admin-btn:hover {
          background: #f5f5f5;
          color: #333333;
        }
        
        body:not(.dark) .error-message {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }
        
        body:not(.dark) .contact-modal {
          background: white;
        }
        
        body:not(.dark) .contact-modal-header h3 {
          color: #1a1a1a;
        }
        
        body:not(.dark) .contact-modal-close {
          color: #888888;
        }
        
        body:not(.dark) .contact-modal-close:hover {
          background: #f5f5f5;
        }
        
        body:not(.dark) .contact-modal-body p {
          color: #666666;
        }
        
        body:not(.dark) .contact-option {
          background: white;
        }
        
        body:not(.dark) .contact-option:hover {
          background: #f5f5f5;
        }
        
        body:not(.dark) .contact-option .material-icons {
          color: #58cc02;
        }
        
        body:not(.dark) .contact-option strong {
          color: #1a1a1a;
        }
        
        body:not(.dark) .contact-option p {
          color: #666666;
        }
        
        body:not(.dark) .contact-modal-btn {
          background: linear-gradient(180deg, #58cc02 0%, #46a302 100%);
          color: white;
          box-shadow: 0 4px 0 #46a302;
        }
        
        body:not(.dark) .contact-modal-btn:hover {
          box-shadow: 0 6px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.3);
        }
        
        body:not(.dark) .contact-modal-btn:active {
          box-shadow: 0 2px 0 #46a302;
        }
        
        body:not(.dark) .duo-mascot-speech-bubble {
          background: white;
          color: #333333;
          border: 1px solid #e0e0e0;
        }
        
        body:not(.dark) .duo-mascot-speech-bubble::after {
          border-top-color: white;
        }
        
        body:not(.dark) .speech-text {
          color: #333333;
        }
        
        /* Dark theme specific styles */
        body.dark .duo-login-bg,
        .dark .duo-login-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        
        body.dark .duo-login-card,
        .dark .duo-login-card {
          background: #1e293b;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        body.dark .duo-login-title,
        .dark .duo-login-title {
          color: #f0f0f0;
        }
        
        body.dark .duo-login-subtitle,
        .dark .duo-login-subtitle {
          color: #cbd5e1;
        }
        
        body.dark .duo-input-icon,
        .dark .duo-input-icon {
          color: #94a3b8;
        }
        
        body.dark .duo-login-input,
        .dark .duo-login-input {
          background: #0f172a;
          border-color: #334155;
          color: #f0f0f0;
        }
        
        body.dark .duo-login-input:focus,
        .dark .duo-login-input:focus {
          border-color: #58cc02;
          box-shadow: 0 0 0 4px rgba(88, 204, 2, 0.2);
        }
        
        body.dark .duo-login-input:focus + .duo-input-icon,
        body.dark .duo-login-input:not(:placeholder-shown) + .duo-input-icon,
        .dark .duo-login-input:focus + .duo-input-icon,
        .dark .duo-login-input:not(:placeholder-shown) + .duo-input-icon {
          color: #58cc02;
        }
        
        body.dark .duo-login-btn,
        .dark .duo-login-btn {
          background: linear-gradient(180deg, #58cc02 0%, #46a302 100%);
          color: white;
          box-shadow: 0 4px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.4);
        }
        
        body.dark .duo-login-btn:hover:not(.disabled),
        .dark .duo-login-btn:hover:not(.disabled) {
          box-shadow: 0 6px 0 #46a302, 0 12px 35px rgba(88, 204, 2, 0.5);
        }
        
        body.dark .duo-login-btn:active:not(.disabled),
        .dark .duo-login-btn:active:not(.disabled) {
          box-shadow: 0 2px 0 #46a302;
        }
        
        body.dark .duo-login-btn.disabled,
        .dark .duo-login-btn.disabled {
          background: #334155;
          color: #94a3b8;
          box-shadow: 0 4px 0 #1e293b;
        }
        
        body.dark .duo-login-btn-secondary,
        .dark .duo-login-btn-secondary,
        .duo-login-bg .duo-login-btn-secondary {
          background: linear-gradient(180deg, #1cb0f6 0%, #1899d6 100%) !important;
          color: white !important;
          box-shadow: 0 3px 0 #1899d6, 0 6px 20px rgba(28, 176, 246, 0.25) !important;
        }
        
        body.dark .duo-login-btn-secondary:hover:not(.disabled),
        .dark .duo-login-btn-secondary:hover:not(.disabled),
        .duo-login-bg .duo-login-btn-secondary:hover:not(.disabled) {
          box-shadow: 0 5px 0 #1899d6, 0 10px 30px rgba(28, 176, 246, 0.35) !important;
        }
        
        body.dark .duo-login-btn-secondary:active:not(.disabled),
        .dark .duo-login-btn-secondary:active:not(.disabled),
        .duo-login-bg .duo-login-btn-secondary:active:not(.disabled) {
          box-shadow: 0 2px 0 #1899d6 !important;
          transform: translateY(1px);
        }
        
        body.dark .duo-login-btn-secondary.disabled,
        .dark .duo-login-btn-secondary.disabled,
        .duo-login-bg .duo-login-btn-secondary.disabled {
          background: #334155 !important;
          color: #94a3b8 !important;
          box-shadow: 0 3px 0 #1e293b !important;
        }
        
        body.dark .quick-play-btn,
        .dark .quick-play-btn,
        .duo-login-bg .quick-play-btn {
          background: linear-gradient(180deg, #1cb0f6 0%, #1899d6 100%) !important;
          color: white !important;
          box-shadow: 0 4px 0 #1899d6, 0 8px 25px rgba(28, 176, 246, 0.4) !important;
        }
        
        body.dark .quick-play-btn:hover,
        .dark .quick-play-btn:hover,
        .duo-login-bg .quick-play-btn:hover {
          box-shadow: 0 6px 0 #1899d6, 0 12px 35px rgba(28, 176, 246, 0.5) !important;
        }
        
        body.dark .quick-play-btn:active,
        .dark .quick-play-btn:active,
        .duo-login-bg .quick-play-btn:active {
          box-shadow: 0 2px 0 #1899d6 !important;
        }
        
        body.dark .contact-admin-btn,
        .dark .contact-admin-btn {
          color: #cbd5e1;
          border: 2px solid #334155;
        }
        
        body.dark .contact-admin-btn:hover,
        .dark .contact-admin-btn:hover {
          background: #1e293b;
          color: #f0f0f0;
        }
        
        body.dark .error-message,
        .dark .error-message {
          background: #331a1a;
          color: #ff6b6b;
          border: 1px solid #552222;
        }
        
        body.dark .contact-modal,
        .dark .contact-modal {
          background: #1e293b;
        }
        
        body.dark .contact-modal-header h3,
        .dark .contact-modal-header h3 {
          color: #f0f0f0;
        }
        
        body.dark .contact-modal-close,
        .dark .contact-modal-close {
          color: #94a3b8;
        }
        
        body.dark .contact-modal-close:hover,
        .dark .contact-modal-close:hover {
          background: #0f172a;
        }
        
        body.dark .contact-modal-body p,
        .dark .contact-modal-body p {
          color: #cbd5e1;
        }
        
        body.dark .contact-option,
        .dark .contact-option {
          background: #0f172a;
        }
        
        body.dark .contact-option:hover,
        .dark .contact-option:hover {
          background: #1e293b;
        }
        
        body.dark .contact-option .material-icons,
        .dark .contact-option .material-icons {
          color: #58cc02;
        }
        
        body.dark .contact-option strong,
        .dark .contact-option strong {
          color: #f0f0f0;
        }
        
        body.dark .contact-option p,
        .dark .contact-option p {
          color: #cbd5e1;
        }
        
        body.dark .contact-modal-btn,
        .dark .contact-modal-btn {
          background: linear-gradient(180deg, #58cc02 0%, #46a302 100%);
          color: white;
          box-shadow: 0 4px 0 #46a302;
        }
        
        body.dark .contact-modal-btn:hover,
        .dark .contact-modal-btn:hover {
          box-shadow: 0 6px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.4);
        }
        
        body.dark .contact-modal-btn:active,
        .dark .contact-modal-btn:active {
          box-shadow: 0 2px 0 #46a302;
        }
        
        body.dark .duo-mascot-speech-bubble,
        .dark .duo-mascot-speech-bubble {
          background: #0f172a;
          color: #f0f0f0;
          border: 1px solid #334155;
        }
        
        body.dark .duo-mascot-speech-bubble::after,
        .dark .duo-mascot-speech-bubble::after {
          border-top-color: #0f172a;
        }
        
        body.dark .speech-text,
        .dark .speech-text {
          color: #f0f0f0;
        }
        
        @media (max-width: 480px) {
          .duo-login-bg {
            padding: 0;
            min-height: 100vh;
          }
          
          .duo-login-card {
            padding: 24px 16px;
            border-radius: 0;
            margin: 0;
            width: 100vw;
            min-height: 100vh;
            box-shadow: none;
            border: none;
          }
          
          .duo-login-logo {
            width: 72px;
            height: 72px;
          }
          
          .duo-login-title {
            font-size: 24px;
            margin-top: 8px;
          }
          
          .duo-login-subtitle {
            font-size: 14px;
            margin-bottom: 24px;
          }
          
          .duo-input-wrapper {
            margin-bottom: 16px;
          }
          
          .duo-login-input,
          .duo-login-btn,
          .duo-login-btn-secondary {
            font-size: 16px;
            padding: 16px;
            min-height: 48px; /* Touch target size */
            border-radius: 12px;
          }
          
          .duo-login-input {
            padding-left: 48px;
          }
          
          .duo-mascot-speech-bubble {
            font-size: 12px;
            padding: 8px 12px;
            max-width: 160px;
          }
          
          .speech-text {
            font-size: 12px;
          }
          
          .duo-login-btn {
            margin-top: 8px;
          }
          
          .duo-login-btn-secondary {
            font-size: 14px;
            padding: 14px;
            margin-top: 12px;
            min-height: 48px; /* Touch target size */
          }
          
          .contact-admin-btn {
            font-size: 14px;
            padding: 14px;
            margin-top: 16px;
            min-height: 48px; /* Touch target size */
          }
          
          /* Mobile modal styles */
          .contact-modal {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
          }
          
          .contact-modal-header {
            padding: 20px 16px 0;
          }
          
          .contact-modal-header h3 {
            font-size: 22px;
          }
          
          .contact-modal-close {
            padding: 8px;
            font-size: 24px;
          }
          
          .contact-modal-body {
            padding: 16px;
            flex: 1;
            overflow-y: auto;
          }
          
          .contact-modal-body p {
            font-size: 15px;
            margin-bottom: 16px;
            line-height: 1.5;
          }
          
          .contact-options {
            gap: 16px;
          }
          
          .contact-option {
            padding: 16px;
            gap: 16px;
            border-radius: 12px;
          }
          
          .contact-option .material-icons {
            font-size: 28px;
          }
          
          .contact-option strong {
            font-size: 16px;
          }
          
          .contact-option p {
            font-size: 14px;
            margin-top: 4px;
          }
          
          .contact-modal-footer {
            padding: 0 16px 16px;
          }
          
          .contact-modal-btn {
            padding: 16px;
            font-size: 16px;
            border-radius: 12px;
            min-height: 48px; /* Touch target size */
          }
          
          /* Error message adjustments */
          .duo-login-error {
            font-size: 14px;
            padding: 12px;
            margin-top: 16px;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 