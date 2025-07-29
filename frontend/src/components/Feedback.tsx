import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
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

  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#e0e7ff' : '#333';
  const mutedColor = isDark ? '#a5b4fc' : '#6c757d';
  const primaryColor = isDark ? '#58cc02' : '#3caa3c';
  const secondaryColor = isDark ? '#d7f7c8' : '#c8f4b8';
  const tertiaryColor = isDark ? '#3caa3c' : '#58cc02';

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

  const getScoreIcon = (score: number): string => {
    if (score >= 8) return 'emoji_events';
    if (score >= 5) return 'thumb_up';
    return 'thumb_down';
  };

  return (
    <div>
      {feedback ? (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(88, 204, 2, 0.08)',
            border: '1px solid rgba(88, 204, 2, 0.12)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <i className="material-icons" style={{ 
                color: '#58cc02', 
                fontSize: '24px',
                marginTop: '2px'
              }}>
                rate_review
              </i>
              <div style={{ 
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: textColor,
                whiteSpace: 'pre-wrap',
                flex: 1
              }}>
                {feedback}
              </div>
            </div>
          </div>
          
          {score !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(88, 204, 2, 0.08)',
                border: '1px solid rgba(88, 204, 2, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#58cc02',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="material-icons" style={{ fontSize: '20px' }}>
                    psychology
                  </i>
                  Persuasiveness Score
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: getScoreColor(score),
                  boxShadow: '0 4px 12px rgba(88, 204, 2, 0.15)',
                  border: '2px solid rgba(88, 204, 2, 0.2)',
                  position: 'relative'
                }}>
                  {score}/10
                  <i className="material-icons" style={{ 
                    position: 'absolute',
                    right: '-8px',
                    top: '-8px',
                    background: 'white',
                    borderRadius: '50%',
                    padding: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    color: getScoreColor(score),
                    fontSize: '20px'
                  }}>
                    {getScoreIcon(score)}
                  </i>
                </div>
              </div>
              <div style={{ 
                flex: 1,
                color: textColor,
                fontSize: '0.95rem',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <i className="material-icons" style={{ 
                  color: getScoreColor(score),
                  fontSize: '24px'
                }}>
                  {score >= 8 ? 'lightbulb' : score >= 6 ? 'tips_and_updates' : 'build'}
                </i>
                <span>
                  {score >= 8 ? (
                    'Excellent! Your argument was highly persuasive and well-crafted.'
                  ) : score >= 6 ? (
                    'Good job! Your argument was persuasive, with room for improvement.'
                  ) : score >= 4 ? (
                    'Fair attempt. Try to strengthen your key points and address counterarguments.'
                  ) : (
                    'Your argument needs more development. Consider using more persuasive techniques.'
                  )}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <p style={{ 
            marginBottom: '16px', 
            color: mutedColor, 
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <i className="material-icons" style={{ fontSize: '20px', opacity: 0.8 }}>
              {userArgument ? 'assessment' : 'edit_note'}
            </i>
            {userArgument ? 'Ready to evaluate your argument?' : 'Enter your argument to evaluate persuasiveness'}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!userArgument || loading || disabled}
            onClick={onEvaluate}
            style={{
              background: '#58cc02',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 36px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: !userArgument || loading || disabled ? 'not-allowed' : 'pointer',
              opacity: !userArgument || loading || disabled ? 0.7 : 1,
              boxShadow: '0 4px 0 #3caa3c',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <i className="material-icons" style={{ fontSize: '20px' }}>
              {loading ? 'hourglass_top' : 'analytics'}
            </i>
            {loading ? 'Evaluating...' : 'Evaluate Persuasiveness'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Feedback; 