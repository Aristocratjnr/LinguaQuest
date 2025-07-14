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
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4" 
         style={{ 
           background: 'linear-gradient(135deg, #58cc02 0%, #4CAF50 100%)',
           backgroundAttachment: 'fixed',
           overflow: 'hidden',
           margin: 0,
           width: 'auto',
         }}>
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
        className="card shadow-lg mx-3 my-4 position-relative"
        style={{ 
          maxWidth: 500, 
         width: '95%',
          minWidth: 600, 
          borderRadius: '24px',
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          border: 'none',
          zIndex: 1,
          backdropFilter: 'blur(4px)',
          marginRight: '0.9rem',
          marginLeft: '0.9rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
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
        <div className="card-header text-center py-3 py-sm-4 border-bottom-0 d-flex flex-column align-items-center" 
             style={{ 
               background: 'transparent',
             }}>
          <motion.div 
            className="mb-2 mb-sm-3 p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
            style={{ 
              background: 'linear-gradient(135deg, #58CC02, #1CB0F6)', 
              width: 'clamp(60px, 15vw, 80px)', 
              height: 'clamp(60px, 15vw, 80px)',
              boxShadow: '0 4px 20px rgba(88, 204, 2, 0.4)'
            }}
            initial={{ scale: 0.8, rotate: -15 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              boxShadow: '0 8px 30px rgba(88, 204, 2, 0.6)'
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
                height: 'clamp(36px, 9vw, 48px)', 
                width: 'clamp(36px, 9vw, 48px)', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
          </motion.div>
          <motion.h1 
            className="fw-bold mb-0" 
            style={{ 
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.5rem, 5vw, 1.75rem)',
              color: '#1f2937',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            LinguaQuest
          </motion.h1>
          <motion.p 
            className="mt-1 mt-sm-2 mb-0" 
            style={{ 
              fontSize: 'clamp(0.9rem, 3vw, 1rem)', 
              letterSpacing: '0.01em',
              fontWeight: 500,
              color: '#6b7280'
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
          <div className="position-relative" style={{ minHeight: 'clamp(280px, 60vw, 320px)', overflow: 'hidden' }}>
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-3 p-sm-4 p-md-5 text-center d-flex flex-column align-items-center"
                style={{ position: 'absolute', width: '100%' }}
              >
                <motion.div 
                  className="mb-3 mb-sm-4 p-2 p-sm-3 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                  style={{ 
                    background: `${slides[currentSlide].color}15`, 
                    width: 'clamp(90px, 25vw, 120px)', 
                    height: 'clamp(90px, 25vw, 120px)',
                    fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                    border: `2px solid ${slides[currentSlide].color}30`,
                    boxShadow: `0 4px 20px ${slides[currentSlide].color}20`
                  }}
                  initial={{ scale: 0.8, rotate: -15 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    boxShadow: `0 8px 30px ${slides[currentSlide].color}30`
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
                    fontSize: 'clamp(1.25rem, 5vw, 1.5rem)', 
                    fontWeight: 700, 
                    color: '#1f2937',
                    marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    padding: '0 1rem'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {slides[currentSlide].title}
                </motion.h2>
                
                <motion.p 
                  style={{ 
                    fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', 
                    color: '#4b5563',
                    lineHeight: 1.6,
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
            <div className="px-3 px-sm-4 px-md-5 pb-3 pb-sm-4">
              <motion.button
                className="btn btn-primary btn-lg w-100 text-center d-flex align-items-center justify-content-center"
                style={{ 
                  background: slides[currentSlide].color,
                  border: 'none',
                  borderRadius: '14px',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  fontSize: 'clamp(1rem, 3vw, 1.1rem)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  boxShadow: `0 4px 14px ${slides[currentSlide].color}50`,
                  position: 'relative',
                  overflow: 'hidden',
                  color: 'white'
                }}
                onClick={onGetStarted}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: `0 6px 20px ${slides[currentSlide].color}80`,
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <span className="position-relative z-10">
                  <i className="material-icons align-middle me-2" style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>
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
          <div className="d-flex justify-content-center pb-2 pb-sm-3 pb-md-4">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className="mx-1 cursor-pointer"
                style={{ 
                  width: currentSlide === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
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
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center px-3 px-sm-4 px-md-5 pb-3 pb-sm-4 gap-2 gap-sm-3 gap-md-0">
            <motion.button 
              className="btn btn-outline-secondary btn-sm w-100 w-sm-auto d-flex align-items-center justify-content-center"
              style={{ 
                borderRadius: '12px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                opacity: currentSlide === 0 ? 0 : 1,
                pointerEvents: currentSlide === 0 ? 'none' : 'auto',
                minWidth: 'clamp(90px, 25vw, 100px)',
                borderColor: '#d1d5db',
                color: '#4b5563',
                gap: '4px',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '0.375rem 0.75rem'
              }}
              onClick={() => paginate(-1)}
              disabled={currentSlide === 0}
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <i className="material-icons" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>arrow_back</i>
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
                  minWidth: 'clamp(90px, 25vw, 100px)',
                  gap: '4px',
                  boxShadow: `0 2px 8px ${slides[currentSlide + 1].color}80`,
                  color: 'white',
                  fontWeight: 600,
                  padding: '0.375rem 0.75rem'
                }}
                onClick={() => paginate(1)}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: `0 4px 12px ${slides[currentSlide + 1].color}` 
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span>Next</span>
                <i className="material-icons" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>arrow_forward</i>
              </motion.button>
            ) : (
              <div style={{ minWidth: 'clamp(90px, 25vw, 100px)' }} /> // Spacer for alignment
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="card-footer py-2 py-sm-3 text-center border-top-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-1 gap-sm-2 gap-md-0" 
             style={{ 
               background: 'transparent',
               fontSize: 'clamp(0.75rem, 3vw, 0.8rem)',
               color: '#6b7280',
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
              fontSize: 'clamp(0.75rem, 3vw, 0.8rem)',
              background: 'transparent',
              border: 'none',
              letterSpacing: '0.01em',
              minWidth: 90,
              fontWeight: 600
            }}
            onClick={() => {
              setDirection(1);
              setCurrentSlide(slides.length - 1);
            }}
            whileHover={{ color: slides[slides.length - 1].color }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Skip Tour
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;