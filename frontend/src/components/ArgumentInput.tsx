import React, { useState } from 'react';
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
  enableVoice?: boolean;
};

const ArgumentInput: React.FC<ArgumentInputProps> = ({ 
  userArgument, 
  onChange, 
  loading, 
  disabled, 
  onTranslate, 
  translation, 
  language, 
  enableVoice 
}) => {
  const [listening, setListening] = useState(false);
  let recognition: any = null;
  const { addActivity } = useActivityFeed();

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      setListening(false);
      addActivity({ type: 'action', message: 'Used voice input for argument' });
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const handleTranslate = () => {
    addActivity({ type: 'action', message: 'Submitted an argument.' });
    onTranslate();
  };

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
          English
        </span>
      </div>

      {/* Input Area */}
      <div className="position-relative mb-3">
        <textarea
          value={userArgument}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="form-control"
          disabled={loading || disabled}
          style={{ 
            minHeight: 120, 
            resize: 'vertical',
            backgroundColor: '#f8f9fa',
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '1rem',
            lineHeight: 1.5,
            boxShadow: 'none',
            transition: 'all 0.2s ease'
          }}
          placeholder="Type your argument here..."
        />
        <div className="position-absolute bottom-0 end-0 me-3 mb-2 d-flex gap-2">
          {enableVoice && (
            <motion.button
              type="button"
              className={`btn ${listening ? 'btn-success' : 'btn-outline-secondary'} p-2 d-flex align-items-center justify-content-center`}
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                border: 'none'
              }}
              onClick={handleVoiceInput}
              disabled={loading || disabled || listening}
              title="Speak your argument"
              whileTap={{ scale: 0.85 }}
              whileHover={{ backgroundColor: listening ? '#28a745' : '#f1f1f1' }}
            >
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
            borderRadius: '12px'
          }}>
            {userArgument.length}/500
          </div>
        </div>
      </div>

      {/* Translate Button */}
      <motion.button
        className="btn w-100 mb-3 py-3 d-flex align-items-center justify-content-center"
        onClick={handleTranslate}
        disabled={loading || !userArgument || disabled}
        style={{ 
          backgroundColor: loading ? '#cccccc' : '#58a700',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: loading ? 'none' : '0 4px 0 rgba(88, 167, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
        whileHover={!loading && !disabled ? { 
          y: -2,
          boxShadow: '0 6px 0 rgba(88, 167, 0, 0.2)'
        } : {}}
        whileTap={!loading && !disabled ? { 
          y: 2,
          boxShadow: '0 2px 0 rgba(88, 167, 0, 0.2)'
        } : {}}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Translating...
          </>
        ) : (
          <>
            <i className="material-icons align-middle me-2">translate</i>
            Translate to {language.toUpperCase()}
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
            backgroundColor: '#e8f5e9',
            borderRadius: '16px',
            // Removed borderLeft
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
        fontSize: '0.8rem'
      }}>
        <span className="d-flex align-items-center justify-content-center me-2" style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#e8f5e9',
          color: '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '0.9rem' }}>info</i>
        </span>
        Enter your argument in English, then translate it to practice
      </div>
    </motion.div>
  );
};

export default ArgumentInput;