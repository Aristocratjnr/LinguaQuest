import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AgeVerification: React.FC<{ onConfirm?: (age: number) => void }> = ({ onConfirm }) => {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const num = Number(age);
    
    if (!age) {
      setError('Please enter your age to continue');
      return;
    }
    if (!/^\d+$/.test(age)) {
      setError('Please enter a valid number');
      return;
    }
    if (isNaN(num)) {
      setError('Please enter a valid number');
      return;
    }
    if (num < 13) {
      setError('You must be at least 13 years old');
      return;
    }
    if (num > 120) {
      setError('Please enter a realistic age');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (onConfirm) onConfirm(num);
    }, 800);
  };

  // Get selected avatar from localStorage
  const avatarUrl = typeof window !== 'undefined' ? localStorage.getItem('lq_avatar') : null;

  return (
    <div className="duo-age-bg">
      <div className="duo-decorative-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <motion.div
        className="duo-age-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header with mascot */}
        <div className="duo-age-header">
          <motion.div
            className="duo-mascot-section"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            {avatarUrl ? (
              <div className="duo-avatar-container">
                <img
                  src={avatarUrl}
                  alt="Your Avatar"
                  className="duo-avatar-img"
                />
                <div className="duo-avatar-ring"></div>
              </div>
            ) : (
              <div className="duo-default-avatar">
                <span className="material-icons">person</span>
              </div>
            )}
            
            <div className="duo-speech-bubble">
              <div className="speech-text">How old are you?</div>
            </div>
          </motion.div>

          <div className="duo-age-content">
            <h1 className="duo-age-title">Let's get to know you!</h1>
            <p className="duo-age-subtitle">
              We need your age to create the perfect learning experience
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.form 
          className="duo-age-form"
          onSubmit={handleSubmit} 
          autoComplete="off" 
          aria-label="Age Input Form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="duo-input-section">
            <label htmlFor="age" className="duo-input-label">
              Your age
            </label>
            
            <div className="duo-input-wrapper">
              <span className="material-icons duo-input-icon">cake</span>
              <input
                id="age"
                type="number"
                value={age}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val === '' || (Number(val) >= 0 && Number(val) <= 120)) {
                    setAge(val.replace(/^0+/, ''));
                    setError('');
                    setSuccess(false);
                  }
                }}
                placeholder="Enter your age"
                className={`duo-age-input ${error ? 'error' : ''} ${success ? 'success' : ''}`}
                min="13"
                max="120"
                disabled={loading || success}
                autoFocus
                aria-invalid={!!error}
                aria-describedby={error ? 'age-error' : undefined}
              />
            </div>
          </div>

          {error && (
            <motion.div
              id="age-error"
              role="alert"
              className="duo-error-message"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="material-icons">error_outline</span>
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              className="duo-success-message"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="material-icons">check_circle</span>
              <span>Perfect! You're all set</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            className={`duo-continue-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''} ${!age.trim() ? 'disabled' : ''}`}
            disabled={loading || success || !age.trim()}
            whileHover={!loading && !success && age.trim() ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading && !success && age.trim() ? { scale: 0.98 } : {}}
          >
            <span className="btn-content">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Verifying...</span>
                </>
              ) : success ? (
                <>
                  <span className="material-icons">check_circle</span>
                  <span>Verified!</span>
                </>
              ) : (
                <>
                  <span>CONTINUE</span>
                  <span className="material-icons">arrow_forward</span>
                </>
              )}
            </span>
          </motion.button>
        </motion.form>

      
      </motion.div>

      <style>{`
        .duo-age-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #ffffff, #ffffff); /* All white */
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
        }

        .duo-decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: floatAnimation 8s ease-in-out infinite;
        }

        .shape-1 {
          width: 120px;
          height: 120px;
          top: 15%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 80px;
          height: 80px;
          top: 70%;
          right: 15%;
          animation-delay: 3s;
        }

        .shape-3 {
          width: 60px;
          height: 60px;
          top: 40%;
          right: 8%;
          animation-delay: 6s;
        }

        .duo-age-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 440px;
          width: 100%;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .duo-age-header {
          padding: 40px 32px 32px;
          text-align: center;
          background: #ffffff;
        }

        .duo-mascot-section {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .duo-avatar-container {
          position: relative;
          margin-bottom: 16px;
        }

        .duo-avatar-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #58cc02;
          background: #f7fcf3;
          animation: gentle-bounce 3s ease-in-out infinite;
        }

        .duo-avatar-ring {
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px solid rgba(88, 204, 2, 0.3);
          border-radius: 50%;
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .duo-default-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #58cc02, #89e219);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
          animation: gentle-bounce 3s ease-in-out infinite;
        }

        .duo-default-avatar .material-icons {
          font-size: 40px;
          color: white;
        }

        .duo-speech-bubble {
          position: relative;
          background: #f8fafc;
          border-radius: 20px;
          padding: 12px 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          animation: fadeInUp 0.6s ease 0.8s both;
        }

        .duo-speech-bubble::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid #f8fafc;
        }

        .speech-text {
          font-size: 14px;
          color: #4b4b4b;
          font-weight: 600;
        }

        .duo-age-content {
          animation: fadeInUp 0.6s ease 0.4s both;
        }

        .duo-age-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #3c3c3c;
          letter-spacing: -0.5px;
        }

        .duo-age-subtitle {
          font-size: 16px;
          color: #777;
          margin: 0;
          line-height: 1.4;
        }

        .duo-age-form {
          padding: 0 32px 32px;
        }

        .duo-input-section {
          margin-bottom: 20px;
        }

        .duo-input-label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #4b4b4b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .duo-input-wrapper {
          position: relative;
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

        .duo-age-input {
          width: 100%;
          padding: 16px 16px 16px 52px;
          border: 2px solid #e5e5e5;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          background: #fafafa;
          color: #3c3c3c;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          text-align: center;
          appearance: textfield;
        }

        .duo-age-input::-webkit-outer-spin-button,
        .duo-age-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .duo-age-input:focus {
          border-color: #58cc02;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(88, 204, 2, 0.1);
        }

        .duo-age-input:focus + .duo-input-icon,
        .duo-age-input:not(:placeholder-shown) + .duo-input-icon {
          color: #58cc02;
        }

        .duo-age-input.error {
          border-color: #ff4b4b;
          background: #fff8f8;
          box-shadow: 0 0 0 4px rgba(255, 75, 75, 0.1);
        }

        .duo-age-input.success {
          border-color: #58cc02;
          background: #f7fcf3;
          box-shadow: 0 0 0 4px rgba(88, 204, 2, 0.1);
        }

        .duo-error-message {
          background: #ff4b4b;
          color: white;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(255, 75, 75, 0.3);
        }

        .duo-success-message {
          background: #58cc02;
          color: white;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(88, 204, 2, 0.3);
        }

        .duo-continue-btn {
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

        .duo-continue-btn:hover:not(.disabled):not(.loading):not(.success) {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #46a302, 0 12px 35px rgba(88, 204, 2, 0.4);
        }

        .duo-continue-btn:active:not(.disabled):not(.loading):not(.success) {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #46a302, 0 4px 15px rgba(88, 204, 2, 0.2);
        }

        .duo-continue-btn.disabled {
          background: #e5e5e5;
          color: #afafaf;
          cursor: not-allowed;
          box-shadow: 0 4px 0 #d0d0d0;
          transform: none;
        }

        .duo-continue-btn.loading {
          pointer-events: none;
          background: #89e219;
        }

        .duo-continue-btn.success {
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
          box-shadow: 0 4px 0 #15803d;
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

        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .duo-age-bg {
            padding: 0;
          }
          
          .duo-age-card {
            border-radius: 0;
            width: 100vw;
            max-width: 100vw;
            min-height: 100vh;
            margin: 0;
            padding: 24px 16px;
          }
          
          .duo-age-header {
            padding: 24px 16px 16px;
          }
          
          .duo-age-form {
            padding: 0 16px 16px;
          }
          
          .duo-avatar-img,
          .duo-default-avatar {
            width: 72px;
            height: 72px;
          }
          
          .duo-default-avatar .material-icons {
            font-size: 32px;
          }
          
          .duo-age-title {
            font-size: 24px;
            margin-top: 8px;
          }
          
          .duo-age-subtitle {
            font-size: 16px;
            margin-bottom: 24px;
          }
          
          .duo-age-input {
            font-size: 16px;
            padding: 16px 16px 16px 48px;
            border-radius: 12px;
            min-height: 48px;
          }
          
          .duo-input-label {
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .duo-continue-btn {
            font-size: 16px;
            padding: 16px;
            border-radius: 12px;
            min-height: 48px;
            margin-top: 8px;
          }
          
          /* Stepper adjustments */
          .logic-flow-stepper {
            margin: 0 0 24px;
          }
        }

        @media (max-width: 360px) {
          .duo-age-header {
            padding: 24px 16px 16px;
          }
          
          .duo-age-form {
            padding: 0 16px 16px;
          }
          
          .duo-age-title {
            font-size: 20px;
          }
          
          .duo-age-subtitle {
            font-size: 14px;
          }
          
          .duo-age-input {
            font-size: 16px; /* Increased from 14px to prevent mobile zoom */
            padding: 14px 14px 14px 44px;
          }
          
          .duo-input-label {
            font-size: 14px;
          }
          
          .duo-continue-btn {
            font-size: 14px;
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default AgeVerification;