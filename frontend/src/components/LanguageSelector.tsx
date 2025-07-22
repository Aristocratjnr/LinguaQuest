import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language as LanguageIcon, School as SchoolIcon, Translate as TranslateIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { storage, userApi } from '../services/api';
import ghanaFlag from '../assets/images/ghana.png';

interface Language {
  code: string;
  label: string;
  nativeName: string;
  icon: string;
  flagImg: string;
  description: string;
}

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
  onBack: () => void;
}

const LANGUAGES: Language[] = [
  {
    code: 'twi',
    label: 'Twi',
    nativeName: 'Twi',
    icon: 'language',
    flagImg: ghanaFlag,
    description: 'Most widely spoken language in Ghana, rich in proverbs and cultural expressions.'
  },
  {
    code: 'gaa',
    label: 'Ga',
    nativeName: 'Gã',
    icon: 'translate',
    flagImg: ghanaFlag,
    description: 'Language of the Ga people, primarily spoken in the Greater Accra Region.'
  },
  {
    code: 'ewe',
    label: 'Ewe',
    nativeName: 'Eʋegbe',
    icon: 'school',
    flagImg: ghanaFlag,
    description: 'Spoken by the Ewe people in the Volta Region and parts of Togo.'
  }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const { user } = useUser();

  const handleLanguageClick = (code: string) => {
    setSelectedLanguage(code);
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    if (selectedLanguage) {
      if (user) {
        try {
          // Store in backend
          await userApi.updateUser(user.nickname, {
            preferred_language: selectedLanguage
          });

          // Store in local storage
          storage.setLanguage(selectedLanguage);

          // Show continue modal
          setShowContinueModal(true);
        } catch (error) {
          console.error('Failed to update language preference:', error);
          // Still store in local storage even if backend fails
          storage.setLanguage(selectedLanguage);
          setShowContinueModal(true);
        }
      } else {
        // No user, just store locally and show modal
        storage.setLanguage(selectedLanguage);
        setShowContinueModal(true);
      }
    }
  };

  const handleBack = () => {
    if (isConfirming) {
      setIsConfirming(false);
      setSelectedLanguage(null);
    } else {
      onBack();
    }
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onSelect(selectedLanguage);
      setShowContinueModal(false);
    }
  };

  const selectedLangObj = LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="language-selector-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--duo-bg, linear-gradient(135deg, #58cc02 0%, #4CAF50 100%))',
      padding: '1rem',
      fontFamily: '"JetBrains Mono", monospace',
      color: 'var(--text-dark, #222)'
    }}>
      <motion.div
        className="language-selector-card"
        style={{
          width: '100%',
          maxWidth: '32rem',
          background: 'rgba(255, 255, 255, 0.25)', // glassy background
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          color: 'inherit',
          backdropFilter: 'blur(16px) saturate(180%)', // glassy blur
          WebkitBackdropFilter: 'blur(16px) saturate(180%)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.35)', // subtle border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: ' #ffffff',
          textAlign: 'center',
          color: 'var(--text-light, #e0e7ff)'
        }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              marginBottom: '0.75rem'
            }}>
              <span className="material-icons" style={{ fontSize: '1.5rem', color: '#1cb0f6' }}>language</span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-light, #e0e7ff)'
            }}>
              Choose Your Language
            </h2>
            <p style={{
              margin: '0.5rem 0 0',
              opacity: 0.9,
              fontSize: '0.875rem',
              color: 'var(--text-dark, #222)'
            }}>
              Select the language you want to learn
            </p>
          </motion.div>
        </div>
        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {LANGUAGES.map((lang, index) => (
              <motion.div
                key={lang.code}
                onClick={() => handleLanguageClick(lang.code)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: selectedLanguage === lang.code ? '3px solid #58cc02' : '3px solid #e2e8f0',
                  background: selectedLanguage === lang.code ? '#f7faf3' : '#fff',
                  transition: 'all 0.2s',
                  boxShadow: selectedLanguage === lang.code ?
                    '0 10px 15px -3px rgba(88, 204, 2, 0.3), 0 4px 6px -2px rgba(88, 204, 2, 0.1)' :
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="card-body d-flex align-items-center gap-3 p-3">
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: '#f0f9ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}
                  >
                    <img
                      src={lang.flagImg}
                      alt={`${lang.label} flag`}
                      style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                      }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      marginBottom: '0.25rem',
                      color: '#1a1a1a'
                    }}>
                      {lang.label}
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        fontWeight: 400
                      }}>
                        ({lang.nativeName})
                      </span>
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      marginBottom: 0,
                      lineHeight: 1.4
                    }}>
                      {lang.description}
                    </p>
                  </div>
                  {selectedLanguage === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: '#58cc02',
                        color: 'white',
                        borderRadius: '50%',
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '1rem' }}>check</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {isConfirming && !showContinueModal && (
            <motion.button
              onClick={handleConfirm}
              disabled={!selectedLanguage}
              whileHover={selectedLanguage ? { scale: 1.02 } : {}}
              whileTap={selectedLanguage ? { scale: 0.98 } : {}}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: selectedLanguage ? 'var(--duo-green, #58cc02)' : '#e2e8f0',
                color: selectedLanguage ? 'var(--text-light, #e0e7ff)' : '#94a3b8',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: selectedLanguage ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selectedLanguage ? '0 4px 0 #3caa3c' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-icons" style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>check_circle</span>
              Confirm Selection
            </motion.button>
          )}
        </div>
        {/* Footer */}
        <div style={{
          padding: '1rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-dark, #64748b)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{
              fontSize: '1rem',
              marginRight: '0.25rem',
              color: '#64748b'
            }}>info</span>
            You can change your language later in settings
          </div>
        </div>
      </motion.div>
      {/* Continue Modal */}
      <AnimatePresence>
        {showContinueModal && selectedLangObj && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem', // for mobile spacing
            }}
          >
            <motion.div
              style={{
                background: '#fff',
                borderRadius: '1.25rem',
                boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
                padding: '1.25rem 1rem',
                minWidth: '0',
                width: '100%',
                maxWidth: '340px', // smaller modal
                textAlign: 'center',
                position: 'relative',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: '"JetBrains Mono", "Fira Mono", "Menlo", monospace',
              }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Material Icon at the top */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: '#e0f2fe',
                margin: '0 auto 0.75rem auto',
              }}>
                <span className="material-icons" style={{ fontSize: '1.5rem', color: '#1cb0f6' }}>translate</span>
              </div>
              <div style={{ marginBottom: '1.25rem', width: '100%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  gap: '0.75rem',
                  width: '100%',
                }}>
                  <img
                    src={selectedLangObj.flagImg}
                    alt={`${selectedLangObj.label} flag`}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.2, fontFamily: 'inherit', letterSpacing: '0.01em' }}>{selectedLangObj.label} <span style={{ fontWeight: 300, color: '#6b7280', fontSize: '0.95rem', fontFamily: 'inherit' }}>({selectedLangObj.nativeName})</span></h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.3, fontWeight: 300, fontFamily: 'inherit' }}>{selectedLangObj.description}</p>
                  </div>
                </div>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  color: '#64748b',
                  fontSize: '0.92rem',
                  marginBottom: '0.75rem',
                  lineHeight: 1.3,
                  fontWeight: 300,
                  fontFamily: 'inherit',
                }}>
                  You can come back and reselect the language.
                </div>
                <motion.button
                  onClick={handleContinue}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'var(--duo-green, #58cc02)',
                    color: 'var(--text-light, #e0e7ff)',
                    fontSize: '1rem',
                    fontWeight: 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 0 #3caa3c',
                    transition: 'all 0.2s',
                    marginTop: '0.25rem',
                    fontFamily: 'inherit',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-icons" style={{ fontSize: '1.15rem', marginRight: '0.45rem', color: '#fff' }}>check_circle</span>
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
