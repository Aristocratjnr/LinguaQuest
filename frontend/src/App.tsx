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


const TONES = ['polite', 'passionate', 'formal', 'casual'];
const LANGUAGES = [
  { code: 'twi', label: 'Twi' },
  { code: 'gaa', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
];
const TOTAL_ROUNDS = 5;
const ROUND_TIME = 30; // seconds

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

function App() {
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
  const { theme } = useSettings();
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
      const res = await axios.post<ScenarioResponse>('/scenario', { category, difficulty });
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
      const res = await axios.post<TranslationResponse>('/translate', {
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
      const res = await axios.post<EvaluateResponse>('/evaluate', {
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
      const res = await axios.post<DialogueResponse>('/dialogue', {
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
  }, [roundResult, userArgument, round]);

  // Unlock badges on game over
  useEffect(() => {
    if (roundResult === 'gameover') {
      const unlocked: string[] = [];
      if (roundWins >= 3) unlocked.push('streak');
      if ((score ?? 0) >= 8) unlocked.push('highscore');
      if (uniqueWords.size >= 20) unlocked.push('creative');
      if (allPersuaded && round === TOTAL_ROUNDS + 1) unlocked.push('perfect');
      setBadges(unlocked);
    }
  }, [roundResult, roundWins, score, uniqueWords, allPersuaded, round]);

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
  const handleCategoryConfirm = (cat: string, diff: string) => {
    setCategory(cat);
    setDifficulty(diff);
    setShowCategorySelector(false);
    setShowOnboarding(false);
  };

  // Submit score on game over
  useEffect(() => {
    if (roundResult === 'gameover' && nickname && score !== null) {
      axios.post('/score', {
        name: nickname,
        score,
        date: new Date().toISOString(),
        avatar,
      });
    }
  }, [roundResult, nickname, score, avatar]);

  // Play sound effects
  const playSuccess = () => audioSuccess.current && audioSuccess.current.play();
  const playFail = () => audioFail.current && audioFail.current.play();
  const playClick = () => audioClick.current && audioClick.current.play();

  // Animate on round result
  useEffect(() => {
    if (roundResult === 'success') playSuccess();
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
        const res = await axios.post<TranslationResponse>('/translate', {
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
    <div className="lq-bg" style={{ minHeight: '100vh', minWidth: '100vw' }}>
      {/* Header */}
      <header className="container-fluid py-3 px-2 px-md-4 mb-3" style={{ background: headerBg, boxShadow: '0 2px 8px #0001', color: headerColor }}>
        <div className="d-flex align-items-center justify-content-between" style={{ minHeight: 48 }}>
          <div className="d-flex align-items-center gap-2">
            <img src={logo} alt="LinguaQuest Logo" style={{ height: 36, width: 36 }} />
            <h1 className="fw-bold mb-0" style={{ fontSize: '1.3rem', color: headerColor, letterSpacing: '.01em' }}>LinguaQuest</h1>
          </div>
          <img src={avatar} alt="User Avatar" className="rounded-circle" style={{ height: 40, width: 40, objectFit: 'cover', border: '2px solid #764ba2', boxShadow: avatarGlow, background: '#fff' }} />
        </div>
      </header>

      {/* Progress and Timer */}
      <div className="container mb-3 px-2 px-sm-3" style={{ maxWidth: 900 }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <ProgressBar round={round} totalRounds={TOTAL_ROUNDS} />
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
      <main className="container flex-grow-1 d-flex flex-column px-2 px-sm-3" style={{ maxWidth: 900 }}>
        <div className="row g-4 flex-grow-1">
          {/* Left Column - Scenario and User Input */}
          <div className="col-12 col-lg-6 d-flex flex-column">
            <div className="card shadow-sm mb-4 flex-grow-1" style={{ borderRadius: '1rem', background: 'rgba(255,255,255,0.98)' }}>
              <div className="card-body d-grid gap-4">
                <Scenario
                  scenario={scenario}
                  language={language}
                  loading={loading || roundResult !== 'playing'}
                  onLanguageChange={handleScenarioLanguageChange}
                  languages={LANGUAGES}
                />
                <ArgumentInput
                  userArgument={userArgument}
                  onChange={setUserArgument}
                  loading={loading}
                  disabled={roundResult !== 'playing'}
                  onTranslate={handleTranslate}
                  translation={translation}
                  language={language}
                />
                <ToneSelector
                  tone={tone}
                  onChange={setTone}
                  loading={loading}
                  disabled={roundResult !== 'playing'}
                  tones={TONES}
                />
              </div>
            </div>
          </div>
          {/* Right Column - AI Responses and Feedback */}
          <div className="col-12 col-lg-6 d-flex flex-column">
            <div className="card shadow-sm mb-4 flex-grow-1" style={{ borderRadius: '1rem', background: 'rgba(255,255,255,0.98)' }}>
              <div className="card-body d-grid gap-4">
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
              <button 
                className="btn btn-primary px-3 px-md-4 py-2"
                style={{ 
                  background: 'linear-gradient(to right, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: '.75rem',
                }} 
                onClick={() => setShowLeaderboard(true)}
              >
                <i className="material-icons align-middle me-2">leaderboard</i>
                <span className="d-none d-sm-inline">View Leaderboard</span>
                <span className="d-inline d-sm-none">Leaderboard</span>
              </button>
            )}
            <button 
              className="btn btn-outline-primary px-3 px-md-4 py-2"
              style={{ borderRadius: '.75rem' }} 
              onClick={fetchScenario} 
              disabled={loading || roundResult !== 'playing'}
            >
              <i className="material-icons align-middle me-2">refresh</i>
              <span className="d-none d-sm-inline">New Scenario</span>
              <span className="d-inline d-sm-none">New</span>
            </button>
            <button 
              className="btn btn-outline-info px-3 px-md-4 py-2"
              style={{ borderRadius: '.75rem' }} 
              onClick={handleVoiceCommand}
              disabled={listeningCmd}
            >
              <i className="material-icons align-middle me-2">{listeningCmd ? 'mic' : 'mic_none'}</i>
              <span className="d-none d-sm-inline">{listeningCmd ? 'Listening...' : 'Voice Command'}</span>
              <span className="d-inline d-sm-none">{listeningCmd ? 'Listening...' : 'Voice'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Last Command Display */}
      {lastCmd && (
        <div className="container mb-3 px-2 px-sm-3" style={{ maxWidth: 600 }}>
          <div className="alert alert-light text-center shadow-sm mb-0">
            <small className="text-muted">Last voice command: "{lastCmd}"</small>
            {cmdError && <div className="text-danger small mt-1">{cmdError}</div>}
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
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {/* Help Modal */}
      {showHelp && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card shadow mx-3" style={{ maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="card-header bg-primary text-white py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="material-icons me-2">help_outline</i>
                Voice Commands
              </h5>
            </div>
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
            <div className="card-footer d-flex justify-content-end p-3">
              <button className="btn btn-primary px-4" onClick={() => setShowHelp(false)}>
                <i className="material-icons align-middle me-2">close</i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio elements */}
      <audio ref={audioSuccess} src={successSfx} preload="auto" />
      <audio ref={audioFail} src={failSfx} preload="auto" />
      <audio ref={audioClick} src={clickSfx} preload="auto" />

      {/* Footer */}
      <footer className="text-center text-muted mt-auto py-3 small" style={{ background: footerBg, color: footerColor, boxShadow: '0 -2px 8px #0001' }}>
        <div className="d-flex justify-content-center gap-3 mb-2">
          <button className="btn btn-sm btn-link text-muted" onClick={() => setShowHelp(true)}>
            <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>help_outline</i>
            Help
          </button>
          <button className="btn btn-sm btn-link text-muted" onClick={() => setShowSettingsPage(true)}>
            <i className="material-icons align-middle me-1" style={{ fontSize: '.9rem' }}>settings</i>
            Settings
          </button>
        </div>
        &copy; {new Date().getFullYear()} LinguaQuest
      </footer>
    </div>
  );
}

export default App;