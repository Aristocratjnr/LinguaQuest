import React, { useState } from 'react';

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

  return (
    <section className="lq-section">
      <label className="lq-label">
        Your Argument (in English):
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <textarea
            value={userArgument}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="lq-textarea"
            disabled={loading || disabled}
            style={{ flex: 1 }}
          />
          {enableVoice && (
            <button
              type="button"
              className={`lq-btn lq-btn-translate${listening ? ' lq-btn-selected' : ''}`}
              style={{ minWidth: 44, minHeight: 44, borderRadius: '50%' }}
              onClick={handleVoiceInput}
              disabled={loading || disabled || listening}
              title="Speak your argument"
            >
              {listening ? '🎤...' : '🎤'}
            </button>
          )}
        </div>
      </label>
      <button className="lq-btn lq-btn-translate" onClick={onTranslate} disabled={loading || !userArgument || disabled}>
        Translate to {language.toUpperCase()}
      </button>
      {translation && <div className="lq-translation"><strong>Translation:</strong> {translation}</div>}
    </section>
  );
};

export default ArgumentInput; 