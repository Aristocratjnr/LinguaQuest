import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/logo.png';

interface WelcomePageProps {
  onGetStarted: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const slides = [
    {
      title: "Welcome to LinguaQuest!",
      description: "Embark on a fun journey to master languages through interactive conversations",
      icon: "explore",
      color: "#FFFFF",
      character: "👋"
    },
    {
      title: "Real Conversations",
      description: "Persuade AI characters in various scenarios using your target language.",
      icon: "chat",
      color: "#1CB0F6",
      character: "💬"
    },
    {
      title: "Track Your Progress",
      description: "Earn points, maintain daily streaks, collect badges, and climb the leaderboard as you improve.",
      icon: "trending_up",
      color: "#FFC800",
      character: "🔥"
    },
    {
      title: "Ready to Start?",
      description: "Create your profile and begin your language adventure today!",
      icon: "rocket_launch",
      color: "#FF9600",
      character: "🚀"
    }
  ];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 30,
        scale: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide(prev => Math.max(0, Math.min(slides.length - 1, prev + newDirection)));
  };

  return (
    <div className="duo-welcome-bg">
      <div className="duo-bg-decorations">
        <div className="decoration-orb orb-1"></div>
        <div className="decoration-orb orb-2"></div>
        <div className="decoration-orb orb-3"></div>
        <div className="decoration-orb orb-4"></div>
      </div>
      
      <motion.div 
        className="duo-welcome-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          delay: 0.1
        }}
      >
        {/* Logo Header */}
        <div className="duo-welcome-header">
          <motion.div 
            className="duo-logo-container"
            initial={{ scale: 0.8, rotate: -15 }}
            animate={{ 
              scale: 1, 
              rotate: 0
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 15,
              delay: 0.3
            }}
          >
          </motion.div>
          
          <motion.div
            className="duo-welcome-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
           
          </motion.div>
        </div>
        
        {/* Slide Content */}
        <div className="duo-slide-container">
          {/* Slider */}
          <div className="duo-slider-wrapper">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="duo-slide-content"
              >
                <motion.div 
                  className="duo-slide-icon"
                  style={{ 
                    background: `linear-gradient(135deg, ${slides[currentSlide].color}20, ${slides[currentSlide].color}10)`,
                    border: `3px solid ${slides[currentSlide].color}30`,
                    boxShadow: `0 8px 24px ${slides[currentSlide].color}20`
                  }}
                  initial={{ scale: 0.8, rotate: -15 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0
                  }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1
                  }}
                >
                  <span style={{
                    fontSize: 'clamp(28px, 7vw, 42px)',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center'
                  }}>
                    {slides[currentSlide].character}
                  </span>
                </motion.div>
                
                <motion.h2 
                  className="duo-slide-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {slides[currentSlide].title}
                </motion.h2>
                
                <motion.p 
                  className="duo-slide-description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Get Started Button - Only show on the last slide */}
          {currentSlide === slides.length - 1 && (
            <motion.div
              className="duo-cta-section"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              <motion.button
                className="duo-get-started-btn"
                onClick={onGetStarted}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="btn-text">START YOUR QUEST</span>
                <span className="material-icons">rocket_launch</span>
                <div className="btn-shine"></div>
              </motion.button>
            </motion.div>
          )}
          
          {/* Navigation Dots */}
          <div className="duo-dots-container">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className={`duo-nav-dot ${currentSlide === index ? 'active' : ''}`}
                style={{ 
                  background: currentSlide === index ? slide.color : 'var(--lq-text-muted)'
                }}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="duo-nav-buttons">
            <motion.button 
              className={`duo-nav-btn prev ${currentSlide === 0 ? 'hidden' : ''}`}
              onClick={() => paginate(-1)}
              disabled={currentSlide === 0}
              whileHover={currentSlide !== 0 ? { scale: 1.02, y: -1 } : {}}
              whileTap={currentSlide !== 0 ? { scale: 0.98 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="material-icons">arrow_back</span>
              <span>BACK</span>
            </motion.button>
            
            {currentSlide < slides.length - 1 ? (
              <motion.button 
                className="duo-nav-btn next"
                onClick={() => paginate(1)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span>NEXT</span>
                <span className="material-icons">arrow_forward</span>
              </motion.button>
            ) : (
              <div className="nav-spacer" />
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="duo-welcome-footer">
          <motion.span 
            className="duo-copyright"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            &copy; 2025 LinguaQuest
          </motion.span>
          <motion.button 
            className="duo-skip-btn"
            onClick={() => {
              setDirection(1);
              setCurrentSlide(slides.length - 1);
            }}
            whileHover={{ scale: 1.05, color: 'var(--lq-text-main)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            SKIP TOUR
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .duo-welcome-bg {
          min-height: 100vh;
          width: 100vw;
          background: var(--duo-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: clamp(12px, 3vw, 20px);
        }

        .duo-bg-decorations {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .decoration-orb {
          position: absolute;
          background: var(--duo-card);
          border-radius: 50%;
          animation: orbFloat 12s ease-in-out infinite;
        }

        .orb-1 {
          width: 150px;
          height: 150px;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 100px;
          height: 100px;
          top: 60%;
          right: 10%;
          animation-delay: 3s;
        }

        .orb-3 {
          width: 80px;
          height: 80px;
          top: 30%;
          right: 20%;
          animation-delay: 6s;
        }

        .orb-4 {
          width: 120px;
          height: 120px;
          bottom: 10%;
          left: 15%;
          animation-delay: 9s;
        }

        .duo-welcome-card {
          background: var(--duo-card);
          border-radius: clamp(16px, 4vw, 24px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 440px;
          width: 100%;
          position: relative;
          z-index: 1;
          overflow: hidden;
          min-height: clamp(500px, 80vh, 700px);
          display: flex;
          flex-direction: column;
        }

        .duo-welcome-header {
          background: var(--duo-header);
          padding: clamp(24px, 6vw, 48px) clamp(16px, 4vw, 32px) clamp(16px, 4vw, 24px);
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .duo-logo-circle {
          width: clamp(64px, 16vw, 80px);
          height: clamp(64px, 16vw, 80px);
          background: var(--duo-card);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          backdrop-filter: blur(10px);
          border: 3px solid var(--lq-border);
          animation: logoGlow 3s ease-in-out infinite;
        }

        .duo-logo-img {
          width: clamp(36px, 9vw, 48px);
          height: clamp(36px, 9vw, 48px);
          object-fit: contain;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .duo-welcome-text {
          position: relative;
          z-index: 2;
        }

        .duo-welcome-title {
          font-size: clamp(20px, 6vw, 32px);
          font-weight: 800;
          margin: 0 0 clamp(4px, 2vw, 8px) 0;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .duo-welcome-tagline {
          font-size: clamp(14px, 3.5vw, 16px);
          margin: 0;
          opacity: 0.9;
          font-weight: 400;
          line-height: 1.4;
        }

        .duo-slide-container {
          padding: clamp(16px, 4vw, 32px);
          background: var(--duo-card);
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .duo-slider-wrapper {
          position: relative;
          min-height: clamp(200px, 50vw, 280px);
          overflow: hidden;
          flex: 1;
        }

        .duo-slide-content {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(8px, 2vw, 16px);
          box-sizing: border-box;
        }

        .duo-slide-icon {
          width: clamp(70px, 18vw, 100px);
          height: clamp(70px, 18vw, 100px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(32px, 8vw, 48px);
          margin: 0 auto clamp(16px, 4vw, 24px) auto;
          animation: iconBounce 4s ease-in-out infinite;
          position: relative;
          text-align: center;
          line-height: 1;
        }

        .duo-slide-icon span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji', 'EmojiSymbols', sans-serif;
          font-variant-emoji: emoji;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .duo-slide-title {
          font-size: clamp(18px, 5vw, 24px);
          font-weight: 800;
          margin: 0 0 clamp(12px, 3vw, 16px) 0;
          color: var(--lq-text-main);
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .duo-slide-description {
          font-size: clamp(14px, 3.5vw, 16px);
          color: var(--lq-text-muted);
          margin: 0;
          line-height: 1.5;
          max-width: 95%;
        }

        .duo-cta-section {
          margin-top: clamp(16px, 4vw, 24px);
        }

        .duo-get-started-btn {
          width: 100%;
          padding: clamp(14px, 4vw, 18px) clamp(16px, 4vw, 24px);
          background: var(--duo-header);
          border: none;
          border-radius: clamp(12px, 3vw, 16px);
          color: white;
          font-size: clamp(14px, 3.5vw, 16px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(6px, 2vw, 8px);
          box-shadow: 0 6px 0 var(--lq-shadow), 0 12px 32px var(--lq-shadow-opacity);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          min-height: clamp(48px, 12vw, 60px);
        }

        .duo-get-started-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 9px 0 var(--lq-shadow), 0 18px 40px var(--lq-shadow-opacity);
        }

        .duo-get-started-btn:active {
          transform: translateY(3px);
          box-shadow: 0 3px 0 var(--lq-shadow), 0 6px 20px var(--lq-shadow-opacity);
        }

        .btn-text {
          position: relative;
          z-index: 2;
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--lq-text-main), transparent);
          animation: shine 3s ease-in-out infinite;
        }

        .duo-dots-container {
          display: flex;
          justify-content: center;
          gap: clamp(6px, 2vw, 8px);
          margin: clamp(16px, 4vw, 24px) 0 clamp(12px, 3vw, 20px);
        }

        .duo-nav-dot {
          width: clamp(6px, 2vw, 8px);
          height: clamp(6px, 2vw, 8px);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .duo-nav-dot.active {
          width: clamp(18px, 5vw, 24px);
          border-radius: clamp(9px, 2.5vw, 12px);
        }

        .duo-nav-buttons {
          display: flex;
          justify-content: space-between;
          gap: clamp(8px, 3vw, 12px);
        }

        .duo-nav-btn {
          flex: 1;
          padding: clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px);
          border: 2px solid var(--lq-border);
          border-radius: clamp(8px, 2vw, 12px);
          background: var(--duo-card);
          color: var(--lq-text-muted);
          font-size: clamp(12px, 3vw, 14px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(4px, 1vw, 6px);
          transition: all 0.2s ease;
          min-height: clamp(40px, 10vw, 48px);
        }

        .duo-nav-btn.next {
          background: var(--duo-header);
          border-color: var(--lq-text-main);
          color: white;
          box-shadow: 0 4px 0 var(--lq-shadow);
        }

        .duo-nav-btn.next:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 0 var(--lq-shadow);
        }

        .duo-nav-btn.prev:hover {
          border-color: var(--lq-text-main);
          color: var(--lq-text-main);
        }

        .duo-nav-btn.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .nav-spacer {
          flex: 1;
        }

        .duo-welcome-footer {
          background: var(--duo-bg);
          padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 32px);
          border: 1px solid var(--lq-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: clamp(8px, 2vw, 12px);
        }

        .duo-copyright {
          font-size: clamp(10px, 2.5vw, 12px);
          color: var(--lq-text-muted);
          font-weight: 500;
        }

        .duo-skip-btn {
          background: transparent;
          border: none;
          color: var(--lq-text-main);
          font-size: clamp(10px, 2.5vw, 12px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
          border-radius: 6px;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }

        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.5); }
        }

        @keyframes iconBounce {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          50% { 
            transform: translateY(clamp(-8px, -2vw, -10px)) scale(1.05); 
          }
        }

        @keyframes shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;