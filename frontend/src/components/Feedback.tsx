import React, { useEffect } from 'react';
import { useActivityFeed } from './ActivityFeedContext';

type FeedbackProps = {
  feedback: string;
  score: number | null;
  loading: boolean;
  disabled: boolean;
  onEvaluate: () => void;
  userArgument: string;
};

const Feedback: React.FC<FeedbackProps> = ({ feedback, score, loading, disabled, onEvaluate, userArgument }) => {
  const { addActivity } = useActivityFeed();

  useEffect(() => {
    if (score !== null) {
      addActivity({ type: 'system', message: `Argument evaluated. Score: ${score}.` });
    }
    // Only run when score changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <section className="lq-section">
      <div className="lq-card" style={{ padding: '1.5rem 2rem', boxShadow: '0 4px 24px #a78bfa33', border: '1px solid #f3e8ff', margin: 0 }}>
        <button
          className="lq-btn lq-btn-evaluate w-full mb-4"
          onClick={onEvaluate}
          disabled={loading || !userArgument || disabled}
          style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderRadius: 12 }}
        >
          {loading ? 'Evaluating...' : 'Evaluate Persuasiveness'}
        </button>
        {feedback && (
          <div className="lq-feedback mt-2 text-purple-800 bg-purple-50 border border-purple-200 rounded-lg p-3 text-base">
            <span className="font-semibold">Feedback:</span> <span className="text-gray-800">{feedback}</span>
          </div>
        )}
        {score !== null && (
          <div className="lq-score mt-2 text-indigo-600 font-bold text-lg flex items-center gap-2">
            <span>Score:</span> <span className="text-gray-800 font-semibold">{score}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Feedback; 