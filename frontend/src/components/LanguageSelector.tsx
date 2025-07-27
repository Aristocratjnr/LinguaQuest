import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="duo-lang-bg">
      <div className="duo-decorations">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
      <motion.div
        className="duo-lang-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="duo-lang-header">
          <motion.div
            className="duo-header-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            <div className="duo-icon-container">
              <span className="material-icons">language</span>
            </div>
            <h1 className="duo-lang-title">Choose your language</h1>
            <p className="duo-lang-subtitle">
              Pick the language you want to master
            </p>
          </motion.div>
        </div>
        {/* Body */}
        <div className="duo-lang-body">
          <div className="duo-languages-grid">
            {LANGUAGES.map((lang, index) => (
              <motion.div
                key={lang.code}
                className={`duo-language-card ${selectedLanguage === lang.code ? 'selected' : ''}`}
                onClick={() => handleLanguageClick(lang.code)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="duo-lang-content">
                  <div className="duo-flag-container">
                    <img
                      src={lang.flagImg}
                      alt={`${lang.label} flag`}
                      className="duo-flag-img"
                    />
                  </div>
                  <div className="duo-lang-info">
                    <h3 className="duo-lang-name">
                      {lang.label}
                      <span className="duo-native-name">({lang.nativeName})</span>
                    </h3>
                    <p className="duo-lang-desc">{lang.description}</p>
                  </div>
                  {selectedLanguage === lang.code && (
                    <motion.div
                      className="duo-check-badge"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <span className="material-icons">check</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {isConfirming && !showContinueModal && (
            <motion.button
              className={`duo-confirm-btn ${selectedLanguage ? 'active' : 'disabled'}`}
              onClick={handleConfirm}
              disabled={!selectedLanguage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={selectedLanguage ? { scale: 1.02, y: -2 } : {}}
              whileTap={selectedLanguage ? { scale: 0.98 } : {}}
            >
              <span className="material-icons">check_circle</span>
              <span>Confirm Selection</span>
            </motion.button>
          )}
        </div>
        {/* Footer */}
        <div className="duo-lang-footer">
          <div className="duo-footer-content">
            <span className="material-icons">info</span>
            <span>You can change your language later in settings</span>
          </div>
        </div>
      </motion.div>

      {/* Continue Modal */}
      <AnimatePresence>
        {showContinueModal && selectedLangObj && (
          <motion.div
            className="duo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="duo-continue-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="duo-modal-header">
                <div className="duo-modal-icon">
                  <span className="material-icons">translate</span>
                </div>
                <h2 className="duo-modal-title">Perfect choice!</h2>
              </div>

              <div className="duo-modal-body">
                <div className="duo-selected-lang">
                  <img
                    src={selectedLangObj.flagImg}
                    alt={`${selectedLangObj.label} flag`}
                    className="duo-modal-flag"
                  />
                  <div className="duo-modal-lang-info">
                    <h3 className="duo-modal-lang-name">
                      {selectedLangObj.label}
                      <span className="duo-modal-native">({selectedLangObj.nativeName})</span>
                    </h3>
                    <p className="duo-modal-lang-desc">{selectedLangObj.description}</p>
                  </div>
                </div>

                <div className="duo-modal-note">
                  <span className="material-icons">lightbulb</span>
                  <span>Don't worry! You can always change your language preference later.</span>
                </div>

                <motion.button
                  className="duo-continue-btn"
                  onClick={handleContinue}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>START LEARNING</span>
                  <span className="material-icons">arrow_forward</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .duo-lang-bg {
          min-height: 100vh;
          width: 100vw;
        background: linear-gradient(135deg, #ffffff, #ffffff); 
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
        }

        .duo-decorations {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          animation: float 6s ease-in-out infinite;
        }

        .circle-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: -5%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: -3%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 100px;
          height: 100px;
          top: 30%;
          right: 15%;
          animation-delay: 4s;
        }

        .duo-lang-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .duo-lang-header {
         background: linear-gradient(135deg, #ffffff, #f8f8f8); 
          padding: 40px 32px 32px;
          text-align: center;
          color: white;
          position: relative;
        }

        .duo-lang-header::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 20px;
          background: #ffffff;
          border-radius: 20px 20px 0 0;
        }

        .duo-header-content {
          position: relative;
          z-index: 2;
        }

        .duo-icon-container {
          width: 64px;
          height: 64px;
          background: #444444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          backdrop-filter: blur(10px);
        }

        .duo-icon-container .material-icons {
          font-size: 32px;
          color: white;
        }

        .duo-lang-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .duo-lang-subtitle {
          font-size: 16px;
          font-weight: 400;
          margin: 0;
          opacity: 0.9;
          color: #555555
        }

        .duo-lang-body {
          padding: 32px;
        }

        .duo-languages-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .duo-language-card {
          background: #ffffff;
          border: 3px solid #e5e5e5;
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .duo-language-card:hover {
          border-color: #58cc02;
          box-shadow: 0 8px 25px rgba(88, 204, 2, 0.15);
        }

        .duo-language-card.selected {
          border-color: #58cc02;
          background: linear-gradient(135deg, #f7faf3, #ffffff);
          box-shadow: 0 8px 25px rgba(88, 204, 2, 0.2);
        }

        .duo-lang-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .duo-flag-container {
          width: 56px;
          height: 56px;
          background: #f8fafc;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .duo-flag-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 12px;
        }

        .duo-lang-info {
          flex: 1;
        }

        .duo-lang-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #3c3c3c;
        }

        .duo-native-name {
          font-size: 14px;
          font-weight: 400;
          color: #777;
          margin-left: 8px;
        }

        .duo-lang-desc {
          font-size: 14px;
          color: #777;
          margin: 0;
          line-height: 1.4;
        }

        .duo-check-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: #58cc02;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
        }

        .duo-check-badge .material-icons {
          font-size: 20px;
        }

        .duo-confirm-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(180deg, #58cc02 0%, #4eb600 100%);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.3);
          transition: all 0.2s ease;
        }

        .duo-confirm-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #46a302, 0 12px 35px rgba(88, 204, 2, 0.4);
        }

        .duo-confirm-btn.active:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #46a302, 0 4px 15px rgba(88, 204, 2, 0.2);
        }

        .duo-confirm-btn.disabled {
          background: #e5e5e5;
          color: #afafaf;
          cursor: not-allowed;
          box-shadow: 0 4px 0 #d0d0d0;
        }

        .duo-lang-footer {
          background: #f8fafc;
          padding: 16px 32px;
          border-top: 1px solid #e5e5e5;
        }

        .duo-footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          color: #777;
        }

        .duo-footer-content .material-icons {
          font-size: 18px;
        }

        .duo-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .duo-continue-modal {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 100%;
          overflow: hidden;
        }

        .duo-modal-header {
         background: #444444
          padding: 32px 24px 24px;
          text-align: center;
          color: black;
        }

        .duo-modal-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ffffff, #808080);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .duo-modal-icon .material-icons {
          font-size: 28px;
        }

        .duo-modal-title {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
        }

        .duo-modal-body {
          padding: 24px;
        }

        .duo-selected-lang {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
        }

        .duo-modal-flag {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .duo-modal-lang-info {
          flex: 1;
        }

        .duo-modal-lang-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #3c3c3c;
        }

        .duo-modal-native {
          font-size: 14px;
          font-weight: 400;
          color: #777;
          margin-left: 8px;
        }

        .duo-modal-lang-desc {
          font-size: 14px;
          color: #777;
          margin: 0;
          line-height: 1.4;
        }

        .duo-modal-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fff7ed;
          border-radius: 12px;
          font-size: 14px;
          color: #92400e;
          margin-bottom: 24px;
        }

        .duo-modal-note .material-icons {
          font-size: 18px;
          color: #f59e0b;
        }

        .duo-continue-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(180deg, #58cc02 0%, #4eb600 100%);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 0 #46a302, 0 8px 25px rgba(88, 204, 2, 0.3);
          transition: all 0.2s ease;
        }

        .duo-continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #46a302, 0 12px 35px rgba(88, 204, 2, 0.4);
        }

        .duo-continue-btn:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #46a302, 0 4px 15px rgba(88, 204, 2, 0.2);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @media (max-width: 600px) {
          .duo-lang-bg {
            padding: 0;
            min-height: 100vh;
          }
          
          .duo-lang-card {
            width: 100vw;
            min-height: 100vh;
            border-radius: 0;
            margin: 0;
            box-shadow: none;
            border: none;
          }
          
          .duo-lang-header {
            padding: 24px 16px 16px;
          }
          
          .duo-icon-container {
            width: 56px;
            height: 56px;
            margin-bottom: 16px;
          }
          
          .duo-icon-container .material-icons {
            font-size: 28px;
          }
          
          .duo-lang-title {
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .duo-lang-subtitle {
            font-size: 14px;
          }
          
          .duo-lang-body {
            padding: 16px;
          }
          
          .duo-lang-content {
            gap: 16px;
          }
          
          .duo-lang-option {
            padding: 16px;
            border-radius: 16px;
            min-height: 80px;
          }
          
          .duo-flag-container {
            width: 56px;
            height: 56px;
            min-width: 56px;
          }
          
          .duo-flag-img {
            width: 40px;
            height: 40px;
          }
          
          .duo-lang-text {
            flex: 1;
          }
          
          .duo-lang-name {
            font-size: 18px;
            margin-bottom: 4px;
          }
          
          .duo-lang-desc {
            font-size: 14px;
            line-height: 1.4;
          }
          
          .duo-lang-footer {
            padding: 16px;
          }
          
          .duo-back-btn {
            padding: 16px;
            font-size: 16px;
            min-height: 48px; /* Touch target size */
            border-radius: 12px;
          }
          
          /* Tick button adjustments */
          .duo-tick-btn {
            width: 48px;
            height: 48px;
            min-width: 48px;
            min-height: 48px; /* Touch target size */
            border-radius: 50%;
            font-size: 24px;
            margin-left: 12px;
          }
          
          /* Confirmation modal adjustments */
          .duo-modal-overlay {
            padding: 16px;
          }
          
          .duo-modal {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            margin: 0;
          }
          
          .duo-modal-header {
            padding: 24px 16px 0;
          }
          
          .duo-modal-title {
            font-size: 22px;
          }
          
          .duo-modal-body {
            padding: 16px;
            flex: 1;
            overflow-y: auto;
          }
          
          .duo-selected-lang {
            padding: 16px;
            border-radius: 12px;
            gap: 12px;
          }
          
          .duo-modal-flag {
            width: 48px;
            height: 48px;
            border-radius: 10px;
          }
          
          .duo-modal-lang-name {
            font-size: 16px;
          }
          
          .duo-modal-native {
            font-size: 13px;
          }
          
          .duo-modal-lang-desc {
            font-size: 13px;
          }
          
          .duo-modal-note {
            padding: 12px;
            border-radius: 10px;
            font-size: 13px;
            gap: 8px;
            margin-bottom: 20px;
          }
          
          .duo-continue-btn {
            padding: 16px;
            font-size: 16px;
            border-radius: 12px;
            min-height: 48px; /* Touch target size */
            box-shadow: 0 4px 0 #46a302;
          }
        }
        
        /* Extra small devices (phones, less than 360px) */
        @media (max-width: 360px) {
          .duo-lang-header {
            padding: 20px 12px 12px;
          }
          
          .duo-icon-container {
            width: 48px;
            height: 48px;
            margin-bottom: 12px;
          }
          
          .duo-icon-container .material-icons {
            font-size: 24px;
          }
          
          .duo-lang-title {
            font-size: 20px;
          }
          
          .duo-lang-body {
            padding: 12px;
          }
          
          .duo-lang-option {
            padding: 12px;
          }
          
          .duo-flag-container {
            width: 48px;
            height: 48px;
            min-width: 48px;
          }
          
          .duo-flag-img {
            width: 32px;
            height: 32px;
          }
          
          .duo-lang-name {
            font-size: 16px;
          }
          
          .duo-lang-desc {
            font-size: 12px;
          }
          
          /* Tick button adjustments for extra small screens */
          .duo-tick-btn {
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
            font-size: 20px;
          }
          
          .duo-modal-header {
            padding: 20px 12px 0;
          }
          
          .duo-modal-title {
            font-size: 20px;
          }
          
          .duo-modal-body {
            padding: 12px;
          }
          
          .duo-selected-lang {
            padding: 12px;
            gap: 10px;
          }
          
          .duo-modal-flag {
            width: 40px;
            height: 40px;
          }
          
          .duo-modal-lang-name {
            font-size: 15px;
          }
          
          .duo-modal-native {
            font-size: 12px;
          }
          
          .duo-modal-lang-desc {
            font-size: 12px;
          }
          
          .duo-modal-note {
            padding: 10px;
            font-size: 12px;
            gap: 6px;
            margin-bottom: 16px;
          }
          
          .duo-continue-btn {
            padding: 14px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
