import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets/images/logo.png';
import avatar from './assets/images/avatar.png';
import Confetti from 'react-confetti';
import successSfx from './assets/sounds/sfx-success.mp3';
import failSfx from './assets/sounds/sfx-failed.mp3';
import clickSfx from './assets/sounds/sfx-button-click.mp3';
import Onboarding from './components/Onboarding';
import Timer from './components/Timer';
import ProgressBar from './components/ProgressBar';
import Scenario from './components/Scenario';
import ArgumentInput from './components/ArgumentInput';
import ToneSelector from './components/ToneSelector';
import Feedback from './components/Feedback';
import AIResponse from './components/AIResponse';
import NicknamePrompt from './components/NicknamePrompt';
import AvatarPicker from './components/AvatarPicker';
import Leaderboard from './components/Leaderboard';
import CategorySelector from './components/CategorySelector';
import Engagement from './components/Engagement';
import WelcomePage from './components/WelcomePage';
import SettingsPage from './components/SettingsPage';
import { useSettings } from './context/SettingsContext';
import { UserProvider, useUser } from './context/UserContext';
import { motion } from 'framer-motion';
import Age from './components/Age';

// Duolingo color palette
const DUOLINGO_COLORS = {
  green: '#58cc02',
  darkGreen: '#3caa3c',
  lightGreen: '#d7f7c8',
  blue: '#1cb0f6',
  orange: '#ff9c1a',
  red: '#ff6b6b',
  purple: '#9b59b6',
  white: '#ffffff',
  lightGray: '#f0f2f5',
  gray: '#e5e5e5',
  darkGray: '#6c6f7d',
  black: '#000000'
};

