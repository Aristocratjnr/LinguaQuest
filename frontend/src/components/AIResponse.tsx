import React, { useState } from 'react';

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
      <button className="lq-btn lq-btn-dialogue" onClick={onDialogue} disabled={loading || !userArgument || disabled}>
        Get AI Response
      </button>
      {aiResponse && (
        <div className="lq-ai-response" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong>AI Response:</strong> {aiResponse}
          {enableVoice && (
            <button
              type="button"
              className={`lq-btn lq-btn-translate${speaking ? ' lq-btn-selected' : ''}`}
              style={{ minWidth: 44, minHeight: 44, borderRadius: '50%' }}
              onClick={handleSpeak}
              disabled={speaking}
              title="Hear AI response"
            >
              {speaking ? '🔊...' : '🔊'}
            </button>
          )}
        </div>
      )}
      {newStance && <div className="lq-ai-stance"><strong>AI Stance:</strong> {newStance}</div>}
    </section>
  );
};

export default AIResponse; 