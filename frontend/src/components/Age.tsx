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
    <div className="age-verification-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #f5fff0 100%)',
      fontFamily: '"Nunito Sans", Arial, sans-serif',
      padding: '1rem',
    }}>
      <motion.div
        className="age-verification-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(31, 102, 124, 0.1)',
          padding: '2.5rem 2rem',
          position: 'relative',
        }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Header with avatar */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          {avatarUrl ? (
            <motion.img
              className="age-verification-avatar"
              src={avatarUrl}
              alt="Selected Avatar"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '1rem',
                boxShadow: '0 8px 16px rgba(88, 204, 2, 0.15)',
                border: '3px solid #58cc02',
                background: '#e3f9ed',
                display: 'inline-block',
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            />
          ) : (
            <motion.div
              className="age-verification-avatar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e3f9ed 0%, #f0f9ff 100%)',
                marginBottom: '1rem',
                boxShadow: '0 8px 16px rgba(88, 204, 2, 0.15)'
              }}
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <span className="material-icons" style={{
                fontSize: '42px',
                color: '#58cc02',
              }}>person</span>
            </motion.div>
          )}
          <h2 className="age-verification-title" style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--text-light, #e0e7ff)'
          }}>
            Age Verification
          </h2>
          <p style={{
           margin: '0.5rem 0 0',
           opacity: 0.9,
           fontSize: '0.875rem',
           color: 'var(--text-dark, #222)'
          }}>
            We need to confirm your age to provide an appropriate experience
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }} autoComplete="off" aria-label="Age Verification Form">
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="age" style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#444',
              marginBottom: '0.5rem',
              marginLeft: '0.25rem'
            }}>
              Your Age
            </label>
            
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
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: error ? '2px solid #ff4d4f' : success ? '2px solid #58cc02' : '2px solid #e5e5e5',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#222',
                transition: 'all 0.2s ease',
                outline: error ? '2px solid #ff4d4f' : success ? '2px solid #58cc02' : 'none',
                background: '#f9fdf7',
                textAlign: 'center',
                boxSizing: 'border-box',
                appearance: 'textfield',
              }}
              min="13"
              max="120"
              disabled={loading || success}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'age-error' : undefined}
            />
          </div>

          {error && (
            <motion.div
              id="age-error"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                color: '#ff4d4f',
                fontWeight: 600,
                marginBottom: '1.25rem',
                fontSize: '0.95rem',
                background: '#fff2f0',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid #ffccc7',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-icons" style={{ fontSize: '1.1rem' }}>error_outline</span>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                color: '#22c55e',
                fontWeight: 600,
                marginBottom: '1.25rem',
                fontSize: '0.95rem',
                background: '#f0fdf4',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-icons" style={{ fontSize: '1.1rem' }}>check_circle</span>
              Age verified!
            </motion.div>
          )}

          <motion.button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: loading ? '#e2e8f0' : success ? '#22c55e' : '#58cc02',
              color: loading ? '#94a3b8' : '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading || success ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: loading || success ? 'none' : '0 4px 0 #3caa3c',
              transition: 'all 0.2s',
              gap: '0.5rem',
              opacity: loading || success ? 0.7 : 1,
            }}
            whileHover={!loading && !success ? { scale: 1.02 } : {}}
            whileTap={!loading && !success ? { scale: 0.98 } : {}}
            disabled={loading || success}
            aria-disabled={loading || success}
          >
            {loading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite'
                }} />
                Verifying...
              </>
            ) : success ? (
              <>
                <span className="material-icons" style={{ fontSize: '1.1rem' }}>check_circle</span>
                Verified
              </>
            ) : (
              'Continue'
            )}
          </motion.button>
        </form>

      
      </motion.div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .age-verification-container {
            padding: 0.5rem !important;
          }
          .age-verification-card {
            padding: 1.25rem 0.5rem !important;
            max-width: 98vw !important;
          }
          .age-verification-avatar {
            width: 60px !important;
            height: 60px !important;
          }
          .age-verification-title {
            font-size: 1.15rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgeVerification;