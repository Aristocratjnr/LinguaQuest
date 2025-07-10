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
      className="card shadow-sm mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="card-header d-flex justify-content-between align-items-center py-3" 
           style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
        <h5 className="mb-0 d-flex align-items-center" style={{ color: '#764ba2' }}>
          <i className="material-icons me-2">smart_toy</i>
          AI Response
        </h5>
        <span className="badge bg-info px-2 py-1">
          <i className="material-icons me-1" style={{ fontSize: '0.75rem' }}>psychology</i>
          Language Partner
        </span>
      </div>
      
      <div className="card-body p-4">
        <motion.button
          className="btn btn-primary btn-lg w-100 mb-4"
          onClick={onDialogue}
          disabled={loading || !userArgument || disabled}
          style={{ 
            background: loading ? '#ccc' : 'linear-gradient(to right, #4f46e5, #6366f1)',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.75rem 0',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}
          whileHover={{ boxShadow: '0 6px 15px rgba(99, 102, 241, 0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="material-icons align-middle me-2">chat</i>
              Get AI Response
            </>
          )}
        </motion.button>
        
        {aiResponse && (
          <motion.div 
            className="p-4 rounded-3 position-relative mb-3"
            style={{ 
              background: 'rgba(99, 102, 241, 0.05)', 
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ribbon position-absolute px-3 py-1 bg-primary text-white"
                 style={{ 
                   top: -10, 
                   left: 20, 
                   borderRadius: '.5rem',
                   boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                 }}>
              <i className="material-icons align-text-bottom me-1" style={{ fontSize: '1rem' }}>smart_toy</i>
              AI Response
            </div>
            
            <p className="mb-0 mt-3 lh-lg" style={{ fontSize: '1.05rem' }}>{aiResponse}</p>
            
            {enableVoice && (
              <motion.button
                type="button"
                className={`btn ${speaking ? 'btn-info' : 'btn-outline-info'} rounded-circle position-absolute top-0 end-0 m-3`}
                style={{ width: 42, height: 42 }}
                onClick={handleSpeak}
                disabled={speaking}
                title="Hear AI response"
                whileTap={{ scale: 0.85 }}
              >
                <i className="material-icons">{speaking ? 'volume_up' : 'volume_up'}</i>
              </motion.button>
            )}
          </motion.div>
        )}
        
        {newStance && (
          <motion.div 
            className="alert alert-warning d-flex align-items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <i className="material-icons me-3 fs-4">psychology</i>
            <div>
              <div className="fw-bold">AI Stance:</div>
              <div>{newStance}</div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="card-footer py-2 text-center text-muted small" 
           style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
        <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>info</i>
        The AI will respond to your argument and may change its stance
      </div>
    </motion.div>
  );
};

export default AIResponse;