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
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginUser(nickname.trim());
      navigate('/');
    } catch (err: any) {
      setError('No such profile found. Please check your nickname.');
    } finally {
      setLoading(false);
    }
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
          <span className="duo-login-link">Ask an admin to create one for you</span>
        </div>
      </div>
      <style>{`
        .duo-login-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #58cc02 0%, #89e219 50%, #58cc02 100%);
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
          background: #ffffff;
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
          background: #f7f7f7;
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
          border-bottom: 10px solid #f7f7f7;
        }
        
        .speech-text {
          font-size: 14px;
          color: #4b4b4b;
          font-weight: 600;
        }
        
        .duo-login-title {
          color: #3c3c3c;
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          animation: fadeInDelay 0.6s ease 0.2s both;
        }
        
        .duo-login-subtitle {
          color: #777;
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
          color: #afafaf;
          font-size: 24px;
          z-index: 2;
          transition: color 0.2s ease;
        }
        
        .duo-login-input {
          width: 100%;
          padding: 16px 16px 16px 52px;
          border: 2px solid #e5e5e5;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 400;
          background: #fafafa;
          color: #3c3c3c;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .duo-login-input:focus {
          border-color: #58cc02;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(88, 204, 2, 0.1);
        }
        
        .duo-login-input:focus + .duo-input-icon,
        .duo-login-input:not(:placeholder-shown) + .duo-input-icon {
          color: #58cc02;
        }
        
        .duo-login-btn {
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
          box-shadow: 0 4px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .duo-login-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #46a302, 0 12px 35px rgba(88, 204, 2, 0.4);
        }
        
        .duo-login-btn:active:not(.disabled) {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #46a302, 0 4px 15px rgba(88, 204, 2, 0.2);
        }
        
        .duo-login-btn.disabled {
          background: #e5e5e5;
          color: #afafaf;
          cursor: not-allowed;
          box-shadow: 0 4px 0 #d0d0d0;
          transform: none;
        }
        
        .duo-login-btn.loading {
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
          background: #ff4b4b;
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
          color: #777;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.4;
          animation: fadeInDelay 0.6s ease 0.8s both;
        }
        
        .duo-login-link {
          color: #1cb0f6;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .duo-login-link:hover {
          color: #0c8ce8;
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
        
        @media (max-width: 480px) {
          .duo-login-card {
            padding: 32px 24px 24px;
            border-radius: 20px;
            margin: 20px;
          }
          
          .duo-login-logo {
            width: 64px;
            height: 64px;
          }
          
          .duo-login-title {
            font-size: 28px;
          }
          
          .duo-login-input,
          .duo-login-btn {
            font-size: 16px;
            padding: 14px 16px;
          }
          
          .duo-login-input {
            padding-left: 48px;
          }
          
          .duo-mascot-speech-bubble {
            font-size: 13px;
            padding: 10px 16px;
          }
        }
        
        @media (max-width: 360px) {
          .duo-login-card {
            padding: 24px 16px 16px;
            margin: 16px;
          }
          
          .duo-login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 