const TONES = ['polite', 'passionate', 'formal', 'casual'];
const LANGUAGES = [
  { code: 'twi', label: 'Twi' },
  { code: 'gaa', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
];
const TOTAL_ROUNDS = 5;
const ROUND_TIME = 50;

const VOICE_COMMANDS = [
  { phrases: ['next', 'continue', 'proceed', 'suivant', 'weiter', 'siguiente', 'ɛdi so'], action: 'next', desc: 'Go to next round', icon: '⏭️' },
  { phrases: ['repeat', 'again', 'répéter', 'nochmal', 'otra vez', 'san ka bio'], action: 'repeat', desc: 'Repeat AI response', icon: '🔁' },
  { phrases: ['leaderboard', 'scores', 'classement', 'rangliste', 'tabla', 'mpuntuo'], action: 'leaderboard', desc: 'Show leaderboard', icon: '🏆' },
  { phrases: ['settings', 'options', 'paramètres', 'einstellungen', 'ajustes', 'nhyehyɛe'], action: 'settings', desc: 'Open settings', icon: '⚙️' },
  { phrases: ['start', 'play', 'begin', 'démarrer', 'commencer', 'starten', 'empezar', 'fi'], action: 'start', desc: 'Start game', icon: '▶️' },
  { phrases: ['profile', 'account', 'profil', 'konto', 'perfil', 'me ho nsɛm'], action: 'profile', desc: 'Open profile', icon: '👤' },
  { phrases: ['help', 'ayuda', 'aide', 'hilfe', 'boa me'], action: 'help', desc: 'Show help', icon: '❓' },
  { phrases: ['back', 'return', 'volver', 'retour', 'zurück', 'san kɔ'], action: 'back', desc: 'Go back', icon: '🔙' },
  { phrases: ['home', 'main', 'inicio', 'accueil', 'heim', 'fie'], action: 'home', desc: 'Go to home', icon: '🏠' },
  { phrases: ['exit', 'quit', 'salir', 'quitter', 'beenden', 'pue'], action: 'exit', desc: 'Exit game', icon: '🚪' },
];

interface ScenarioResponse { scenario: string; language: string; }
interface TranslationResponse { translated_text: string; }
interface EvaluateResponse { persuaded: boolean; feedback: string; score: number; }
interface DialogueResponse { ai_response: string; new_stance: string; }
interface LeaderboardResponse { leaderboard: any[]; }

function AppContent() {
  const [scenario, setScenario] = useState('');
  const [language, setLanguage] = useState('twi');
  const [aiStance, setAiStance] = useState('disagree');
  const [userArgument, setUserArgument] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [translation, setTranslation] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number|null>(null);
  const [displayedXp, setDisplayedXp] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [newStance, setNewStance] = useState('');
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [timerActive, setTimerActive] = useState(true);
  const [roundResult, setRoundResult] = useState<'playing'|'success'|'fail'|'gameover'>('playing');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [shake, setShake] = useState(false);
  const audioSuccess = useRef<HTMLAudioElement|null>(null);
  const audioFail = useRef<HTMLAudioElement|null>(null);
  const audioClick = useRef<HTMLAudioElement|null>(null);
  const [nickname, setNickname] = useState(() => localStorage.getItem('lq_nickname') || '');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('lq_avatar') || '');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(!avatar && !showNicknamePrompt);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [roundWins, setRoundWins] = useState(0);
  const [allPersuaded, setAllPersuaded] = useState(true);
  const [uniqueWords, setUniqueWords] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(true);
  const [listeningCmd, setListeningCmd] = useState(false);
  const [lastCmd, setLastCmd] = useState('');
  const [cmdError, setCmdError] = useState('');
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [voiceLang, setVoiceLang] = useState('twi');
  const [showEngagement, setShowEngagement] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { theme } = useSettings();
  const { user, submitScore, startGameSession, endGameSession, incrementStreak, awardBadge } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  // Apply theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Timer logic
  useEffect(() => {
    if (!timerActive || roundResult !== 'playing') return;
    if (timeLeft === 0) {
      setRoundResult('fail');
      setTimerActive(false);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, timerActive, roundResult]);

  // Fetch scenario
  const fetchScenario = async () => {
    setLoading(true);
    try {
      const res = await axios.post<ScenarioResponse>('http://127.0.0.1:8000/scenario', { category, difficulty });
      setScenario(res.data.scenario);
      setLanguage(res.data.language || 'twi');
      setAiStance('disagree');
      setUserArgument('');
      setTranslation('');
      setFeedback('');
      setScore(null);
      setAiResponse('');
      setNewStance('');
      setTimeLeft(ROUND_TIME);
      setTimerActive(true);
      setRoundResult('playing');
    } catch (e) {
      setScenario('Error loading scenario.');
    }
    setLoading(false);
  };

  // Next round logic
  const nextRound = async () => {
    if (round < TOTAL_ROUNDS) {
      setRound(r => r + 1);
      await fetchScenario();
    } else {
      setRoundResult('gameover');
      setTimerActive(false);
    }
  };

  // Translate user argument
  const handleTranslate = async () => {
    if (!userArgument) return;
    setLoading(true);
    try {
      const res = await axios.post<TranslationResponse>('http://127.0.0.1:8000/translate', {
        text: userArgument,
        src_lang: 'en',
        tgt_lang: language,
      });
      setTranslation(res.data.translated_text);
    } catch (e) {
      setTranslation('Translation error.');
    }
    setLoading(false);
  };

  // Evaluate argument
  const handleEvaluate = async () => {
    if (!userArgument) return;
    setLoading(true);
    try {
      const res = await axios.post<EvaluateResponse>('http://127.0.0.1:8000/evaluate', {
        argument: userArgument,
        tone,
      });
      setFeedback(res.data.feedback);
      setScore(res.data.score);
      if (res.data.persuaded) {
        setRoundResult('success');
        setTimerActive(false);
      }
    } catch (e) {
      setFeedback('Evaluation error.');
      setScore(null);
    }
    setLoading(false);
  };

  // Get AI dialogue response
  const handleDialogue = async () => {
    setLoading(true);
    try {
      const res = await axios.post<DialogueResponse>('http://127.0.0.1:8000/dialogue', {
        scenario,
        user_argument: userArgument,
        ai_stance: aiStance,
        language,
      });
      setAiResponse(res.data.ai_response);
      setNewStance(res.data.new_stance);
      setAiStance(res.data.new_stance);
    } catch (e) {
      setAiResponse('Dialogue error.');
      setNewStance(aiStance);
    }
    setLoading(false);
  };

  // Voice command logic
  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListeningCmd(true);
    setCmdError('');
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setLastCmd(transcript);
      setListeningCmd(false);
      // Find matching command
      let found = false;
      for (const cmd of VOICE_COMMANDS) {
        if (cmd.phrases.some(p => transcript.includes(p))) {
          found = true;
          // Spoken feedback for recognized command
          if ('speechSynthesis' in window) {
            const utter = new window.SpeechSynthesisUtterance(`${cmd.desc}`);
            utter.lang = voiceLang;
            window.speechSynthesis.speak(utter);
          }
          if (cmd.action === 'next') {
            if (roundResult === 'success' || roundResult === 'fail') nextRound();
          } else if (cmd.action === 'repeat') {
            if ('speechSynthesis' in window && aiResponse) {
              const utter = new window.SpeechSynthesisUtterance(aiResponse);
              utter.lang = voiceLang;
              window.speechSynthesis.speak(utter);
            }
          } else if (cmd.action === 'leaderboard') {
            setShowLeaderboard(true);
          } else if (cmd.action === 'settings') {
            setShowSettingsPage(true);
          } else if (cmd.action === 'start') {
            if (showOnboarding) setShowOnboarding(false);
          } else if (cmd.action === 'profile') {
            // Implement profile logic
          } else if (cmd.action === 'help') {
            setShowHelp(true);
          } else if (cmd.action === 'back') {
            // Implement back logic
          } else if (cmd.action === 'home') {
            // Implement home logic
          } else if (cmd.action === 'exit') {
            // Implement exit logic
          }
          break;
        }
      }
      if (!found) {
        setCmdError('Command not recognized. Try: Next, Repeat, Leaderboard, Settings, Start, Profile, Help, Back, Home, Exit.');
        // Spoken feedback for unrecognized command
        if ('speechSynthesis' in window) {
          const utter = new window.SpeechSynthesisUtterance('Command not recognized. Try Next, Repeat, Leaderboard, Settings, Start, Profile, Help, Back, Home, or Exit.');
          utter.lang = voiceLang;
          window.speechSynthesis.speak(utter);
        }
      }
    };
    recognition.onerror = () => setListeningCmd(false);
    recognition.onend = () => setListeningCmd(false);
  };

  // Initial scenario load
  useEffect(() => {
    fetchScenario();
    // eslint-disable-next-line
  }, []);

  // Auto-advance to next round after success/fail
  useEffect(() => {
    if (roundResult === 'success' || roundResult === 'fail') {
      const timeout = setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          nextRound();
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [roundResult, round, TOTAL_ROUNDS]);

  // Track round wins and unique words
  useEffect(() => {
    if (roundResult === 'success') {
      setRoundWins(w => w + 1);
      // Increment streak on success
      if (user) {
        incrementStreak().catch(error => {
          console.error('Failed to increment streak:', error);
        });
      }
    }
    if (userArgument && roundResult === 'playing') {
      const words = userArgument.toLowerCase().split(/\W+/).filter(Boolean);
      setUniqueWords(prev => new Set([...prev, ...words]));
    }
    if (roundResult === 'fail') {
      setAllPersuaded(false);
    }
    if (roundResult === 'playing' && round === 1) {
      setRoundWins(0);
      setAllPersuaded(true);
      setUniqueWords(new Set());
    }
  }, [roundResult, userArgument, round, user, incrementStreak]);

  // Unlock badges on game over
  useEffect(() => {
    if (roundResult === 'gameover' && user) {
      const unlocked: string[] = [];
      if (roundWins >= 3) unlocked.push('streak');
      if ((score ?? 0) >= 8) unlocked.push('highscore');
      if (uniqueWords.size >= 20) unlocked.push('creative');
      if (allPersuaded && round === TOTAL_ROUNDS + 1) unlocked.push('perfect');
      setBadges(unlocked);
      
      // Award badges in database
      unlocked.forEach(async (badgeType) => {
        try {
          const badgeNames = {
            streak: 'Streak Master',
            highscore: 'High Scorer',
            creative: 'Creative Thinker',
            perfect: 'Perfect Player'
          };
          const badgeDescriptions = {
            streak: 'Won 3 or more rounds in a game',
            highscore: 'Achieved a high score of 8 or more',
            creative: 'Used 20 or more unique words',
            perfect: 'Persuaded AI in all rounds'
          };
          await awardBadge(badgeType, badgeNames[badgeType as keyof typeof badgeNames], badgeDescriptions[badgeType as keyof typeof badgeDescriptions]);
        } catch (error) {
          console.error(`Failed to award badge ${badgeType}:`, error);
        }
      });
    }
  }, [roundResult, roundWins, score, uniqueWords, allPersuaded, round, user, awardBadge]);

  // Handle nickname confirm
  const handleNicknameConfirm = (name: string) => {
    setNickname(name);
    localStorage.setItem('lq_nickname', name);
    setShowNicknamePrompt(false);
    setShowAvatarPicker(true);
  };

  // Handle avatar confirm
  const handleAvatarConfirm = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    localStorage.setItem('lq_avatar', avatarUrl);
    setShowAvatarPicker(false);
    setShowLogin(true);
  };

  // Handle age confirm
  const handleLogin = (age: number) => {
    setShowLogin(false);
    setShowEngagement(true);
    // You can store the age if needed
  };

  // Handle engagement start
  const handleEngagementStart = () => {
    setShowEngagement(false);
    setShowCategorySelector(true);
  };

  // Handle category confirm
  const handleCategoryConfirm = async (cat: string, diff: string) => {
    setCategory(cat);
    setDifficulty(diff);
    setShowCategorySelector(false);
    setShowOnboarding(false);
    
    // Start game session
    if (user) {
      try {
        const sessionId = await startGameSession({
          category: cat,
          difficulty: diff
        });
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error('Failed to start game session:', error);
      }
    }
  };

  // Submit score and end session on game over
  useEffect(() => {
    if (roundResult === 'gameover' && user && score !== null) {
      const endGame = async () => {
        try {
          // Submit score
          await submitScore({
            score,
            details: {
              roundWins,
              uniqueWords: uniqueWords.size,
              allPersuaded,
              badges: badges
            }
          });
          
          // End game session
          if (currentSessionId) {
            await endGameSession(currentSessionId, {
              end_time: new Date().toISOString(),
              total_score: score,
              rounds_played: round,
              status: 'completed'
            });
            setCurrentSessionId(null);
          }
        } catch (error) {
          console.error('Failed to end game:', error);
        }
      };
      
      endGame();
    }
  }, [roundResult, user, score, roundWins, uniqueWords, allPersuaded, badges, submitScore, currentSessionId, endGameSession, round]);

  // Play sound effects
  const playSuccess = () => audioSuccess.current && audioSuccess.current.play();
  const playFail = () => audioFail.current && audioFail.current.play();
  const playClick = () => audioClick.current && audioClick.current.play();

  // Animate on round result
  useEffect(() => {
    if (roundResult === 'success') {
      playSuccess();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    if (roundResult === 'fail') {
      playFail();
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }, [roundResult]);

  // Animate XP badge when score changes
  useEffect(() => {
    if (score === null) return;
    let start = displayedXp;
    let end = score;
    if (start === end) return;
    const duration = 600; // ms
    const stepTime = 20;
    const steps = Math.ceil(duration / stepTime);
    let currentStep = 0;
    const increment = (end - start) / steps;
    let current = start;
    const interval = setInterval(() => {
      currentStep++;
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end) || currentStep >= steps) {
        setDisplayedXp(end);
        clearInterval(interval);
      } else {
        setDisplayedXp(Math.round(current));
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [score]);

  // Translate scenario when language changes
  const handleScenarioLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    if (scenario && newLang !== 'en') {
      setLoading(true);
      try {
        const res = await axios.post<TranslationResponse>('http://127.0.0.1:8000/translate', {
          text: scenario,
          src_lang: 'en',
          tgt_lang: newLang,
        });
        setScenario(res.data.translated_text);
      } catch (e) {
        setScenario('Translation error.');
      }
      setLoading(false);
    }
  };

  // Onboarding screens
  if (showWelcome) {
    return <WelcomePage onGetStarted={() => {
      setShowWelcome(false);
      setShowNicknamePrompt(true);
    }} />;
  }

  if (showNicknamePrompt) {
    return <NicknamePrompt onConfirm={handleNicknameConfirm} />;
  }

  if (showAvatarPicker) {
    return <AvatarPicker onConfirm={handleAvatarConfirm} />;
  }

  if (showLogin) {
    return <Age onConfirm={handleLogin} />;
  }

  if (showEngagement) {
    return <Engagement nickname={nickname} avatar={avatar} onStart={handleEngagementStart} />;
  }

  if (showCategorySelector) {
    return <CategorySelector onConfirm={handleCategoryConfirm} />;
  }

  if (showSettingsPage) {
    return <SettingsPage onClose={() => setShowSettingsPage(false)} />;
  }

  if (showOnboarding) {
    return (
      <>
        <Onboarding show={showOnboarding} onStart={() => { setShowOnboarding(false); playClick(); }} playClick={playClick} />
        <button 
          className="btn btn-outline-primary position-absolute" 
          style={{ bottom: '2rem', left: '50%', transform: 'translateX(-50%)', borderRadius: '.75rem' }} 
          onClick={() => setShowLeaderboard(true)}
        >
          <i className="material-icons align-middle me-2">leaderboard</i>
          View Leaderboard
        </button>
        {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      </>
    );
  }

  // Main game layout with Duolingo styling
  return (
    <div className="app-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Duolingo style */}
      <header style={{
        background: DUOLINGO_COLORS.white,
        padding: '12px 16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo and title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: DUOLINGO_COLORS.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={logo} alt="Logo" style={{ height: '24px' }} />
            </div>
            <h1 style={{
              color: DUOLINGO_COLORS.green,
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0
            }}>LinguaQuest</h1>
          </div>
          
          {/* User profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: DUOLINGO_COLORS.gray,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: `2px solid ${DUOLINGO_COLORS.green}`
            }}>
              <img 
                src={user?.avatar_url || avatar} 
                alt="User" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            {/* Display nickname */}
            <span style={{
              fontWeight: 'bold',
              color: DUOLINGO_COLORS.darkGray,
              fontSize: '14px'
            }}>
              {nickname}
            </span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main style={{
        flex: 1,
        padding: '0 16px 16px',
        maxWidth: '640px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--duo-card, #fff)',
          borderRadius: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: '24px 20px',
          marginBottom: '28px',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <ProgressBar round={round} totalRounds={TOTAL_ROUNDS} />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#d7f7c8',
            padding: '8px 18px',
            borderRadius: '24px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 1px 4px #58cc0233',
            minWidth: '70px',
            justifyContent: 'center',
          }}>
            <span style={{
              width: '20px',
              height: '20px',
              background: '#58cc02',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
            }}>XP</span>
            <span style={{ color: '#58cc02', fontWeight: 700 }}>{displayedXp}</span>
          </div>
        </div>
        {/* Scenario card - Duolingo style */}
        <div className="duo-card" style={{
          borderRadius: '32px',
          padding: '40px 32px 36px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          position: 'relative',
        }}>
          <div style={{ width: '100%' }}>
            <div className="card-title">Scenario</div>
            <div className="card-body">
              <Scenario
                scenario={scenario}
                language={language}
                loading={loading}
                onLanguageChange={handleScenarioLanguageChange}
                languages={LANGUAGES}
              />
            </div>
          </div>
        </div>
        
        {/* Input area - Duolingo style */}
        <div className="duo-card" style={{
          borderRadius: '32px',
          padding: '40px 32px 36px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          position: 'relative',
        }}>
          <div style={{ width: '100%' }}>
            <div className="card-title">Your Argument</div>
            <div className="card-body">
              <ArgumentInput
                userArgument={userArgument}
                onChange={setUserArgument}
                loading={loading}
                disabled={loading}
                onTranslate={handleTranslate}
                translation={translation}
                language={language}
              />
              <div style={{ marginTop: '24px' }}>
                <ToneSelector
                  tone={tone}
                  onChange={setTone}
                  loading={loading}
                  disabled={loading}
                  tones={TONES}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Response area - Duolingo style */}
        <div className="duo-card" style={{
          borderRadius: '32px',
          padding: '40px 32px 36px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          position: 'relative',
        }}>
          <div style={{ width: '100%' }}>
            <div className="card-title">AI Response</div>
            <div className="card-body">
              <AIResponse
                aiResponse={aiResponse}
                newStance={newStance}
                loading={loading}
                disabled={roundResult !== 'playing'}
                onDialogue={handleDialogue}
                userArgument={userArgument}
                enableVoice={true}
              />
            </div>
          </div>
        </div>
        
        {/* Feedback area - Duolingo style */}
        <div className="duo-card" style={{
          borderRadius: '32px',
          padding: '40px 32px 36px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          position: 'relative',
        }}>
          <div style={{ width: '100%' }}>
            <div className="card-title">Feedback</div>
            <div className="card-body">
              <Feedback
                feedback={feedback}
                score={score}
                loading={loading}
                disabled={roundResult !== 'playing'}
                onEvaluate={handleEvaluate}
                userArgument={userArgument}
              />
            </div>
          </div>
        </div>
        
        {/* Action buttons - Duolingo style */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px'
        }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              background: DUOLINGO_COLORS.green,
              color: DUOLINGO_COLORS.white,
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: `0 4px 0 ${DUOLINGO_COLORS.darkGreen}`
            }}
            onClick={fetchScenario}
            disabled={loading || roundResult !== 'playing'}
          >
            New Scenario
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '56px',
              background: listeningCmd ? DUOLINGO_COLORS.orange : DUOLINGO_COLORS.blue,
              color: DUOLINGO_COLORS.white,
              border: 'none',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 4px 0 ${listeningCmd ? '#d18616' : '#0d8ecf'}`
            }}
            onClick={handleVoiceCommand}
            disabled={listeningCmd}
          >
            <span style={{ fontSize: '20px' }}>{listeningCmd ? '🎤' : '🎤'}</span>
          </motion.button>
        </div>

        {/* Show voice command error if any */}
        {cmdError && (
          <div style={{
            marginTop: '8px',
            color: DUOLINGO_COLORS.red,
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {cmdError}
          </div>
        )}
      </main>

      {/* Status messages - Duolingo style */}
      {(roundResult === 'success' || roundResult === 'fail' || roundResult === 'gameover') && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: roundResult === 'success' ? DUOLINGO_COLORS.green : 
                     roundResult === 'fail' ? DUOLINGO_COLORS.red : DUOLINGO_COLORS.blue,
          color: DUOLINGO_COLORS.white,
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {roundResult === 'success' && (
            <>
              <span style={{ fontSize: '20px' }}>🎉</span>
              <span>Great job! +1 Point</span>
            </>
          )}
          {roundResult === 'fail' && (
            <>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <span>Time's up! Next round</span>
            </>
          )}
          {roundResult === 'gameover' && (
            <>
              <span style={{ fontSize: '20px' }}>🏆</span>
              <span>Game Complete!</span>
            </>
          )}
        </div>
      )}

      {/* Footer - Duolingo style */}
      <footer style={{
        padding: '12px 16px',
        marginTop: 'auto',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          gap: '20px',
          maxWidth: '800px',
          width: '100%',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => setShowLeaderboard(true)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: DUOLINGO_COLORS.darkGray,
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span style={{ fontSize: '12px' }}>Leaderboard</span>
          </button>
          
          <button 
            onClick={() => setShowSettingsPage(true)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: DUOLINGO_COLORS.darkGray,
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span style={{ fontSize: '12px' }}>Settings</span>
          </button>
          
          <button 
            onClick={() => setShowHelp(true)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: DUOLINGO_COLORS.darkGray,
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '20px' }}>❓</span>
            <span style={{ fontSize: '12px' }}>Help</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      
      {showHelp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', // more prominent shadow
            background: '#fff', // solid white background
            border: `1.5px solid ${DUOLINGO_COLORS.lightGray}` // subtle border
          }}>
            <div style={{
              padding: '16px',
              borderBottom: `1px solid ${DUOLINGO_COLORS.gray}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: DUOLINGO_COLORS.green }}>Voice Commands</h2>
              <button 
                onClick={() => setShowHelp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: DUOLINGO_COLORS.darkGray
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {VOICE_COMMANDS.map(cmd => (
                  <li key={cmd.action} style={{ padding: '12px 0', borderBottom: `1px solid ${DUOLINGO_COLORS.lightGray}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: DUOLINGO_COLORS.lightGreen,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {cmd.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: DUOLINGO_COLORS.darkGreen }}>
                          {cmd.phrases[0]}
                        </div>
                        <div style={{ fontSize: '14px', color: DUOLINGO_COLORS.darkGray }}>
                          {cmd.desc}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {showSettingsPage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: `1px solid ${DUOLINGO_COLORS.gray}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: DUOLINGO_COLORS.green }}>Settings</h2>
              <button 
                onClick={() => setShowSettingsPage(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: DUOLINGO_COLORS.darkGray
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
              <SettingsPage onClose={() => setShowSettingsPage(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={[DUOLINGO_COLORS.green, DUOLINGO_COLORS.blue, DUOLINGO_COLORS.orange, DUOLINGO_COLORS.purple]}
        />
      )}

      {/* Audio elements */}
      <audio ref={audioSuccess} src={successSfx} preload="auto" />
      <audio ref={audioFail} src={failSfx} preload="auto" />
      <audio ref={audioClick} src={clickSfx} preload="auto" />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;