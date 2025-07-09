import React from 'react';

type AIResponseProps = {
  aiResponse: string;
  newStance: string;
  loading: boolean;
  disabled: boolean;
  onDialogue: () => void;
  userArgument: string;
};

const AIResponse: React.FC<AIResponseProps> = ({ aiResponse, newStance, loading, disabled, onDialogue, userArgument }) => (
  <section className="lq-section">
    <button className="lq-btn lq-btn-dialogue" onClick={onDialogue} disabled={loading || !userArgument || disabled}>
      Get AI Response
    </button>
    {aiResponse && <div className="lq-ai-response"><strong>AI Response:</strong> {aiResponse}</div>}
    {newStance && <div className="lq-ai-stance"><strong>AI Stance:</strong> {newStance}</div>}
  </section>
);

export default AIResponse; 