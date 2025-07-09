import React from 'react';

type ToneSelectorProps = {
  tone: string;
  onChange: (val: string) => void;
  loading: boolean;
  disabled: boolean;
  tones: string[];
};

const ToneSelector: React.FC<ToneSelectorProps> = ({ tone, onChange, loading, disabled, tones }) => (
  <section className="lq-section">
    <label className="lq-label">
      Tone:
      <select value={tone} onChange={e => onChange(e.target.value)} className="lq-select" disabled={loading || disabled}>
        {tones.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </label>
  </section>
);

export default ToneSelector; 