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
      color: "#58CC02",
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
      description: "Earn points, collect badges, and climb the leaderboard as you improve.",
      icon: "trending_up",
      color: "#FFC800",
      character: "📈"
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
    <div
      className="welcome-container"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--duo-bg, linear-gradient(135deg, #58cc02 0%, #4CAF50 100%))',
        backgroundAttachment: 'fixed',
        padding: '1rem',
        color: 'var(--text-dark, #222)',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      {/* Animated background elements */}
      <motion.div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ 
          background: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1IiBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiLz48L2c+PC9zdmc+")',
          opacity: 0.3,
          zIndex: 0
        }}
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'] 
        }}
        transition={{ 
          duration: 60,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />
      
      <motion.div 
        className="welcome-card shadow-lg position-relative"
        style={{ 
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          border: 'none',
          zIndex: 1,
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          background: 'var(--duo-card, #fff)',
          color: 'inherit',
          margin: '0 auto',
          maxWidth: '400px' // Added max-width for better control
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.16, 1, 0.3, 1],
          delay: 0.1
        }}
      >
        {/* Logo Header */}
        <div className="card-header text-center py-3 border-bottom-0 d-flex flex-column align-items-center" 
             style={{ 
               background: 'transparent',
             }}>
          <motion.div 
            className="mb-2 p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
            style={{ 
              background: '#58cc02', 
              width: '60px', 
              height: '60px',
              boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)'
            }}
            initial={{ scale: 0.8, rotate: -15 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              boxShadow: '0 6px 20px rgba(88, 204, 2, 0.4)'
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 10,
              delay: 0.3
            }}
          >
            <img 
              src={logo} 
              alt="LinguaQuest Logo" 
              className="img-fluid" 
              style={{ 
                height: '36px', 
                width: '36px', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
              }} 
            />
          </motion.div>
          <motion.h1 
            className="fw-bold mb-0" 
            style={{ 
              padding: '0.8rem',
          background: '#ffffff',
          textAlign: 'center',
          color: 'var(--text-light, #e0e7ff)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            LinguaQuest
          </motion.h1>
          <motion.p 
            className="mt-1 mb-0" 
            style={{ 
              fontSize: '0.9rem', 
              letterSpacing: '0.01em',
              fontWeight: 500,
              color: 'var(--text-dark, #6b7280)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Learn languages the fun way!
          </motion.p>
        </div>
        
        {/* Slide Content */}
        <div className="card-body p-0" style={{ background: 'transparent' }}>
          {/* Slider */}
          <div className="position-relative" style={{ minHeight: '240px', overflow: 'hidden' }}>
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-3 p-sm-4 text-center d-flex flex-column align-items-center"
                style={{ position: 'absolute', width: '100%' }}
              >
                <motion.div 
                  className="mb-3 p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                  style={{ 
                    background: `${slides[currentSlide].color}15`, 
                    width: '80px', 
                    height: '80px',
                    fontSize: '2.5rem',
                    border: `2px solid ${slides[currentSlide].color}30`,
                    boxShadow: `0 4px 12px ${slides[currentSlide].color}20`
                  }}
                  initial={{ scale: 0.8, rotate: -15 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    boxShadow: `0 6px 20px ${slides[currentSlide].color}30`
                  }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                    delay: 0.1
                  }}
                >
                  {slides[currentSlide].character}
                </motion.div>
                
                <motion.h2 
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: 'var(--text-dark, #222)',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    padding: '0 0.5rem'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {slides[currentSlide].title}
                </motion.h2>
                
                <motion.p 
                  style={{ 
                    fontSize: '0.95rem', 
                    color: 'var(--text-dark, #4b5563)',
                    lineHeight: 1.5,
                    maxWidth: '90%',
                    letterSpacing: '0.01em',
                    marginBottom: 0,
                    fontWeight: 400,
                    padding: '0 0.5rem'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Get Started Button - Only show on the last slide */}
          {currentSlide === slides.length - 1 && (
            <div className="px-3 pb-3">
              <motion.button
                className="btn btn-primary w-100 text-center d-flex align-items-center justify-content-center"
                style={{ 
                  background: '#58cc02',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  boxShadow: '0 3px 0 #3caa3c',
                  position: 'relative',
                  overflow: 'hidden',
                  color: 'white',
                  textTransform: 'uppercase'
                }}
                onClick={onGetStarted}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: '0 4px 0 #3caa3c',
                  transition: { type: 'spring', stiffness: 400 }
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <span className="position-relative z-10">
                  <i className="material-icons align-middle me-2" style={{ fontSize: '1rem' }}>
                    arrow_forward
                  </i>
                  GET STARTED
                </span>
                <motion.span 
                  className="position-absolute top-0 left-0 w-100 h-100"
                  style={{
                    background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
                    transform: 'translateX(-100%)'
                  }}
                  animate={{
                    transform: ['translateX(-100%)', 'translateX(100%)']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              </motion.button>
            </div>
          )}
          
          {/* Navigation Dots */}
          <div className="d-flex justify-content-center pb-2">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className="mx-1 cursor-pointer"
                style={{ 
                  width: currentSlide === index ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: currentSlide === index ? slide.color : '#d1d5db',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="d-flex flex-row justify-content-between align-items-center px-3 pb-3 gap-2">
            <motion.button 
              className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
              style={{ 
                borderRadius: '8px',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '1px',
                opacity: currentSlide === 0 ? 0 : 1,
                pointerEvents: currentSlide === 0 ? 'none' : 'auto',
                borderColor: '#d1d5db',
                color: 'var(--text-dark, #4b5563)',
                gap: '4px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '0.375rem',
                textTransform: 'uppercase'
              }}
              onClick={() => paginate(-1)}
              disabled={currentSlide === 0}
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <i className="material-icons" style={{ fontSize: '0.9rem' }}>arrow_back</i>
              <span>PREV</span>
            </motion.button>
            
            {currentSlide < slides.length - 1 ? (
              <motion.button 
                className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                style={{ 
                  borderRadius: '8px',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '1px',
                  background: '#58cc02',
                  border: 'none',
                  gap: '4px',
                  boxShadow: '0 3px 0 #3caa3c',
                  color: 'var(--text-light, #e0e7ff)',
                  fontWeight: 'bold',
                  padding: '0.375rem',
                  textTransform: 'uppercase'
                }}
                onClick={() => paginate(1)}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: '0 4px 0 #3caa3c',
                  transition: { type: 'spring', stiffness: 400 }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span>NEXT</span>
                <i className="material-icons" style={{ fontSize: '0.9rem' }}>arrow_forward</i>
              </motion.button>
            ) : (
              <div style={{ minWidth: '90px' }} /> // Spacer for alignment
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="card-footer py-2 text-center border-top-0 d-flex flex-row justify-content-between align-items-center gap-2" 
             style={{ 
               background: 'transparent',
               fontSize: '0.75rem',
               color: 'var(--text-dark, #6b7280)',
               borderTop: '1px solid rgba(0, 0, 0, 0.05)'
             }}>
          <motion.span 
            style={{ letterSpacing: '0.01em', fontWeight: 500 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            © 2025 LinguaQuest
          </motion.span>
          <motion.button 
            className="btn btn-sm p-0 text-primary"
            style={{ 
              fontSize: '0.75rem',
              background: 'transparent',
              border: 'none',
              letterSpacing: '1px',
              minWidth: 80,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
            onClick={() => {
              setDirection(1);
              setCurrentSlide(slides.length - 1);
            }}
            whileHover={{ color: '#58cc02' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            SKIP TOUR
          </motion.button>
        </div>
      </motion.div>
      <style>{`
        .dark .welcome-container, body.dark .welcome-container {
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .welcome-card, body.dark .welcome-card {
          color: var(--text-light, #e0e7ff) !important;
          background: var(--duo-card, #232946) !important;
        }
        .dark .welcome-card h1, .dark .welcome-card h2, .dark .welcome-card p, .dark .welcome-card .btn, .dark .welcome-card .card-footer, body.dark .welcome-card h1, body.dark .welcome-card h2, body.dark .welcome-card p, body.dark .welcome-card .btn, body.dark .welcome-card .card-footer {
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .welcome-card .btn-primary, body.dark .welcome-card .btn-primary {
          background: var(--duo-green, #58cc02) !important;
          color: var(--text-light, #e0e7ff) !important;
        }
        .dark .welcome-card .btn-outline-secondary, body.dark .welcome-card .btn-outline-secondary {
          color: var(--text-light, #e0e7ff) !important;
          border-color: #a5b4fc !important;
          background: rgba(35,41,70,0.7) !important;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;