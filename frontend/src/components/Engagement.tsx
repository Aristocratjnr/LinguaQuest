import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const quotes = [
  '"Learning another language is like becoming another person." — Haruki Murakami',
  '"The limits of my language mean the limits of my world." — Ludwig Wittgenstein',
  '"Practice makes perfect. Keep going!"',
  '"Every day is a new chance to improve your skills."',
  '"Mistakes are proof that you are trying."',
];

const tips = [
  'Use persuasive arguments to convince the AI! 💡',
  'Try different tones: polite, passionate, formal, or casual.',
  'Switch languages to challenge yourself.',
  'Check the leaderboard to see how you rank!',
  'Collect badges for creative and high-scoring arguments.',
];

const Engagement: React.FC<{ nickname: string; avatar?: string; onStart: () => void }> = ({ 
  nickname, 
  avatar, 
  onStart 
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [streak, setStreak] = useState<number | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    setLoadingStats(true);
    Promise.all([
      axios.get(`http://127.0.0.1:8000/streak?nickname=${encodeURIComponent(nickname)}`),
      axios.get(`http://127.0.0.1:8000/stats/${encodeURIComponent(nickname)}`)
    ])
      .then(([streakRes, statsRes]) => {
        setStreak(streakRes.data.streak);
        setXp(statsRes.data.total_score);
      })
      .catch(() => {
        setStreak(0);
        setXp(0);
      })
      .finally(() => setLoadingStats(false));
  }, [nickname]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive breakpoints
  const isLargeDesktop = windowSize.width >= 1200;
  const isDesktop = windowSize.width >= 992;
  const isTablet = windowSize.width >= 768;
  const isMobile = windowSize.width < 768;
  const isSmallMobile = windowSize.width < 400;

  // Auto-rotate quotes and tips
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(tipInterval);
    };
  }, []);

  // Calculate dynamic card width
  const cardWidth = Math.min(
    windowSize.width * (isLargeDesktop ? 0.45 : isDesktop ? 0.55 : isTablet ? 0.7 : 0.85),
    600, // Reduced max width from 800 to 600
    Math.max(280, windowSize.width - 40) // Reduced minimum from 300 to 280
  );

  // Calculate dynamic font sizes
  const getFontSize = (mobileSize: number, tabletSize: number, desktopSize: number) => {
    if (isSmallMobile) return `${mobileSize * 0.9}px`;
    if (isMobile) return `${mobileSize}px`;
    if (isTablet) return `${tabletSize}px`;
    return `${desktopSize}px`;
  };

  // Calculate dynamic spacing
  const getSpacing = (mobileSize: number, tabletSize: number, desktopSize: number) => {
    if (isSmallMobile) return `${mobileSize * 0.8}px`;
    if (isMobile) return `${mobileSize}px`;
    if (isTablet) return `${tabletSize}px`;
    return `${desktopSize}px`;
  };

  return (
    <div className="engagement-container" style={{
      minHeight: '100vh',
      background: 'var(--duo-bg, linear-gradient(135deg, #58cc02 0%, #4CAF50 100%))',
      padding: getSpacing(16, 20, 24),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      color: 'var(--text-dark, #222)'
    }}>
      <motion.div 
        className="engagement-card"
        style={{
          width: `${cardWidth}px`,
          background: 'var(--duo-card, #fff)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          color: 'inherit'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
       {/* Header with mascot - Updated Avatar Section */}
<div style={{
  background: '#ffffff',
  padding: getSpacing(12, 16, 24),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  textAlign: 'center',
  overflow: 'visible' // Ensure avatar isn't clipped
}}>
  

  {/* Avatar Container - Centered between welcome and nickname */}
  <motion.div
    style={{
      width: isSmallMobile ? '80px' : '100px',
      height: isSmallMobile ? '80px' : '100px',
      background: 'var(--duo-card, #fff)',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      marginBottom: getSpacing(16, 20, 24)
    }}
    whileHover={{ rotate: 10 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    {avatar ? (
      <img
        src={avatar}
        alt="User Avatar"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid #ffd700',
          boxSizing: 'border-box' // Ensure border is included in dimensions
        }}
      />
    ) : (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#ffd700',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: isSmallMobile ? '32px' : '40px'
      }}>
        🦉
      </div>
    )}
  </motion.div>
  
  {/* Nickname and subtitle below avatar */}
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  }}>
    <h1 style={{
      color: '#1cb0f6',
      fontWeight: 900,
      marginBottom: '12px',
      fontSize: getFontSize(18, 22, 26),
      letterSpacing: '-0.5px',
      lineHeight: '1.2',
      textShadow: '0 2px 8px rgba(28,176,246,0.10)'
    }}>
       WELCOME, {nickname.toUpperCase()}!
    </h1>
    <p style={{
      color: '#222',
      fontWeight: 600,
      marginBottom: '0',
      fontSize: getFontSize(12, 14, 16),
      lineHeight: '1.3'
    }}>
      READY FOR YOUR LANGUAGE CHALLENGE?
    </p>
  </div>
