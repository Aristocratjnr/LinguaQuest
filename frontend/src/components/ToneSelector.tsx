import React from 'react';
import { motion } from 'framer-motion';

type ToneSelectorProps = {
  tone: string;
  onChange: (val: string) => void;
  loading: boolean;
  disabled: boolean;
  tones: string[];
};

const ToneSelector: React.FC<ToneSelectorProps> = ({ tone, onChange, loading, disabled, tones }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Header */}
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
          <i className="material-icons" style={{ fontSize: '1.2rem' }}>record_voice_over</i>
        </span>
        Communication Style
      </h5>
      <span className="badge px-3 py-1 d-flex align-items-center" style={{ 
        backgroundColor: '#e8f5e9',
        color: '#58a700',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.85rem'
      }}>
        {tone.charAt(0).toUpperCase() + tone.slice(1)}
      </span>
    </div>

    {/* Tone Selection */}
    <div className="mb-4">
      <div className="d-flex align-items-center mb-3">
        <label className="form-label mb-0 me-3 d-flex align-items-center" style={{ 
          color: '#6c757d',
          fontWeight: 500,
          fontSize: '0.9rem'
        }}>
          <i className="material-icons me-2" style={{ 
            fontSize: '1.1rem',
            color: '#58a700'
          }}>tune</i>
          Select Style:
        </label>
        
        <div className="input-group" style={{ maxWidth: '220px' }}>
          <select
            value={tone}
            onChange={e => onChange(e.target.value)}
            className="form-select form-select-sm"
            disabled={loading || disabled}
            aria-label="Select tone"
            style={{
              borderRadius: '12px 0 0 12px',
              border: '1px solid #dee2e6',
              boxShadow: 'none',
              fontSize: '0.9rem',
              backgroundColor: disabled ? '#f8f9fa' : 'white'
            }}
          >
            {tones.map(t => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <span className="input-group-text" style={{ 
            borderRadius: '0 12px 12px 0',
            backgroundColor: '#58a700',
            borderColor: '#58a700',
            color: 'white'
          }}>
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>
              {loading ? 'hourglass_empty' : 'check_circle'}
            </i>
          </span>
        </div>
      </div>

      {/* Tone Cards */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {tones.map((t) => (
          <motion.button
            key={t}
            type="button"
            className={`btn ${tone === t ? 'btn-success' : 'btn-outline-secondary'} px-3 py-2`}
            onClick={() => onChange(t)}
            disabled={loading || disabled}
            style={{
              borderRadius: '12px',
              border: tone === t ? 'none' : '1px solid #dee2e6',
              fontWeight: 500,
              fontSize: '0.85rem',
              textTransform: 'capitalize'
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* Tip Box */}
      <div className="p-3 rounded-3 d-flex align-items-start gap-3" style={{ 
        backgroundColor: '#e8f5e9',
        borderLeft: '4px solid #58a700'
      }}>
        <div className="d-flex align-items-center justify-content-center mt-1" style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#58a700',
          color: 'white',
          flexShrink: 0
        }}>
          <i className="material-icons" style={{ fontSize: '1rem' }}>lightbulb</i>
        </div>
        <div>
          <div className="fw-bold mb-1" style={{ color: '#58a700' }}>Pro Tip:</div>
          <p className="mb-0 small" style={{ color: '#333' }}>
            Your communication style affects how your argument is perceived. 
            Choose one that best fits your persuasive strategy.
          </p>
        </div>
      </div>
    </div>

    {/* Help Text */}
    <div className="text-muted small d-flex align-items-center" style={{ 
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
      Different styles work better in different scenarios
    </div>
  </motion.div>
);

export default ToneSelector;