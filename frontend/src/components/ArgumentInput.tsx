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
      className="card shadow-sm mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="card-header d-flex justify-content-between align-items-center py-3" 
           style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
        <h5 className="mb-0 d-flex align-items-center" style={{ color: '#764ba2' }}>
          <i className="material-icons me-2">edit</i>
          Your Argument
        </h5>
        <span className="badge bg-primary px-2 py-1">
          English
        </span>
      </div>
      
      <div className="card-body p-4">
        <div className="d-flex mb-3">
          <div className="flex-grow-1 position-relative">
            <textarea
              value={userArgument}
              onChange={e => onChange(e.target.value)}
              rows={3}
              className="form-control"
              disabled={loading || disabled}
              style={{ 
                minHeight: 100, 
                resize: 'vertical',
                backgroundColor: '#f8f6fc',
                borderColor: '#d6d3e8',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '1.05rem',
                lineHeight: 1.5
              }}
              placeholder="Type your argument here..."
            />
            <div className="form-text text-end mt-1">
              {userArgument.length} characters
            </div>
          </div>
          
          {enableVoice && (
            <motion.button
              type="button"
              className={`btn ${listening ? 'btn-info' : 'btn-outline-info'} ms-2 d-flex align-items-center justify-content-center`}
              style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                alignSelf: 'flex-start'
              }}
              onClick={handleVoiceInput}
              disabled={loading || disabled || listening}
              title="Speak your argument"
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <i className="material-icons">
                {listening ? 'mic' : 'mic_none'}
              </i>
            </motion.button>
          )}
        </div>
        
        <motion.button
          className="btn btn-primary w-100 mb-3 py-3"
          onClick={handleTranslate}
          disabled={loading || !userArgument || disabled}
          style={{ 
            background: loading ? '#ccc' : 'linear-gradient(to right, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 10px rgba(118, 75, 162, 0.3)'
          }}
          whileHover={{ boxShadow: '0 6px 15px rgba(118, 75, 162, 0.4)' }}
          whileTap={{ scale: 0.98 }}
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
        
        {translation && (
          <motion.div 
            className="alert alert-success d-flex"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <i className="material-icons fs-5 me-2 align-middle">check_circle</i>
            </div>
            <div>
              <div className="fw-bold mb-1">Translation:</div>
              <p className="mb-0" style={{ lineHeight: 1.5 }}>{translation}</p>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="card-footer py-2 text-center text-muted small" 
           style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
        <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>info</i>
        Enter your argument in English, then translate it
      </div>
    </motion.div>
  );
};

export default ArgumentInput;