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
    <div className="lq-card" style={{ padding: '1.5rem 2rem', boxShadow: '0 4px 24px #22d3ee22', border: '1px solid #e0e7ff', margin: 0 }}>
      <label className="lq-label text-base font-medium mb-1" style={{ color: '#22d3ee' }}>
        Tone:
        <select
          value={tone}
          onChange={e => onChange(e.target.value)}
          className="lq-select ml-2 px-3 py-2 rounded-md border-2 border-cyan-200 focus:border-cyan-500 focus:outline-none bg-white text-gray-800 transition-all"
          disabled={loading || disabled}
          style={{ minWidth: 120 }}
        >
          {tones.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
    </div>
  </section>
);

export default ToneSelector; 