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
      <div className="duo-login-card" style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 32px 0 rgba(88,204,2,0.13), 0 2px 8px #58cc0222',
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        width: '100%',
        minWidth: 0,
        textAlign: 'center',
        border: '3px solid #58cc02',
        fontFamily: 'Nunito, Quicksand, Readex Pro, Segoe UI, Arial Rounded MT Bold, Arial, sans-serif',
        animation: 'fadeInLogin 0.7s cubic-bezier(.4,0,.2,1)',
        maxWidth: 440,
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <img src={logo} alt="LinguaQuest Mascot" className="duo-login-logo" style={{ width: 70, height: 70, borderRadius: '50%', marginBottom: 18, boxShadow: '0 2px 8px #58cc0222', background: '#f7fcf3' }} />
        <h2 className="duo-login-title" style={{ fontFamily: 'Readex Pro, Nunito, Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 900, marginBottom: 8, marginTop: 0 }}>Sign In</h2>
        <div className="duo-login-subtitle" style={{ fontFamily: 'Nunito, Quicksand, Readex Pro, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 300, marginBottom: 28, marginTop: 0, lineHeight: 1.4, maxWidth: 340 }}>
          Welcome back! Enter your nickname to continue your language quest.
        </div>
        <div style={{ width: '100%', maxWidth: 340, margin: '0 auto 0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ position: 'relative', marginBottom: 0 }}>
            <span className="material-icons" style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#58cc02',
              fontSize: 24,
              pointerEvents: 'none',
              opacity: 0.85
            }}>person</span>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="duo-login-input"
              style={{
                fontFamily: 'Nunito, Quicksand, Readex Pro, Arial Rounded MT Bold, Arial, sans-serif',
                paddingLeft: 44,
                fontWeight: 300,
                marginBottom: 0,
              }}
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter' && nickname.trim()) handleLogin(); }}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !nickname.trim()}
            className="duo-login-btn"
            style={{ fontFamily: 'Readex Pro, Nunito, Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, marginBottom: 0 }}
          >
            <span className="material-icons" style={{ fontSize: 22, verticalAlign: 'middle' }}>arrow_forward</span>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        {error && <div className="duo-login-error" style={{ fontFamily: 'Nunito, Quicksand, Readex Pro, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 300, marginTop: 18, marginBottom: 0 }}>{error}</div>}
        <div className="duo-login-footer" style={{ fontFamily: 'Nunito, Quicksand, Readex Pro, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 300, marginTop: 'auto', marginBottom: 0, paddingTop: 32, width: '100%', maxWidth: 340 }}>
          Don&apos;t have a profile? <span className="duo-login-link" style={{ fontFamily: 'Readex Pro, Nunito, Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 300 }}>Ask an admin to create one for you.</span>
        </div>
      </div>
      <style>{`
        .duo-login-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #f7fcf3 0%, #e9fbe5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow-x: hidden;
        }
        .duo-login-card {
          background: #fff;
          border-radius: 2rem;
          box-shadow: 0 8px 32px 0 rgba(88,204,2,0.13), 0 2px 8px #58cc0222;
          padding: 2.7rem 2.2rem 2.2rem 2.2rem;
          max-width: 410px;
          width: 100%;
          min-width: 0;
          text-align: center;
          border: 3px solid #58cc02;
          font-family: 'JetBrains Mono', 'Nunito', 'Quicksand', 'Segoe UI', 'Arial Rounded MT Bold', Arial, sans-serif;
          animation: fadeInLogin 0.7s cubic-bezier(.4,0,.2,1);
          max-width: 95vw;
          position: relative;
          box-sizing: border-box;
        }
        .duo-login-logo {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin-bottom: 14px;
          box-shadow: 0 2px 8px #58cc0222;
          background: #f7fcf3;
        }
        .duo-login-title {
          color: #58cc02;
          font-weight: 900;
          margin-bottom: 10px;
          font-size: 2.1rem;
          letter-spacing: -0.01em;
        }
        .duo-login-subtitle {
          color: #6c757d;
          margin-bottom: 30px;
          font-size: 1.13rem;
          font-weight: 300;
        }
        .duo-login-input {
          padding: 1.15rem;
          border-radius: 1.1rem;
          border: 2px solid #e5e5e5;
          font-size: 1.13rem;
          margin-bottom: 0;
          width: 100%;
          max-width: 340px;
          min-width: 0;
          outline: none;
          background: rgba(247,252,243,0.7);
          font-weight: 300;
          color: #222;
          box-shadow: 0 1px 4px rgba(88,204,2,0.04);
          transition: border 0.2s, box-shadow 0.2s;
        }
        .duo-login-input:focus {
          border: 2px solid #58cc02;
          box-shadow: 0 2px 8px #58cc0222;
        }
        .duo-login-btn {
          background: #58cc02;
          color: white;
          border: none;
          border-radius: 1.2rem;
          padding: 1.1rem 0;
          font-size: 1.18rem;
          font-weight: 300;
          cursor: pointer;
          box-shadow: 0 4px 0 #58cc0222;
          transition: all 0.2s;
          width: 100%;
          margin-bottom: 12px;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 2px #58cc0222;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .duo-login-btn:disabled {
          background: #b7e7a7;
          cursor: not-allowed;
        }
        .duo-login-error {
          color: #ff6b6b;
          margin-top: 10px;
          font-weight: 300;
          font-size: 1.05rem;
        }
        .duo-login-footer {
          color: #6c757d;
          margin-top: 30px;
          font-size: 1.08rem;
          font-weight: 300;
        }
        .duo-login-link {
          color: #1cb0f6;
          font-weight: 300;
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
        @keyframes fadeInLogin {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .duo-login-card {
            padding: 1.1rem 0.3rem 1.1rem 0.3rem !important;
            border-radius: 1.1rem !important;
            max-width: 99vw !important;
          }
          .duo-login-logo {
            width: 38px !important;
            height: 38px !important;
            margin-bottom: 6px !important;
          }
          .duo-login-title {
            font-size: 1.1rem !important;
          }
          .duo-login-input, .duo-login-btn {
            font-size: 0.97rem !important;
            padding: 0.7rem 0.4rem !important;
            border-radius: 0.7rem !important;
          }
          .duo-login-btn {
            gap: 4px !important;
          }
          .duo-login-footer {
            font-size: 0.93rem !important;
            margin-top: 14px !important;
          }
          .material-icons {
            font-size: 18px !important;
          }
        }
        @media (max-width: 400px) {
          .duo-login-card {
            padding: 0.5rem 0.1rem 0.5rem 0.1rem !important;
            border-radius: 0.7rem !important;
            max-width: 100vw !important;
          }
          .duo-login-title {
            font-size: 0.9rem !important;
          }
          .duo-login-input, .duo-login-btn {
            font-size: 0.85rem !important;
            padding: 0.5rem 0.2rem !important;
            border-radius: 0.5rem !important;
          }
          .duo-login-btn {
            gap: 2px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 