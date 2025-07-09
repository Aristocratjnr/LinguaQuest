import React from 'react';

type FeedbackProps = {
  feedback: string;
  score: number | null;
  loading: boolean;
  disabled: boolean;
  onEvaluate: () => void;
  userArgument: string;
};

const Feedback: React.FC<FeedbackProps> = ({ feedback, score, loading, disabled, onEvaluate, userArgument }) => (
  <section className="lq-section">
    <button className="lq-btn lq-btn-evaluate" onClick={onEvaluate} disabled={loading || !userArgument || disabled}>
      Evaluate Persuasiveness
    </button>
    {feedback && <div className="lq-feedback"><strong>Feedback:</strong> {feedback}</div>}
    {score !== null && <div className="lq-score"><strong>Score:</strong> {score}</div>}
  </section>
);

export default Feedback; 