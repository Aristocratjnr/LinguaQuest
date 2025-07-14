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
    {/* Header with language indicator */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0 d-flex align-items-center" style={{ 
        color: '#58a700', 
        fontWeight: 600,
        fontSize: '1.1rem'
      }}>
        <span className="d-flex align-items-center justify-content-center me-2" style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: '#e8f5e9',
          color: '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '1.2rem' }}>description</i>
        </span>
        Challenge Scenario
      </h5>
      <div className="d-flex align-items-center">
        <span className="badge px-3 py-2 d-flex align-items-center" style={{ 
          backgroundColor: '#e8f5e9',
          color: '#58a700',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.85rem'
        }}>
          <i className="material-icons me-1" style={{ fontSize: '1rem' }}>language</i>
          {language.toUpperCase()}
        </span>
      </div>
    </div>

    {/* Scenario content box */}
    <div className="p-4 mb-4 rounded-3" style={{ 
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #58a700',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border text-success" role="status" style={{ 
            width: '1.5rem',
            height: '1.5rem',
            borderWidth: '0.15em'
          }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
            Loading your challenge...
          </p>
        </div>
      ) : (
        <p className="mb-0 lh-lg" style={{ 
          fontSize: '1.05rem',
          color: '#333',
          lineHeight: '1.6'
        }}>
          {scenario}
        </p>
      )}
    </div>

    {/* Language selector */}
    <div className="d-flex flex-column gap-2">
      <div className="d-flex align-items-center">
        <label className="form-label mb-0 me-2 d-flex align-items-center" style={{ 
          color: '#6c757d',
          fontWeight: 500,
          fontSize: '0.9rem'
        }}>
          <i className="material-icons me-2" style={{ 
            fontSize: '1.1rem',
            color: '#58a700'
          }}>translate</i>
          Practice in:
        </label>
      </div>
      <div className="d-flex align-items-center gap-2">
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          className="form-select form-select-sm"
          disabled={loading}
          aria-label="Select language"
          style={{
            borderRadius: '12px',
            border: '1px solid #dee2e6',
            boxShadow: 'none',
            maxWidth: '160px',
            fontSize: '0.9rem'
          }}
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span className="d-flex align-items-center justify-content-center" style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: loading ? '#fff3cd' : '#e8f5e9',
          color: loading ? '#ffc107' : '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '1.1rem' }}>
            {loading ? 'hourglass_empty' : 'check_circle'}
          </i>
        </span>
      </div>
    </div>

    {/* Help text */}
    <div className="text-muted small mt-3 d-flex align-items-center" style={{ 
      color: '#6c757d',
      fontSize: '0.8rem'
    }}>
      <span className="d-flex align-items-center justify-content-center me-2" style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#e8f5e9',
        color: '#58a700'
      }}>
        <i className="material-icons" style={{ fontSize: '0.9rem' }}>info</i>
      </span>
      Switch languages to practice different linguistic contexts
    </div>
  </motion.div>
);

export default Scenario;