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
    <div className="lq-onboarding flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="lq-card lq-onboarding-card" style={{ maxWidth: 480, margin: '2rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px #764ba233', padding: '2.5rem 2.5rem', textAlign: 'center' }}>
        <header className="flex flex-col items-center mb-4">
          <img src={logo} alt="LinguaQuest Logo" className="lq-logo mb-2" style={{ height: 56 }} />
          <h1 className="text-3xl font-extrabold" style={{ color: '#764ba2', letterSpacing: 1 }}>LinguaQuest</h1>
        </header>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#667eea' }}>Welcome to LinguaQuest!</h2>
        <p className="text-gray-700 mb-6 text-base leading-relaxed">
          Persuade the AI character in their native language. Each round, you’ll be given a scenario and must craft a convincing argument within 30 seconds.<br />
          Use the translation and tone tools to help you. Try to win all 5 rounds!
        </p>
        <button
          className="lq-btn lq-btn-scenario w-full mt-2"
          style={{ fontSize: '1.15rem', padding: '0.85rem 0', borderRadius: 14, fontWeight: 700, letterSpacing: 0.5 }}
          onClick={() => { onStart(); playClick(); }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default Onboarding; 