import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AgeVerification: React.FC<{ onConfirm?: (age: number) => void }> = ({ onConfirm }) => {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = Number(age);
    
    if (!age) {
      setError('Please enter your age to continue');
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
      if (onConfirm) onConfirm(num);
    }, 800);
  };

  // Get selected avatar from localStorage
  const avatarUrl = typeof window !== 'undefined' ? localStorage.getItem('lq_avatar') : null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #f5fff0 100%)',
      fontFamily: '"Nunito Sans", Arial, sans-serif',
      padding: '1rem',
    }}>
      <motion.div
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
          <h2 style={{
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
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
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
                  setAge(val);
                }
              }}
              placeholder="Enter your age"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '2px solid #e5e5e5',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#222',
                transition: 'all 0.2s ease',
                outline: 'none',
                background: '#f9fdf7',
                textAlign: 'center',
                boxSizing: 'border-box',
                appearance: 'textfield',
              }}
              min="13"
              max="120"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <motion.div
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

          <motion.button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: loading ? '#e2e8f0' : '#58cc02',
              color: loading ? '#94a3b8' : '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: loading ? 'none' : '0 4px 0 #3caa3c',
              transition: 'all 0.2s',
              gap: '0.5rem',
            }}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            disabled={loading}
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
      `}</style>
    </div>
  );
};

export default AgeVerification;