import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo.png';

interface WelcomePageProps {
  onGetStarted: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome to LinguaQuest",
      description: "Embark on a journey to master languages through interactive conversations and persuasive challenges.",
      icon: "explore"
    },
    {
      title: "Practice Real Conversations",
      description: "Engage with AI characters in various scenarios and convince them using different languages.",
      icon: "chat"
    },
    {
      title: "Track Your Progress",
      description: "Earn points, collect badges, and see your improvement over time on the leaderboard.",
      icon: "trending_up"
    },
    {
      title: "Get Started",
      description: "Create your profile and begin your language adventure in just a few steps.",
      icon: "rocket_launch"
    }
  ];

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 px-2 px-sm-3 px-md-4" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <motion.div 
        className="card shadow w-100"
        style={{ 
          maxWidth: 500, 
          width: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          fontFamily: "'JetBrains Mono', monospace",
          boxSizing: 'border-box',
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo Header */}
        <div className="card-header text-center py-4 border-bottom d-flex flex-column align-items-center" 
             style={{ background: 'rgba(79, 70, 229, 0.05)' }}>
          <div className="mb-2 p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
               style={{ background: 'rgba(118, 75, 162, 0.1)', width: 64, height: 64 }}>
            <img 
              src={logo} 
              alt="LinguaQuest Logo" 
              className="img-fluid" 
              style={{ height: 40, width: 40, objectFit: 'contain' }} 
            />
          </div>
          <h1 className="fw-bold mb-0" style={{ 
            color: '#4f46e5', 
            letterSpacing: '-0.01em',
            fontSize: '1.3rem'
          }}>
            LinguaQuest
          </h1>
          <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.9rem', letterSpacing: '0.01em' }}>
            Your Language Adventure Awaits
          </p>
        </div>
        
        {/* Slide Content */}
        <div className="card-body p-0">
          {/* Slider */}
          <div className="position-relative" style={{ minHeight: '220px' }}>
            {slides.map((slide, index) => (
              <motion.div 
                key={index}
                className="p-3 p-sm-4 text-center d-flex flex-column align-items-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ 
                  opacity: currentSlide === index ? 1 : 0,
                  x: currentSlide === index ? 0 : 50,
                  position: currentSlide === index ? 'relative' : 'absolute',
                  zIndex: currentSlide === index ? 2 : 1,
                  top: 0,
                  width: '100%'
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-3 p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                     style={{ 
                       background: 'rgba(79, 70, 229, 0.1)', 
                       width: 56, 
                       height: 56,
                     }}>
                  <i className="material-icons" style={{ fontSize: '2rem', color: '#4f46e5' }}>
                    {slide.icon}
                  </i>
                </div>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: '#4f46e5',
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}>
                  {slide.title}
                </h2>
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: '#4b5563',
                  lineHeight: 1.6,
                  maxWidth: '95%',
                  letterSpacing: '0.01em',
                  marginBottom: 0
                }}>
                  {slide.description}
                </p>
                
                {index === slides.length - 1 && (
                  <motion.button
                    className="btn btn-primary btn-lg w-100 mt-3"
                    style={{ 
                      background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                    onClick={onGetStarted}
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <i className="material-icons align-middle me-2" style={{ fontSize: '1.1rem' }}>
                      arrow_forward
                    </i>
                    Get Started
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          <div className="d-flex justify-content-center pb-3 pb-sm-4">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                className="mx-1"
                style={{ 
                  width: currentSlide === index ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentSlide === index ? '#4f46e5' : '#d1d5db',
                  cursor: 'pointer',
                  transition: 'width 0.3s ease'
                }}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center px-3 px-sm-4 pb-3 pb-sm-4 gap-2 gap-sm-0">
            <button 
              className="btn btn-outline-secondary btn-sm w-100 w-sm-auto"
              style={{ 
                borderRadius: '0.375rem',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.01em',
                opacity: currentSlide === 0 ? 0 : 1,
                pointerEvents: currentSlide === 0 ? 'none' : 'auto',
                minWidth: 90
              }}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
            >
              <i className="material-icons align-middle me-1" style={{ fontSize: '0.9rem' }}>arrow_back</i>
              Previous
            </button>
            
            {currentSlide < slides.length - 1 && (
              <button 
                className="btn btn-primary btn-sm w-100 w-sm-auto"
                style={{ 
                  borderRadius: '0.375rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.01em',
                  background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                  border: 'none',
                  minWidth: 90
                }}
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              >
                Next
                <i className="material-icons align-middle ms-1" style={{ fontSize: '0.9rem' }}>arrow_forward</i>
              </button>
            )}
            
            {currentSlide === slides.length - 1 && (
              <button 
                className="btn btn-sm w-100 w-sm-auto"
                style={{ 
                  background: 'transparent',
                  color: 'transparent',
                  border: 'none',
                  pointerEvents: 'none',
                  minWidth: 90
                }}
              >
                Skip
              </button>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="card-footer py-2 text-center border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 gap-sm-0" 
             style={{ 
               background: 'rgba(79, 70, 229, 0.05)',
               fontSize: '0.8rem',
               color: '#6b7280'
             }}>
          <span style={{ letterSpacing: '0.01em' }}>© 2025 LinguaQuest</span>
          <button 
            className="btn btn-sm text-muted p-0"
            style={{ 
              fontSize: '0.8rem',
              background: 'transparent',
              border: 'none',
              letterSpacing: '0.01em',
              minWidth: 90
            }}
            onClick={() => setCurrentSlide(slides.length - 1)}
          >
            Skip Tour
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;