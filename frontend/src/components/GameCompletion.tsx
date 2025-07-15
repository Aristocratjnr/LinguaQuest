import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import StreakDisplay from './StreakDisplay';

interface GameCompletionProps {
  score: number;
  roundsPlayed: number;
  sessionId: string;
  onClose: () => void;
  onPlayAgain: () => void;
}

const GameCompletion: React.FC<GameCompletionProps> = ({
  score,
  roundsPlayed,
  sessionId,
  onClose,
  onPlayAgain,
}) => {
  const { user, userStats, endGameSession, submitScore, incrementStreak, refreshUserStats } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    const submitGameResults = async () => {
      if (!user || isSubmitting) return;

      try {
        setIsSubmitting(true);
        setError(null);

        // Submit the score
        await submitScore({
          score,
          game_session_id: sessionId,
          details: {
            roundsPlayed,
            completedAt: new Date().toISOString(),
          },
        });

        // End the game session
        await endGameSession(sessionId, {
          end_time: new Date().toISOString(),
          total_score: score,
          rounds_played: roundsPlayed,
          status: 'completed',
        });

        // Increment streak and refresh stats
        await incrementStreak();
        await refreshUserStats();
        
        // Show streak animation
        setShowStreak(true);
      } catch (err: any) {
        setError(err.message || 'Failed to submit game results');
        console.error('Game completion error:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitGameResults();
  }, [user, sessionId, score, roundsPlayed]);

  return (
    <motion.div
      className="fixed-top h-100 w-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card shadow-lg"
        style={{
          maxWidth: '90%',
          width: '400px',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="card-header bg-success text-white py-3 text-center">
          <h5 className="mb-0">Challenge Complete!</h5>
        </div>

        <div className="card-body p-4">
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <h2 className="display-4 mb-0">{score}</h2>
                <p className="text-muted">Points earned</p>
              </div>

              <div className="d-flex justify-content-center mb-4">
                <AnimatePresence>
                  {showStreak && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <StreakDisplay size="large" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="stats d-flex justify-content-around mb-4">
                <div>
                  <h6 className="mb-2">Rounds</h6>
                  <span className="h4">{roundsPlayed}</span>
                </div>
                {userStats && (
                  <div>
                    <h6 className="mb-2">Best Score</h6>
                    <span className="h4">{userStats.highest_score}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="d-grid gap-2">
            <button
              className="btn btn-success"
              onClick={onPlayAgain}
              disabled={isSubmitting}
            >
              Play Again
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameCompletion;
