import React from 'react';
import { motion } from 'framer-motion';

type ScenarioProps = {
  scenario: string;
  language: string;
  loading: boolean;
  onLanguageChange: (lang: string) => void;
  languages: { code: string; label: string }[];
};

const Scenario: React.FC<ScenarioProps> = ({ 
  scenario, 
  language, 
  loading, 
  onLanguageChange, 
  languages 
}) => (
  <motion.div 
    className="mb-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="d-flex justify-content-between align-items-center mb-3" style={{ minHeight: 36 }}>
      <h5 className="mb-0 d-flex align-items-center" style={{ color: '#764ba2', fontWeight: 600 }}>
        <i className="material-icons me-2">description</i>
        Scenario
      </h5>
      <span className="badge bg-primary px-3 py-2" style={{ fontSize: '1rem', letterSpacing: '.01em' }}>
        {language.toUpperCase()}
      </span>
    </div>
    <div className="bg-light p-4 rounded-3 mb-4 border-start border-primary border-4" 
         style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
      <p className="mb-0 lh-lg" style={{ fontSize: '1.05rem' }}>
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading scenario...</p>
          </div>
        ) : (
          scenario
        )}
      </p>
    </div>
    <div className="d-flex align-items-center mb-2">
      <label className="form-label mb-0 me-3 d-flex align-items-center" style={{ color: '#667eea', fontWeight: 500 }}>
        <i className="material-icons me-2" style={{ fontSize: '1.2rem' }}>translate</i>
        Language:
      </label>
      <div className="input-group" style={{ maxWidth: '200px' }}>
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          className="form-select"
          disabled={loading}
          aria-label="Select language"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span className="input-group-text">
          <i className="material-icons" style={{ fontSize: '1.1rem' }}>
            {loading ? 'hourglass_empty' : 'check_circle'}
          </i>
        </span>
      </div>
    </div>
    <div className="text-center text-muted small mt-2" style={{ color: '#6c6f7d' }}>
      <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>info</i>
      Switch languages to practice different linguistic contexts
    </div>
  </motion.div>
);

export default Scenario;