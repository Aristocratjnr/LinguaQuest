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

const ArgumentInput: React.FC<ArgumentInputProps> = ({ userArgument, onChange, loading, disabled, onTranslate, translation, language, enableVoice }) => {
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
    <section className="lq-section">
      <motion.div
        className="lq-card"
        style={{ padding: '1.5rem 2rem', boxShadow: '0 4px 24px #764ba233', border: '1px solid #e0e7ff', margin: 0 }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <label className="lq-label text-lg font-semibold mb-2" style={{ color: '#764ba2' }}>
          Your Argument (in English):
        </label>
        <div className="flex items-start gap-4 mb-4">
          <textarea
            value={userArgument}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="lq-textarea flex-1 text-base"
            disabled={loading || disabled}
            style={{ minHeight: 80, fontSize: '1.05rem', border: '1.5px solid #764ba2', background: '#f8f6fc', borderRadius: 10, boxShadow: '0 2px 8px #764ba233' }}
            placeholder="Type your argument here..."
          />
          {enableVoice && (
            <motion.button
              type="button"
              className={`lq-btn lq-btn-translate flex items-center justify-center ml-2${listening ? ' lq-btn-selected' : ''}`}
              style={{ minWidth: 48, minHeight: 48, borderRadius: '50%', fontSize: 24, boxShadow: '0 2px 8px #22d3ee33', border: listening ? '2px solid #22d3ee' : '2px solid transparent', transition: 'border 0.2s' }}
              onClick={handleVoiceInput}
              disabled={loading || disabled || listening}
              title="Speak your argument"
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {listening ? '🎤...' : '🎤'}
            </motion.button>
          )}
        </div>
        <button
          className="lq-btn lq-btn-translate w-full mb-3"
          onClick={handleTranslate}
          disabled={loading || !userArgument || disabled}
          style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderRadius: 12 }}
        >
          Translate to {language.toUpperCase()}
        </button>
        {translation && (
          <div className="lq-translation mt-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            <span className="font-semibold">Translation:</span> <span className="text-gray-800">{translation}</span>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ArgumentInput; 