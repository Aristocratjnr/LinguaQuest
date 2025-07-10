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
    <div className="lq-card" style={{ padding: '1.5rem 2rem', boxShadow: '0 4px 24px #667eea22', border: '1px solid #e0e7ff', margin: 0 }}>
      <div className="lq-label text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#764ba2' }}>
        Scenario <span className="lq-lang text-blue-600 text-base">({language.toUpperCase()})</span>:
      </div>
      <div className="lq-scenario text-base text-gray-800 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 shadow-sm">
        {scenario}
      </div>
      <label className="lq-label text-base font-medium mb-1" style={{ color: '#667eea' }}>
        Language:
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          className="lq-select ml-2 px-3 py-2 rounded-md border-2 border-blue-200 focus:border-blue-500 focus:outline-none bg-white text-gray-800 transition-all"
          disabled={loading}
          style={{ minWidth: 120 }}
        >
          {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>
    </div>
  </section>
);

export default Scenario; 