import React, { useState } from 'react';
import { motion } from 'framer-motion';

type AIResponseProps = {
  aiResponse: string;
  newStance: string;
  loading: boolean;
  disabled: boolean;
  onDialogue: () => void;
  userArgument: string;
  enableVoice?: boolean;
};

const AIResponse: React.FC<AIResponseProps> = ({ 
  aiResponse, 
  newStance, 
  loading, 
  disabled, 
  onDialogue, 
  userArgument, 
  enableVoice 
}) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    setSpeaking(true);
    const utter = new window.SpeechSynthesisUtterance(aiResponse);
    utter.lang = 'en-US';
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <motion.div 
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
            <i className="material-icons" style={{ fontSize: '1.2rem' }}>smart_toy</i>
          </span>
          AI Partner Response
        </h5>
        <span className="badge px-3 py-1 d-flex align-items-center" style={{ 
          backgroundColor: '#e8f5e9',
          color: '#58a700',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.85rem'
        }}>
          <i className="material-icons me-1" style={{ fontSize: '1rem' }}>psychology</i>
          Language AI
        </span>
      </div>

      {/* Get Response Button */}
      <motion.button
        className="btn w-100 mb-4 py-3 d-flex align-items-center justify-content-center"
        onClick={onDialogue}
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
            Thinking...
          </>
        ) : (
          <>
            <i className="material-icons align-middle me-2">chat</i>
            Get AI Response
          </>
        )}
      </motion.button>
      
      {/* AI Response Bubble */}
      {aiResponse && (
        <motion.div 
          className="p-4 mb-3 rounded-3 position-relative"
          style={{ 
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderLeft: '4px solid #58a700',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            borderRadius: '16px'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* AI Badge */}
          <div className="position-absolute top-0 start-0 px-3 py-1" style={{ 
            backgroundColor: '#58a700',
            color: 'white',
            borderRadius: '0 0 12px 0',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <i className="material-icons align-text-bottom me-1" style={{ fontSize: '1rem' }}>smart_toy</i>
            AI Partner
          </div>
          
          {/* Response Text */}
          <p className="mb-0 mt-4 lh-lg" style={{ 
            fontSize: '1.05rem',
            color: '#333'
          }}>
            {aiResponse}
          </p>
          
          {/* Voice Button */}
          {enableVoice && (
            <motion.button
              type="button"
              className={`btn ${speaking ? 'btn-success' : 'btn-outline-secondary'} rounded-circle position-absolute top-0 end-0 m-3 p-2`}
              style={{ 
                width: 40, 
                height: 40,
                border: 'none'
              }}
              onClick={handleSpeak}
              disabled={speaking}
              title="Hear response"
              whileHover={{ backgroundColor: speaking ? '#28a745' : '#f1f1f1' }}
              whileTap={{ scale: 0.85 }}
            >
              <i className="material-icons" style={{ 
                fontSize: '1.1rem',
                color: speaking ? 'white' : '#58a700'
              }}>
                {speaking ? 'volume_up' : 'volume_up'}
              </i>
            </motion.button>
          )}
        </motion.div>
      )}
      
      {/* Stance Indicator */}
      {newStance && (
        <motion.div 
          className="p-3 rounded-3 d-flex align-items-start gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ 
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div className="d-flex align-items-center justify-content-center mt-1" style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#58a700',
            color: 'white',
            flexShrink: 0
          }}>
            <i className="material-icons" style={{ fontSize: '1rem' }}>psychology</i>
          </div>
          <div>
            <div className="fw-bold mb-1" style={{ color: '#58a700' }}>Current Stance:</div>
            <div style={{ color: '#6c757d', fontSize: '0.92rem', fontWeight: 400 }}>{newStance}</div>
          </div>
        </motion.div>
      )}
      
      {/* Help Text */}
      <div className="text-muted small mt-3 d-flex align-items-center" style={{ 
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
          backgroundColor: '#e8f5e9',
          color: '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '0.9rem' }}>info</i>
        </span>
        The AI will respond to your argument and may change its stance
      </div>
    </motion.div>
  );
};

export default AIResponse;