</div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: getSpacing(12, 16, 24),
            background: '#f9f9f9',
            borderBottom: '1px solid #eee',
            gap: '8px'
          }}
        >
          {/* Streak Card */}
          <motion.div
            key={streak}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            style={{ 
              textAlign: 'center',
              flex: 1,
              minWidth: '120px'
            }}
          >
            <motion.div 
              style={{
                background: '#ffd700',
                width: getSpacing(36, 40, 50),
                height: getSpacing(36, 40, 50),
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 8px',
                fontSize: getFontSize(16, 18, 20)
              }}
              animate={{
                scale: loadingStats ? 1 : [1, 1.12, 1],
                boxShadow: loadingStats ? 'none' : ['0 0 0 0 #ffd70055', '0 0 0 12px #ffd70022', '0 0 0 0 #ffd70055']
              }}
              transition={{
                duration: 1.2,
                repeat: loadingStats ? 0 : Infinity,
                repeatType: 'loop',
                ease: 'easeInOut'
              }}
            >
              🔥
            </motion.div>
            <motion.div
              key={streak}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                fontWeight: 'bold',
                color: '#3caa3c',
                fontSize: getFontSize(14, 16, 18),
                lineHeight: '1.2'
              }}
            >
              {loadingStats ? '...' : streak}
            </motion.div>
            <div style={{
              color: '#222',
              fontSize: getFontSize(10, 11, 12),
              letterSpacing: '0.5px',
              fontWeight: 600
            }}>
              DAY STREAK
            </div>
          </motion.div>
          {/* XP Card */}
          <motion.div
            key={xp}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            style={{ 
              textAlign: 'center',
              flex: 1,
              minWidth: '120px'
            }}
          >
            <motion.div 
              style={{
                background: '#1cb0f6',
                width: getSpacing(36, 40, 50),
                height: getSpacing(36, 40, 50),
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 8px',
                fontSize: getFontSize(16, 18, 20)
              }}
              animate={{
                scale: loadingStats ? 1 : [1, 1.12, 1],
                boxShadow: loadingStats ? 'none' : ['0 0 0 0 #1cb0f655', '0 0 0 12px #1cb0f622', '0 0 0 0 #1cb0f655']
              }}
              transition={{
                duration: 1.2,
                repeat: loadingStats ? 0 : Infinity,
                repeatType: 'loop',
                ease: 'easeInOut'
              }}
            >
              ⚡
            </motion.div>
            <motion.div
              key={xp}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                fontWeight: 'bold',
                color: '#3caa3c',
                fontSize: getFontSize(14, 16, 18),
                lineHeight: '1.2'
              }}
            >
              {loadingStats ? '...' : xp}
            </motion.div>
            <div style={{
              color: '#222',
              fontSize: getFontSize(10, 11, 12),
              letterSpacing: '0.5px',
              fontWeight: 600
            }}>
              TOTAL XP
            </div>
          </motion.div>
        </motion.div>

        {/* Daily motivation */}
        <div style={{
          padding: getSpacing(12, 16, 24),
          borderBottom: '1px solid #eee',
          background: 'white',
          minHeight: isSmallMobile ? '70px' : isMobile ? '80px' : '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            color: '#58cc02',
            fontWeight: 'bold',
            fontSize: getFontSize(11, 12, 14),
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            DAILY MOTIVATION
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#555',
                fontSize: getFontSize(13, 14, 16),
                lineHeight: '1.4'
              }}
            >
              {quotes[quoteIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tips carousel */}
        <div style={{
          padding: getSpacing(12, 16, 24),
          background: '#f9f9f9',
          minHeight: isSmallMobile ? '90px' : isMobile ? '100px' : '120px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: getSpacing(8, 10, 12)
          }}>
            <div style={{
              color: '#1cb0f6',
              fontWeight: 'bold',
              fontSize: getFontSize(11, 12, 14),
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              QUICK TIPS
            </div>
            <div style={{ display: 'flex' }}>
              <motion.button 
                onClick={() => setTipIndex((i) => (i - 1 + tips.length) % tips.length)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: getFontSize(18, 20, 22),
                  color: '#1cb0f6',
                  marginRight: '8px'
                }}
                whileTap={{ scale: 0.9 }}
              >
                ‹
              </motion.button>
              <motion.button 
                onClick={() => setTipIndex((i) => (i + 1) % tips.length)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: getFontSize(18, 20, 22),
                  color: '#1cb0f6'
                }}
                whileTap={{ scale: 0.9 }}
              >
                ›
              </motion.button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: getSpacing(10, 12, 16),
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                minHeight: isSmallMobile ? '60px' : isMobile ? '70px' : '80px',
                display: 'flex',
                alignItems: 'center',
                color: '#333',
                fontSize: getFontSize(13, 14, 15),
                lineHeight: '1.4'
              }}
            >
              {tips[tipIndex]}
            </motion.div>
          </AnimatePresence>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: getSpacing(12, 14, 16),
            gap: '8px'
          }}>
            {tips.map((_, i) => (
              <motion.div 
                key={i}
                onClick={() => setTipIndex(i)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i === tipIndex ? '#58cc02' : '#ccc',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </div>

        {/* Start button */}
        <div style={{
          padding: getSpacing(12, 16, 24),
          background: 'white',
          textAlign: 'center'
        }}>
          <motion.button
            onClick={onStart}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: '0 6px 0 #3caa3c',
              transition: { type: 'spring', stiffness: 400 }
            }}
            whileTap={{ 
              scale: 0.98, 
              boxShadow: '0 2px 0 #3caa3c',
              transition: { duration: 0.1 }
            }}
            style={{
              background: '#58cc02',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: isSmallMobile ? '12px 16px' : isMobile ? '14px 20px' : '16px 32px',
              fontSize: getFontSize(14, 16, 18),
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              maxWidth: isDesktop ? '400px' : '300px',
              boxShadow: '0 4px 0 #3caa3c',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: '"JetBrains Mono", "Courier New", monospace'
            }}
          >
            START PRACTICE
          </motion.button>
          
          <div style={{
            marginTop: getSpacing(8, 10, 12),
            color: '#666',
            fontSize: getFontSize(10, 11, 12),
            letterSpacing: '0.5px'
          }}>
            DAILY GOAL: 20 XP • 5 LESSONS
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Engagement;