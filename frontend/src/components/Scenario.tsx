import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'framer-motion';

type ScenarioProps = {
  scenario: string;
  language: string;
  loading: boolean;
  onLanguageChange: (lang: string) => void;
  languages: { code: string; label: string }[];
  error?: string;
};

const Scenario: React.FC<ScenarioProps> = ({ 
  scenario, 
  language, 
  loading, 
  onLanguageChange, 
  languages,
  error
}) => {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === 'dark';
  const textColor = 'var(--lq-text-main)';
  const mutedColor = isDark ? '#a5b4fc' : 'var(--lq-text-muted)';
  const currentLanguage = languages.find(l => l.code === language);
  const languageLabel = currentLanguage?.label || language.toUpperCase();

  return (
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
            {languageLabel}
          </span>
        </div>
      </div>

      {/* Scenario content box */}
      <div className="p-4 mb-4 rounded-3" style={{ 
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        borderRadius: '16px'
      }}>
        {error ? (
          <div className="text-center py-3">
            <div className="d-flex align-items-center justify-content-center mb-2" style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc3545',
              margin: '0 auto'
            }}>
              <i className="material-icons" style={{ fontSize: '1.5rem' }}>error_outline</i>
            </div>
            <p className="text-danger mb-2" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Failed to load scenario
            </p>
            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
              {error}
            </p>
          </div>
        ) : loading ? (
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
          <div>
            <p className="mb-0 lh-lg" style={{ 
              fontSize: '1.05rem',
              color: textColor,
              lineHeight: '1.6',
              fontFamily: 'Noto Sans, Arial Unicode MS, system-ui, sans-serif',
            }}>
              {scenario || 'No scenario available. Please try refreshing or selecting a different category.'}
            </p>
            {scenario && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <div className="d-flex align-items-center text-muted small">
                  <i className="material-icons me-2" style={{ fontSize: '1rem', color: '#58a700' }}>info</i>
                  <span style={{ fontSize: '0.85rem' }}>
                    Read carefully and think about your response in {languageLabel}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Language selector */}
      <div className="d-flex flex-column gap-2">
        <div className="d-flex align-items-center">
          <label className="form-label mb-0 me-2 d-flex align-items-center" style={{ 
            color: 'var(--lq-text-muted)',
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
            aria-label="Select practice language"
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
          <span 
            className="d-flex align-items-center justify-content-center" 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: loading ? '#fff3cd' : error ? '#fee2e2' : '#e8f5e9',
              color: loading ? '#ffc107' : error ? '#dc3545' : '#58a700'
            }}
            title={loading ? 'Loading...' : error ? 'Error occurred' : 'Ready'}
          >
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>
              {loading ? 'hourglass_empty' : error ? 'error' : 'check_circle'}
            </i>
          </span>
        </div>
      </div>

      {/* Help text */}
      <div className="text-muted small mt-3 d-flex align-items-center" style={{ 
        color: mutedColor,
        fontSize: '0.8rem',
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '16px',
        padding: '10px 16px',
        marginTop: '12px'
      }}>
        <span className="d-flex align-items-center justify-content-center me-2" style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#e8f5e9',
          color: '#58a700'
        }}>
          <i className="material-icons" style={{ fontSize: '0.9rem' }}>tips_and_updates</i>
        </span>
        <span style={{ color: mutedColor, fontSize: '0.92rem', fontWeight: 400 }}>
          Switch languages to practice different linguistic contexts and cultural perspectives
        </span>
      </div>
    </motion.div>
  );
};

export default Scenario;