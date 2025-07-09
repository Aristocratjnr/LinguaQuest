import React from 'react';
import logo from '../assets/images/logo.png';

type OnboardingProps = {
  show: boolean;
  onStart: () => void;
  playClick: () => void;
};

const Onboarding: React.FC<OnboardingProps> = ({ show, onStart, playClick }) => {
  if (!show) return null;
  return (
    <div className="lq-onboarding">
      <header className="lq-header">
        <img src={logo} alt="LinguaQuest Logo" className="lq-logo" />
        <h1>LinguaQuest</h1>
      </header>
      <div className="lq-card lq-onboarding-card">
        <h2>Welcome to LinguaQuest!</h2>
        <p>Persuade the AI character in their native language. Each round, you’ll be given a scenario and must craft a convincing argument within 30 seconds. Use the translation and tone tools to help you. Try to win all 5 rounds!</p>
        <button className="lq-btn lq-btn-scenario" onClick={() => { onStart(); playClick(); }}>Start Game</button>
      </div>
    </div>
  );
};

export default Onboarding; 