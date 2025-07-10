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

const AIResponse: React.FC<AIResponseProps> = ({ aiResponse, newStance, loading, disabled, onDialogue, userArgument, enableVoice }) => {
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
    <section className="lq-section">
      <motion.div
        className="lq-card"
        style={{ padding: '1.5rem 2rem', boxShadow: '0 4px 24px #764ba233', border: '1px solid #e0e7ff', margin: 0 }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button
          className="lq-btn lq-btn-dialogue w-full mb-4"
          onClick={onDialogue}
          disabled={loading || !userArgument || disabled}
          style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderRadius: 12 }}
        >
          {loading ? 'Loading...' : 'Get AI Response'}
        </button>
        {aiResponse && (
          <div className="lq-ai-response flex items-start gap-4 mt-4" style={{ fontSize: '1.1rem', border: '1px solid #667eea22', boxShadow: '0 2px 8px #667eea22', borderRadius: 10, background: '#f5f8ff' }}>
            <div className="flex-1">
              <div className="font-semibold text-blue-700 mb-1">AI Response</div>
              <div className="text-gray-800 leading-relaxed">{aiResponse}</div>
            </div>
            {enableVoice && (
              <motion.button
                type="button"
                className={`lq-btn lq-btn-translate flex items-center justify-center ml-2${speaking ? ' lq-btn-selected' : ''}`}
                style={{ minWidth: 48, minHeight: 48, borderRadius: '50%', fontSize: 24, boxShadow: '0 2px 8px #22d3ee33', border: speaking ? '2px solid #22d3ee' : '2px solid transparent', transition: 'border 0.2s' }}
                onClick={handleSpeak}
                disabled={speaking}
                title="Hear AI response"
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {speaking ? '🔊...' : '🔊'}
              </motion.button>
            )}
          </div>
        )}
        {newStance && (
          <div className="lq-ai-stance mt-4 text-orange-500 font-bold text-lg flex items-center gap-2">
            <span>AI Stance:</span> <span className="text-gray-800 font-semibold">{newStance}</span>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default AIResponse; 