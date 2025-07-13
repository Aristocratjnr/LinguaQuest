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
      description: "Embark on a fun journey to master languages through interactive conversations and challenges.",
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
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 300 : -300,
        opacity: 0
      };
    }
  };
  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide(prev => Math.max(0, Math.min(slides.length - 1, prev + newDirection)));
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-2" 
         style={{ 
           background: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)',
           backgroundAttachment: 'fixed'
         }}>
      <motion.div 
        className="card shadow-md w-100"
        style={{ 
          maxWidth: 500, 
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          boxSizing: 'border-box',
          border: 'none'
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo Header */}
        <div className="card-header text-center py-4 border-bottom-0 d-flex flex-column align-items-center" 
             style={{ 
               background: 'rgba(255, 255, 255, 0.95)',
               borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
             }}>
          <motion.div 
            className="mb-2 p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
            style={{ 
              background: 'linear-gradient(135deg, #58CC02, #1CB0F6)', 
              width: 80, 
              height: 80
            }}
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <img 
              src={logo} 
              alt="LinguaQuest Logo" 
              className="img-fluid" 
              style={{ 
                height: 48, 
                width: 48, 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
          </motion.div>
          <motion.h1 
            className="fw-bold mb-0" 
            style={{ 
              letterSpacing: '-0.02em',
              fontSize: '1.75rem',
              color: '#1f2937'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            LinguaQuest
          </motion.h1>
          <motion.p 
            className="mt-1 mb-0" 
            style={{ 
              fontSize: '1rem', 
              letterSpacing: '0.01em',
              fontWeight: 500,
              color: '#6b7280'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Learn languages the fun way!
          </motion.p>
        </div>
        
        {/* Slide Content */}
        <div className="card-body p-0" style={{ background: 'rgba(255, 255, 255, 0.97)' }}>
          {/* Slider */}
          <div className="position-relative" style={{ minHeight: '300px', overflow: 'hidden' }}>
            <AnimatePresence custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="p-4 p-sm-5 text-center d-flex flex-column align-items-center"
                style={{ position: 'absolute', width: '100%' }}
              >
                <motion.div 
                  className="mb-4 p-3 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                  style={{ 
                    background: `${slides[currentSlide].color}20`, 
                    width: 120, 
                    height: 120,
                    fontSize: '3.5rem'
                  }}
                  initial={{ scale: 0.8, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
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
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#1f2937',
                    marginBottom: '1rem',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {slides[currentSlide].title}
                </motion.h2>
                
                <motion.p 
                  style={{ 
                    fontSize: '1.1rem', 
                    color: '#4b5563',
                    lineHeight: 1.6,
                    maxWidth: '90%',
                    letterSpacing: '0.01em',
                    marginBottom: 0,
                    fontWeight: 400
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {slides[currentSlide].description}
                </motion.p>
                
                {/* Debug info - remove this after testing */}
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
                  Slide {currentSlide + 1} of {slides.length}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Get Started Button - Only show on the last slide */}
          {currentSlide === slides.length - 1 && (
            <div className="px-4 px-sm-6 pb-3">
              <motion.button
                className="btn btn-primary btn-md w-100 text-center d-flex align-items-center justify-content-center"
                style={{ 
                  background: slides[currentSlide].color,
                  border: 'none',
                  borderRadius: '14px',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  boxShadow: `0 4px 14px ${slides[currentSlide].color}50`,
                  position: 'relative',
                  overflow: 'hidden',
                  color: 'white'
                }}
                onClick={onGetStarted}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: `0 6px 20px ${slides[currentSlide].color}`,
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <span className="position-relative z-10">
                  <i className="material-icons align-middle me-2" style={{ fontSize: '1.2rem' }}>
                    arrow_forward
                  </i>
                  Get Started
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
          <div className="d-flex justify-content-center pb-3 pb-sm-4">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className="mx-1"
                style={{ 
                  width: currentSlide === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentSlide === index ? slide.color : '#d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center px-4 px-sm-5 pb-4 gap-3 gap-sm-0">
            <motion.button 
              className="btn btn-outline-secondary btn-sm w-100 w-sm-auto d-flex align-items-center justify-content-center"
              style={{ 
                borderRadius: '12px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                opacity: currentSlide === 0 ? 0 : 1,
                pointerEvents: currentSlide === 0 ? 'none' : 'auto',
                minWidth: 100,
                borderColor: '#d1d5db',
                color: '#4b5563',
                gap: '4px',
                fontWeight: 600
              }}
              onClick={() => paginate(-1)}
              disabled={currentSlide === 0}
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="material-icons" style={{ fontSize: '1rem' }}>arrow_back</i>
              <span>Previous</span>
            </motion.button>
            
            {currentSlide < slides.length - 1 ? (
              <motion.button 
                className="btn btn-primary btn-sm w-100 w-sm-auto d-flex align-items-center justify-content-center"
                style={{ 
                  borderRadius: '12px',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.01em',
                  background: slides[currentSlide + 1].color,
                  border: 'none',
                  minWidth: 100,
                  gap: '4px',
                  boxShadow: `0 2px 8px ${slides[currentSlide + 1].color}80`,
                  color: 'white',
                  fontWeight: 600
                }}
                onClick={() => paginate(1)}
                whileHover={{ scale: 1.02, boxShadow: `0 4px 12px ${slides[currentSlide + 1].color}` }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Next</span>
                <i className="material-icons" style={{ fontSize: '1rem' }}>arrow_forward</i>
              </motion.button>
            ) : (
              <div style={{ minWidth: 100 }} /> // Spacer for alignment
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="card-footer py-3 text-center border-top-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 gap-sm-0" 
             style={{ 
               background: 'rgba(255, 255, 255, 0.97)',
               fontSize: '0.8rem',
               color: '#6b7280',
               borderTop: '1px solid rgba(0, 0, 0, 0.05)'
             }}>
          <motion.span 
            style={{ letterSpacing: '0.01em', fontWeight: 500 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © 2025 LinguaQuest
          </motion.span>
          <motion.button 
            className="btn btn-sm p-0 text-primary"
            style={{ 
              fontSize: '0.8rem',
              background: 'transparent',
              border: 'none',
              letterSpacing: '0.01em',
              minWidth: 90,
              fontWeight: 600
            }}
            onClick={() => setCurrentSlide(slides.length - 1)}
            whileHover={{ color: slides[slides.length - 1].color }}
            whileTap={{ scale: 0.95 }}
          >
            Skip Tour
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;