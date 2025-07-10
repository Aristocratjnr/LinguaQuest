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

  return (
    <motion.div 
      className="card shadow-sm mb-4"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="card-body p-4">
        <button
          className="btn btn-success btn-lg w-100 mb-4"
          onClick={onEvaluate}
          disabled={loading || !userArgument || disabled}
          style={{ 
            background: loading ? '#ccc' : 'linear-gradient(to right, #10b981, #059669)',
            border: 'none',
            borderRadius: '.75rem',
            padding: '0.75rem 0'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Evaluating...
            </>
          ) : (
            <>
              <i className="material-icons align-middle me-2">analytics</i>
              Evaluate Persuasiveness
            </>
          )}
        </button>
        
        {feedback && (
          <div className="alert alert-primary" role="alert">
            <div className="d-flex">
              <div>
                <i className="material-icons me-3" style={{ fontSize: '2rem' }}>feedback</i>
              </div>
              <div>
                <h5 className="alert-heading">Feedback</h5>
                <p className="mb-0">{feedback}</p>
              </div>
            </div>
          </div>
        )}
        
        {score !== null && (
          <div className="bg-light p-3 rounded-3 d-flex align-items-center">
            <div className="me-3">
              <i className="material-icons" style={{ fontSize: '2.5rem', color: getScoreColor(score) }}>equalizer</i>
            </div>
            <div>
              <h6 className="mb-1">Your persuasiveness score</h6>
              <div className="progress" style={{ height: '20px', width: '200px' }}>
                <div 
                  className="progress-bar progress-bar-striped" 
                  role="progressbar" 
                  style={{ 
                    width: `${score*10}%`, 
                    backgroundColor: getScoreColor(score) 
                  }} 
                  aria-valuenow={score} 
                  aria-valuemin={0} 
                  aria-valuemax={10}
                >
                  {score}/10
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Helper function for score colors
const getScoreColor = (score: number): string => {
  if (score >= 8) return '#10b981'; // Green for high scores
  if (score >= 5) return '#f59e0b'; // Orange for medium scores
  return '#ef4444'; // Red for low scores
};

export default Feedback;