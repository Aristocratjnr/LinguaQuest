import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets/images/logo.png'
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
import WelcomePage from './components/WelcomePage'; // Import the new WelcomePage component
import SettingsPage from './components/SettingsPage';
import { useSettings } from './context/SettingsContext';
import { UserProvider, useUser } from './context/UserContext';
import { motion } from 'framer-motion';


const TONES = ['polite', 'passionate', 'formal', 'casual'];
const LANGUAGES = [
  { code: 'twi', label: 'Twi' },
  { code: 'gaa', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
];
const TOTAL_ROUNDS = 5;
const ROUND_TIME = 50; // seconds (increased from 30 to 50)

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
  // Add more as needed
];

// Define response types
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
  const [voiceLang, setVoiceLang] = useState('twi'); // Default to Twi for voice commands
  const [showEngagement, setShowEngagement] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { theme } = useSettings();
  const { user, submitScore, startGameSession, endGameSession, incrementStreak, awardBadge } = useUser();
  // Theme-aware header background and avatar glow
  const headerBg = theme === 'dark' ? 'rgba(35, 41, 70, 0.98)' : 'rgba(255,255,255,0.95)';
  const headerColor = theme === 'dark' ? '#e0e7ff' : '#4f46e5';
  const avatarGlow = theme === 'dark'
    ? '0 0 0 4px #6366f1, 0 0 16px 4px #23294699'
    : '0 0 0 4px #6366f1, 0 0 16px 4px #e0e7ff99';
  // Theme-aware footer background
  const footerBg = theme === 'dark' ? 'rgba(35, 41, 70, 0.98)' : 'rgba(255,255,255,0.95)';
  const footerColor = theme === 'dark' ? '#e0e7ff' : '#6c6f7d';

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

  // Voice command logic (update):
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
      // Find matching command (any synonym)
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
    console.log('Avatar confirmed:', avatarUrl);
    setAvatar(avatarUrl);
    localStorage.setItem('lq_avatar', avatarUrl);
    setShowAvatarPicker(false);
    setShowEngagement(true);
    console.log('showEngagement set to true');
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

  // Translate scenario when language changes
  const handleScenarioLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    if (scenario && newLang !== 'en') {
      setLoading(true);
      try {
        const res = await axios.post<TranslationResponse>('http://127.0.0.1:8000/translate', {
          text: scenario,
          src_lang: 'en', // or track the current scenario language if needed
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
  if (showEngagement) {
    console.log('Rendering Engagement screen with nickname:', nickname);
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

  const showGameOverLeaderboard = roundResult === 'gameover' && !showLeaderboard;

  // Main game layout
  return (
    <div className="lq-bg d-flex flex-column min-vh-100" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Header */}
      <header className="container-fluid py-3 px-2 px-md-4 mb-3" style={{ background: headerBg, boxShadow: '0 2px 8px #0001', color: headerColor, borderRadius: 0 }}>
        <div className="d-flex align-items-center justify-content-between" style={{ minHeight: 48 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <motion.div 
                className="d-flex align-items-center justify-content-center" 
                style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: '#58cc02',
                  boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)',
                  border: '2px solid #3caa3c'
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <img src={logo} alt="LinguaQuest Logo" style={{ height: 32, width: 32 }} />
              </motion.div>
              <div className="d-flex flex-column">
                <h1 className="fw-bold mb-0" style={{ 
                  fontSize: '1.5rem', 
                  color: headerColor, 
                  letterSpacing: '1px',
                  fontFamily: '"JetBrains Mono", monospace',
                  textTransform: 'uppercase',
                  lineHeight: '1.2'
                }}>
                  LINGUAQUEST
                </h1>
                <span className="badge px-3 py-1 d-flex align-items-center" style={{
                  backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9',
                  color: '#58cc02', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  fontSize: '0.75rem', 
                  letterSpacing: '1px',
                  fontFamily: '"JetBrains Mono", monospace',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start'
                }}>
                  <i className="material-icons me-1" style={{ fontSize: '0.9rem' }}>psychology</i>
                  Language Game
                </span>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column align-items-end me-2">
              <span className="fw-bold" style={{ 
                fontSize: '0.9rem', 
                color: headerColor, 
                letterSpacing: '0.5px',
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase'
              }}>
                {user?.nickname || nickname || 'Player'}
              </span>
              <span className="text-muted small" style={{ 
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                Welcome Back!
              </span>
            </div>
            <motion.div 
              className="d-flex align-items-center justify-content-center position-relative" 
              style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 16, 
                background: theme === 'dark' ? '#232946' : '#e8f5e9', 
                boxShadow: avatarGlow, 
                border: '3px solid #58cc02',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <img 
                src={user?.avatar_url || avatar} 
                alt="User Avatar" 
                style={{ 
                  height: 42, 
                  width: 42, 
                  objectFit: 'cover',
                  borderRadius: '12px'
                }} 
              />
              <div className="position-absolute" style={{
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#58cc02',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Progress and Timer */}
      <div className="container mb-3 px-2 px-sm-3" style={{ maxWidth: 900 }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <div className="progress-container">
              <ProgressBar round={round} totalRounds={TOTAL_ROUNDS} />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="d-flex justify-content-center">
              <Timer seconds={ROUND_TIME} timeLeft={timeLeft} isActive={timerActive && roundResult === 'playing'} />
            </div>
          </div>
        </div>
      </div>

      {/* Game Status Messages */}
      {(roundResult === 'success' || roundResult === 'fail' || roundResult === 'gameover') && (
        <div className={`container mb-3 px-2 px-sm-3`} style={{ maxWidth: 600 }}>
          <div className={`alert ${roundResult === 'success' ? 'alert-success' : roundResult === 'fail' ? 'alert-danger' : 'alert-info'} text-center shadow-sm mb-0`}>
            {roundResult === 'success' && (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="material-icons me-2" style={{ fontSize: '1.5rem' }}>celebration</i>
                <span className="fw-bold">Persuaded! +1 Point</span>
              </div>
            )}
            {roundResult === 'fail' && (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="material-icons me-2" style={{ fontSize: '1.5rem' }}>timer_off</i>
                <span className="fw-bold">Time's up! Try next round.</span>
              </div>
            )}
            {roundResult === 'gameover' && (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="material-icons me-2" style={{ fontSize: '1.5rem' }}>emoji_events</i>
                <span className="fw-bold">Game Over! Thanks for playing.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Game Content */}
      <main className="container flex-grow-1 d-flex flex-column px-2 px-sm-3" style={{ maxWidth: 900, flex: 1, minHeight: 0 }}>
        <div className="row g-4 flex-grow-1" style={{ minHeight: 0 }}>
          {/* Left Column - Scenario and User Input */}
          <div className="col-12 col-lg-6 d-flex flex-column mb-3 mb-lg-0" style={{ minHeight: 0 }}>
            <div className="card shadow-lg mb-4 flex-grow-1 d-flex flex-column" style={{ borderRadius: 16, background: theme === 'dark' ? '#232946' : 'rgba(255,255,255,0.98)', minHeight: 340, boxShadow: theme === 'dark' ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}>
              <div className="card-body d-grid gap-4 flex-grow-1">
                <Scenario
                  scenario={scenario}
                  language={language}
                  loading={loading}
                  onLanguageChange={handleScenarioLanguageChange}
                  languages={LANGUAGES}
                />
                <ArgumentInput
                  userArgument={userArgument}
                  onChange={setUserArgument}
                  loading={loading}
                  disabled={loading}
                  onTranslate={handleTranslate}
                  translation={translation}
                  language={language}
                />
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
          {/* Right Column - AI Responses and Feedback */}
          <div className="col-12 col-lg-6 d-flex flex-column" style={{ minHeight: 0 }}>
            <div className="card shadow-lg mb-4 flex-grow-1 d-flex flex-column" style={{ borderRadius: 16, background: theme === 'dark' ? '#232946' : 'rgba(255,255,255,0.98)', minHeight: 340, boxShadow: theme === 'dark' ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}>
              <div className="card-body d-grid gap-4 flex-grow-1">
                <Feedback
                  feedback={feedback}
                  score={score}
                  loading={loading}
                  disabled={roundResult !== 'playing'}
                  onEvaluate={handleEvaluate}
                  userArgument={userArgument}
                />
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
        </div>

        {/* Game Controls */}
        <div className="row mt-4 mb-4">
          <div className="col-12 d-flex flex-wrap justify-content-center gap-2 gap-sm-3">
            {showGameOverLeaderboard && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary px-3 px-md-4 py-2 rounded-pill"
                style={{ background: 'linear-gradient(to right, #667eea, #764ba2)', border: 'none', borderRadius: 16, fontWeight: 600, letterSpacing: '.01em' }}
                onClick={() => setShowLeaderboard(true)}
              >
                <i className="material-icons align-middle me-2">leaderboard</i>
                <span className="d-none d-sm-inline">View Leaderboard</span>
                <span className="d-inline d-sm-none">Leaderboard</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-outline-primary px-3 px-md-4 py-2 rounded-pill"
              style={{ borderRadius: 16, fontWeight: 600, letterSpacing: '.01em' }}
              onClick={fetchScenario}
              disabled={loading || roundResult !== 'playing'}
            >
              <i className="material-icons align-middle me-2">refresh</i>
              <span className="d-none d-sm-inline">New Scenario</span>
              <span className="d-inline d-sm-none">New</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-outline-info px-3 px-md-4 py-2 rounded-pill"
              style={{ borderRadius: 16, fontWeight: 600, letterSpacing: '.01em' }}
              onClick={handleVoiceCommand}
              disabled={listeningCmd}
            >
              <i className="material-icons align-middle me-2">{listeningCmd ? 'mic' : 'mic_none'}</i>
              <span className="d-none d-sm-inline">{listeningCmd ? 'Listening...' : 'Voice Command'}</span>
              <span className="d-inline d-sm-none">{listeningCmd ? 'Listening...' : 'Voice'}</span>
            </motion.button>
          </div>
        </div>
      </main>

      {/* Last Command Display */}
      {lastCmd && (
        <div className="container mb-3 px-2 px-sm-3" style={{ maxWidth: 600 }}>
          <div className="alert alert-light text-center shadow-sm mb-0 d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: 16, fontSize: '0.95rem', color: theme === 'dark' ? '#a5b4fc' : '#6c757d' }}>
            <span className="d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
              <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
            </span>
            <span>Last voice command: "{lastCmd}"</span>
            {cmdError && <span className="text-danger small ms-2">{cmdError}</span>}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(255,255,255,0.7)', zIndex: 1000 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showLeaderboard && (
        <motion.div
          className="fixed inset-0 d-flex align-items-center justify-content-center p-4 z-50"
          style={{ background: theme === 'dark' ? 'rgba(24,28,42,0.85)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-[#232946] rounded-4 overflow-hidden w-100 position-relative shadow-lg"
            style={{ maxWidth: 700, width: '100%', borderRadius: 24, boxShadow: theme === 'dark' ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <div className="d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                  <i className="material-icons" style={{ fontSize: '1.5rem' }}>leaderboard</i>
                </span>
                <h2 className="fw-bold mb-0" style={{ color: '#58a700', fontSize: '1.15rem', letterSpacing: '.01em' }}>Leaderboard</h2>
                <span className="badge px-3 py-1 d-flex align-items-center ms-2" style={{ backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '.01em' }}>
                  <i className="material-icons me-1" style={{ fontSize: '1rem' }}>emoji_events</i>
                  Top Players
                </span>
              </div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowLeaderboard(false)}
                className="btn btn-sm btn-outline-secondary rounded-circle ms-2 d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, border: 'none', background: theme === 'dark' ? '#232946' : '#f8f9fa' }}
                aria-label="Close leaderboard"
              >
                <i className="material-icons">close</i>
              </motion.button>
            </div>
            {/* Leaderboard Content */}
            <div className="p-0 p-md-4" style={{ minHeight: 400 }}>
              <Leaderboard onClose={() => setShowLeaderboard(false)} />
            </div>
            {/* Info/Help Section */}
            <div className="text-muted small px-4 py-3 d-flex align-items-center gap-2 border-top" style={{ color: theme === 'dark' ? '#a5b4fc' : '#6c757d', fontSize: '0.9rem', background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
              <span className="d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
              </span>
              Scores update in real time. Click a player for details and badges.
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Help Modal */}
      {showHelp && (
        <motion.div
          className="fixed inset-0 d-flex align-items-center justify-content-center p-4 z-50"
          style={{ background: theme === 'dark' ? 'rgba(24,28,42,0.85)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-[#232946] rounded-4 overflow-hidden w-100 position-relative shadow-lg"
            style={{ maxWidth: 480, width: '100%', borderRadius: 24, boxShadow: theme === 'dark' ? '0 10px 30px #181c2a' : '0 10px 30px rgba(0,0,0,0.10)' }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <div className="d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                  <i className="material-icons" style={{ fontSize: '1.5rem' }}>help_outline</i>
                </span>
                <h2 className="fw-bold mb-0" style={{ color: '#58a700', fontSize: '1.15rem', letterSpacing: '.01em' }}>Voice Commands</h2>
                <span className="badge px-3 py-1 d-flex align-items-center ms-2" style={{ backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '.01em' }}>
                  <i className="material-icons me-1" style={{ fontSize: '1rem' }}>mic</i>
                  Assistant
                </span>
              </div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(false)}
                className="btn btn-sm btn-outline-secondary rounded-circle ms-2 d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, border: 'none', background: theme === 'dark' ? '#232946' : '#f8f9fa' }}
                aria-label="Close help"
              >
                <i className="material-icons">close</i>
              </motion.button>
            </div>
            {/* Body */}
            <div className="card-body p-4">
              <ul className="list-group list-group-flush">
                {VOICE_COMMANDS.map(cmd => (
                  <li key={cmd.action} className="list-group-item border-0 d-flex align-items-start py-3">
                    <div className="me-3 fs-4">{cmd.icon}</div>
                    <div>
                      <div className="fw-bold">{cmd.phrases[0]}</div>
                      <div className="text-muted small">{cmd.desc}</div>
                      <div className="text-muted small mt-1">Synonyms: {cmd.phrases.slice(1).join(', ')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Info/Help Section */}
            <div className="text-muted small px-4 py-3 d-flex align-items-center gap-2 border-top" style={{ color: theme === 'dark' ? '#a5b4fc' : '#6c757d', fontSize: '0.9rem', background: theme === 'dark' ? '#181c2a' : '#f8f9fa', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
              <span className="d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#232946' : '#e8f5e9', color: '#58a700' }}>
                <i className="material-icons" style={{ fontSize: '1.1rem' }}>info</i>
              </span>
              Try saying a command or tap the mic button. Voice commands work best in supported browsers.
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={['#58cc02', '#ffd700', '#1cb0f6', '#ff6b6b', '#4ecdc4']}
        />
      )}

      {/* Audio elements */}
      <audio ref={audioSuccess} src={successSfx} preload="auto" />
      <audio ref={audioFail} src={failSfx} preload="auto" />
      <audio ref={audioClick} src={clickSfx} preload="auto" />

      {/* Footer */}
      <footer className="text-center text-muted mt-auto py-3 small" style={{ background: footerBg, color: footerColor, boxShadow: '0 -2px 8px #0001', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <div className="d-flex justify-content-center gap-3 mb-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-sm btn-link text-muted rounded-pill" style={{ fontWeight: 600, letterSpacing: '.01em' }} onClick={() => setShowHelp(true)}>
            <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>help_outline</i>
            Help
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-sm btn-link text-muted rounded-pill" style={{ fontWeight: 600, letterSpacing: '.01em' }} onClick={() => setShowSettingsPage(true)}>
            <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>settings</i>
            Settings
          </motion.button>
        </div>
        &copy; {new Date().getFullYear()} LinguaQuest. Developed by: Opuku Boakye Michael
      </footer>
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