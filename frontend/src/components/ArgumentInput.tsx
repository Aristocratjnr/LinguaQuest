import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useActivityFeed } from './ActivityFeedContext';

type ArgumentInputProps = {
  userArgument: string;
  onChange: (val: string) => void;
  loading: boolean;
  disabled: boolean;
  onTranslate: () => void;
  translation: string;
  language: string;
  languages: { code: string; label: string }[];
  enableVoice?: boolean;
  maxLength?: number;
  error?: string;
};

// Language mapping for HTML lang attribute and speech recognition
const LANGUAGE_CONFIG = {
  twi: { htmlLang: 'ak', speechLang: 'en-US', label: 'Twi' },
  gaa: { htmlLang: 'gaa', speechLang: 'en-US', label: 'Ga' },
  ewe: { htmlLang: 'ee', speechLang: 'en-US', label: 'Ewe' },
  en: { htmlLang: 'en', speechLang: 'en-US', label: 'English' },
} as const;

const ArgumentInput: React.FC<ArgumentInputProps> = ({ 
  userArgument, 
  onChange, 
  loading, 
  disabled, 
  onTranslate, 
  translation, 
  language,
  languages,
  enableVoice = false,
  maxLength = 500,
  error
}) => {
  const [listening, setListening] = useState(false);
  const { addActivity } = useActivityFeed();

  // Get current language configuration
  const currentLanguageConfig = useMemo(() => 
    LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG] || LANGUAGE_CONFIG.en, 
    [language]
  );

  // Get language label from props or fallback to config
  const languageLabel = useMemo(() => {
    const langFromProps = languages.find(l => l.code === language);
    return langFromProps?.label || currentLanguageConfig.label;
  }, [languages, language, currentLanguageConfig]);

  // Character count with validation
  const isOverLimit = userArgument.length > maxLength;
  const characterCountColor = isOverLimit ? '#dc3545' : 
    userArgument.length > maxLength * 0.8 ? '#ffc107' : '#6c757d';

  const handleVoiceInput = useCallback(() => {
    if (!enableVoice) return;
    
    console.log('Voice input clicked');
    
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = currentLanguageConfig.speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    
    console.log('Starting speech recognition with language:', currentLanguageConfig.speechLang);
    
    setListening(true);
    
    recognition.start();
    
    recognition.onresult = (event: any) => {
      console.log('Speech recognition result:', event);
      const transcript = event.results[0][0].transcript;
      console.log('Transcript:', transcript);
      onChange(transcript);
      setListening(false);
      addActivity({ type: 'action', message: 'Used voice input for argument' });
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      
      // Provide user feedback for common errors
      switch(event.error) {
        case 'no-speech':
          alert('No speech was detected. Please try again.');
          break;
        case 'audio-capture':
          alert('No microphone was found. Please check your microphone connection.');
          break;
        case 'not-allowed':
          alert('Microphone permission was denied. Please allow microphone access and try again.');
          break;
        case 'network':
          alert('Network error occurred. Please check your internet connection.');
          break;
        default:
          alert(`Speech recognition error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setListening(false);
    };
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
    };
  }, [enableVoice, currentLanguageConfig.speechLang, onChange, addActivity]);

  const handleTranslate = useCallback(() => {
    if (userArgument.trim() && !isOverLimit) {
      addActivity({ type: 'action', message: `Submitted an argument in ${languageLabel}` });
      onTranslate();
    }
  }, [userArgument, isOverLimit, languageLabel, addActivity, onTranslate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Allow typing but warn about limit
    onChange(newValue);
  }, [onChange]);

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 d-flex align-items-center" style={{ 
          color: '#58a700',
          fontWeight: 600,
          fontSize: '1.1rem'
        }}>
          <span className="d-flex align-items-center justify-content-center me-2" style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#e8f5e9',
            color: '#58a700'
          }}>
            <i className="material-icons" style={{ fontSize: '1.2rem' }}>edit</i>
          </span>
          Your Argument
        </h5>
        <span className="badge px-3 py-1 d-flex align-items-center" style={{ 
          backgroundColor: '#e8f5e9',
          color: '#58a700',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.85rem'
        }}>
          <i className="material-icons me-1" style={{ fontSize: '1rem' }}>translate</i>
          {languageLabel}
        </span>
      </div>

      {/* Listening Status */}
      {listening && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-3 p-3 rounded-3 text-center"
          style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #dc3545',
            color: '#dc3545'
          }}
        >
          <div className="d-flex align-items-center justify-content-center gap-2">
            <motion.i 
              className="material-icons"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ color: '#dc3545' }}
            >
              mic
            </motion.i>
            <strong>Listening...</strong>
          </div>
          <small className="d-block mt-1">Speak clearly into your microphone</small>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="position-relative mb-3">
        <textarea
          value={userArgument}
          onChange={handleInputChange}
          rows={3}
          className="form-control"
          disabled={loading || disabled}
          lang={currentLanguageConfig.htmlLang}
          inputMode="text"
          spellCheck={language === 'en'}
          style={{ 
            minHeight: 120, 
            resize: 'vertical',
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '1rem',
            lineHeight: 1.5,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
            fontFamily: 'Noto Sans, Arial Unicode MS, system-ui, sans-serif',
          }}
          placeholder={`Type your argument here... (max ${maxLength} characters)`}
        />
        {error && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{
            backgroundColor: 'rgba(248, 215, 218, 0.9)',
            borderRadius: '12px'
          }}>
            <div className="text-center">
              <i className="material-icons text-danger mb-2" style={{ fontSize: '2rem' }}>error_outline</i>
              <p className="text-danger mb-0 small fw-bold">{error}</p>
            </div>
          </div>
        )}
        <div className="position-absolute bottom-0 end-0 me-3 mb-2 d-flex gap-2">
          {enableVoice && (
            <motion.button
              type="button"
              className={`btn ${listening ? 'btn-danger' : 'btn-outline-secondary'} p-2 d-flex align-items-center justify-content-center`}
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                border: 'none',
                position: 'relative',
                boxShadow: listening ? '0 0 20px rgba(220,53,69,0.5)' : 'none'
              }}
              onClick={handleVoiceInput}
              disabled={loading || disabled}
              title={listening ? "Listening... Click to stop" : "Click to speak your argument"}
              whileTap={{ scale: 0.85 }}
              whileHover={{ backgroundColor: listening ? '#dc3545' : '#f1f1f1' }}
              animate={listening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={listening ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
            >
              {listening && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    right: -8,
                    bottom: -8,
                    borderRadius: '50%',
                    border: '2px solid #dc3545',
                    opacity: 0.6
                  }}
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <i className="material-icons" style={{ 
                fontSize: '1.1rem',
                color: listening ? 'white' : '#58a700'
              }}>
                {listening ? 'mic' : 'mic_none'}
              </i>
            </motion.button>
          )}
          <div className="text-muted small d-flex align-items-center" style={{ 
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            color: characterCountColor,
            fontWeight: isOverLimit ? 600 : 400
          }}>
            {userArgument.length}/{maxLength}
            {isOverLimit && (
              <i className="material-icons ms-1" style={{ fontSize: '0.9rem', color: '#dc3545' }}>
                warning
              </i>
            )}
          </div>
        </div>
      </div>

      {/* Translate Button */}
      <motion.button
        className="btn w-100 mb-3 py-3 d-flex align-items-center justify-content-center"
        onClick={handleTranslate}
        disabled={loading || !userArgument.trim() || disabled || isOverLimit}
        style={{ 
          backgroundColor: loading || isOverLimit ? '#cccccc' : '#58a700',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: loading || isOverLimit ? 'none' : '0 4px 0 rgba(88, 167, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          opacity: disabled ? 0.6 : 1
        }}
        whileHover={!loading && !disabled && !isOverLimit ? { 
          y: -2,
          boxShadow: '0 6px 0 rgba(88, 167, 0, 0.2)'
        } : {}}
        whileTap={!loading && !disabled && !isOverLimit ? { 
          y: 2,
          boxShadow: '0 2px 0 rgba(88, 167, 0, 0.2)'
        } : {}}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Translating...
          </>
        ) : isOverLimit ? (
          <>
            <i className="material-icons align-middle me-2">warning</i>
            Text too long (max {maxLength})
          </>
        ) : (
          <>
            <i className="material-icons align-middle me-2">translate</i>
            Translate to {languageLabel}
          </>
        )}
      </motion.button>

      {/* Translation Result */}
      {translation && (
        <motion.div 
          className="p-3 mb-3 rounded-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          style={{ 
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div className="d-flex align-items-start gap-2">
            <div className="d-flex align-items-center justify-content-center mt-1" style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#58a700',
              color: 'white',
              flexShrink: 0
            }}>
              <i className="material-icons" style={{ fontSize: '1rem' }}>check</i>
            </div>
            <div>
              <div className="fw-bold mb-1" style={{ color: '#58a700' }}>Translation:</div>
              <p className="mb-0" style={{ lineHeight: 1.5, color: '#6c757d', fontSize: '0.92rem', fontWeight: 400 }}>{translation}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="text-muted small d-flex align-items-center" style={{ 
        color: '#6c757d',
        fontSize: '0.8rem',
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '12px',
        padding: '8px 14px',
        marginTop: '12px'
      }}>
        <span className="d-flex align-items-center justify-content-center me-2" style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: isOverLimit ? '#fee2e2' : '#e8f5e9',
          color: isOverLimit ? '#dc3545' : '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '0.9rem' }}>
            {isOverLimit ? 'warning' : 'tips_and_updates'}
          </i>
        </span>
        <span style={{ color: '#6c757d', fontSize: '0.92rem', fontWeight: 400 }}>
          {isOverLimit 
            ? `Please reduce your text to ${maxLength} characters or less`
            : `Enter your argument in English, then translate to practice ${languageLabel}${enableVoice ? ' (voice input available)' : ''}`
          }
        </span>
      </div>
    </motion.div>
  );
};

export default ArgumentInput;