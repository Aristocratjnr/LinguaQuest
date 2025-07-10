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
    className="card shadow-sm mb-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <div className="card-header d-flex justify-content-between align-items-center py-3" 
         style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
      <h5 className="mb-0 d-flex align-items-center" style={{ color: '#764ba2' }}>
        <i className="material-icons me-2">record_voice_over</i>
        Communication Tone
      </h5>
      <span className="badge bg-info px-2 py-1">
        {tone}
      </span>
    </div>
    
    <div className="card-body p-4">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="material-icons me-2" style={{ color: '#667eea' }}>tune</i>
          <span style={{ color: '#667eea', fontWeight: 500 }}>Select Tone:</span>
        </div>
        
        <div className="input-group" style={{ maxWidth: '200px' }}>
          <select
            value={tone}
            onChange={e => onChange(e.target.value)}
            className="form-select"
            disabled={loading || disabled}
            aria-label="Select tone"
            style={{ 
              borderRadius: '0.5rem 0 0 0.5rem',
              borderColor: '#d6d3e8',
              background: disabled ? '#f2f2f2' : '#f8f6fc'
            }}
          >
            {tones.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="input-group-text" style={{ 
            borderRadius: '0 0.5rem 0.5rem 0',
            background: '#667eea',
            borderColor: '#667eea',
            color: 'white'
          }}>
            <i className="material-icons" style={{ fontSize: '1.1rem' }}>
              {loading ? 'hourglass_empty' : 'check_circle'}
            </i>
          </span>
        </div>
      </div>
      
      <div className="alert alert-light mt-3 mb-0 d-flex align-items-start">
        <i className="material-icons me-2 mt-1" style={{ color: '#667eea' }}>lightbulb</i>
        <div className="small">
          <strong>Tip:</strong> Your chosen tone affects how your argument is perceived. 
          Choose a tone that best fits your persuasive strategy.
        </div>
      </div>
    </div>
    
    <div className="card-footer py-2 text-center text-muted small" 
         style={{ background: 'rgba(118, 75, 162, 0.05)' }}>
      <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>info</i>
      Different tones work better in different scenarios
    </div>
  </motion.div>
);

export default ToneSelector;