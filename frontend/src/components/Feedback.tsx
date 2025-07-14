import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useActivityFeed } from './ActivityFeedContext';

type FeedbackProps = {
  feedback: string;
  score: number | null;
  loading: boolean;
  disabled: boolean;
  onEvaluate: () => void;
  userArgument: string;
};

const Feedback: React.FC<FeedbackProps> = ({ 
  feedback, 
  score, 
  loading, 
  disabled, 
  onEvaluate, 
  userArgument 
}) => {
  const { addActivity } = useActivityFeed();

  useEffect(() => {
    if (score !== null) {
      addActivity({ type: 'system', message: `Argument evaluated. Score: ${score}.` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#58a700'; // Duolingo green
    if (score >= 5) return '#ffb800'; // Yellow
    return '#ff3b30'; // Red
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 8) return '🎯';
    if (score >= 5) return '👍';
    return '👎';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Evaluate Button */}
      <motion.button
        className="btn w-100 mb-4 py-3 d-flex align-items-center justify-content-center"
        onClick={onEvaluate}
        disabled={loading || !userArgument || disabled}
        style={{ 
          backgroundColor: loading ? '#cccccc' : '#58a700',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: loading ? 'none' : '0 4px 0 rgba(88, 167, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
        whileHover={!loading && !disabled ? { 
          y: -2,
          boxShadow: '0 6px 0 rgba(88, 167, 0, 0.2)'
        } : {}}
        whileTap={!loading && !disabled ? { 
          y: 2,
          boxShadow: '0 2px 0 rgba(88, 167, 0, 0.2)'
        } : {}}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Analyzing...
          </>
        ) : (
          <>
            <i className="material-icons align-middle me-2">analytics</i>
            Evaluate Persuasiveness
          </>
        )}
      </motion.button>

      {/* Feedback Section */}
      {feedback && (
        <motion.div 
          className="p-4 mb-4 rounded-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          style={{ 
            backgroundColor: '#f8f9fa',
            borderLeft: '4px solid #58a700'
          }}
        >
          <div className="d-flex align-items-start gap-3">
            <div className="d-flex align-items-center justify-content-center" style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#e8f5e9',
              color: '#58a700',
              flexShrink: 0
            }}>
              <i className="material-icons" style={{ fontSize: '1.2rem' }}>feedback</i>
            </div>
            <div>
              <div className="fw-bold mb-2" style={{ color: '#58a700' }}>AI Feedback</div>
              <p className="mb-0" style={{ lineHeight: 1.5, color: '#333' }}>{feedback}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Score Section */}
      {score !== null && (
        <motion.div 
          className="p-4 rounded-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ 
            backgroundColor: '#f8f9fa',
            borderLeft: '4px solid ' + getScoreColor(score)
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center" style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#e8f5e9',
                color: getScoreColor(score),
                fontSize: '1.5rem'
              }}>
                {getScoreEmoji(score)}
              </div>
              <div>
                <div className="fw-bold" style={{ color: '#58a700' }}>Persuasiveness Score</div>
                <div className="small text-muted">How convincing your argument was</div>
              </div>
            </div>
            <div className="display-4 fw-bold" style={{ color: getScoreColor(score) }}>
              {score}
              <span className="fs-6 text-muted">/10</span>
            </div>
          </div>

          <div className="progress" style={{ height: '12px', borderRadius: '6px' }}>
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ 
                width: `${score*10}%`, 
                backgroundColor: getScoreColor(score),
                borderRadius: '6px'
              }}
              aria-valuenow={score} 
              aria-valuemin={0} 
              aria-valuemax={10}
            />
          </div>

          <div className="d-flex justify-content-between mt-2 small text-muted">
            <span>Needs work</span>
            <span>Perfect!</span>
          </div>
        </motion.div>
      )}

      {/* Help Text */}
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
        The AI evaluates how persuasive your argument is based on structure and content
      </div>
    </motion.div>
  );
};

export default Feedback;