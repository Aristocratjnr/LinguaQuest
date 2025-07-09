import React from 'react';

type ArgumentInputProps = {
  userArgument: string;
  onChange: (val: string) => void;
  loading: boolean;
  disabled: boolean;
  onTranslate: () => void;
  translation: string;
  language: string;
};

const ArgumentInput: React.FC<ArgumentInputProps> = ({ userArgument, onChange, loading, disabled, onTranslate, translation, language }) => (
  <section className="lq-section">
    <label className="lq-label">
      Your Argument (in English):
      <textarea
        value={userArgument}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="lq-textarea"
        disabled={loading || disabled}
      />
    </label>
    <button className="lq-btn lq-btn-translate" onClick={onTranslate} disabled={loading || !userArgument || disabled}>
      Translate to {language.toUpperCase()}
    </button>
    {translation && <div className="lq-translation"><strong>Translation:</strong> {translation}</div>}
  </section>
);

export default ArgumentInput; 