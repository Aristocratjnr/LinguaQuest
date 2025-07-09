import React from 'react';

type ScenarioProps = {
  scenario: string;
  language: string;
  loading: boolean;
  onLanguageChange: (lang: string) => void;
  languages: { code: string; label: string }[];
};

const Scenario: React.FC<ScenarioProps> = ({ scenario, language, loading, onLanguageChange, languages }) => (
  <section className="lq-section">
    <div className="lq-label">Scenario <span className="lq-lang">({language.toUpperCase()})</span>:</div>
    <div className="lq-scenario">{scenario}</div>
    <label className="lq-label">
      Language:
      <select value={language} onChange={e => onLanguageChange(e.target.value)} className="lq-select" disabled={loading}>
        {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  </section>
);

export default Scenario; 