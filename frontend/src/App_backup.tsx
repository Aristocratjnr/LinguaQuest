import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets/images/logo.png';
import avatar from './assets/images/avatar.png';
import Confetti from 'react-confetti';
import successSfx from './assets/sounds/sfx-success.mp3';
import failSfx from './assets/sounds/sfx-failed.mp3';
import clickSfx from './assets/sounds/sfx-button-click.mp3';

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
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Age from './components/Age';
import mascotImg from './assets/images/logo.png'; // Use logo as mascot, or replace with mascot image
import chestClosed from './assets/images/chest-closed.png';
import chestOpen from './assets/images/chest-open.png';
import LanguageSelector from './components/LanguageSelector';
import ProgressionMap from './components/ProgressionMap';
import LanguageClub from './components/LanguageClub';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';

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
  { phrases: ['next', 'continue', 'proceed', 'suivant', 'weiter', 'siguiente', 'ɛdi so'], action: 'next', desc: 'Go to next round' },
  { phrases: ['repeat', 'again', 'répéter', 'nochmal', 'otra vez', 'san ka bio'], action: 'repeat', desc: 'Repeat AI response' },
  { phrases: ['leaderboard', 'scores', 'classement', 'rangliste', 'tabla', 'mpuntuo'], action: 'leaderboard', desc: 'Show leaderboard' },
  { phrases: ['settings', 'options', 'paramètres', 'einstellungen', 'ajustes', 'nhyehyɛe'], action: 'settings', desc: 'Open settings' },
  { phrases: ['start', 'play', 'begin', 'démarrer', 'commencer', 'starten', 'empezar', 'fi'], action: 'start', desc: 'Start game' },
  { phrases: ['profile', 'account', 'profil', 'konto', 'perfil', 'me ho nsɛm'], action: 'profile', desc: 'Open profile' },
  { phrases: ['help', 'ayuda', 'aide', 'hilfe', 'boa me'], action: 'help', desc: 'Show help' },
  { phrases: ['back', 'return', 'volver', 'retour', 'zurück', 'san kɔ'], action: 'back', desc: 'Go back' },
  { phrases: ['home', 'main', 'inicio', 'accueil', 'heim', 'fie'], action: 'home', desc: 'Go to home' },
  { phrases: ['exit', 'quit', 'salir', 'quitter', 'beenden', 'pue'], action: 'exit', desc: 'Exit game' },
];

interface ScenarioResponse { scenario: string; language: string; }
interface TranslationResponse { translated_text: string; }
interface EvaluateResponse { persuaded: boolean; feedback: string; score: number; }
interface DialogueResponse { ai_response: string; new_stance: string; }
interface LeaderboardResponse { leaderboard: any[]; }

function AppContent() {
  // Router setup
  const navigate = useNavigate();
  const { user, userStats, submitScore, startGameSession, endGameSession, incrementStreak, resetStreak, awardBadge, refreshUserStats, loginUser } = useUser();

  const { theme, sound, nickname, avatar, setNickname, setAvatar } = useSettings();
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
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(!avatar && !showNicknamePrompt);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [roundWins, setRoundWins] = useState(0);
  const [allPersuaded, setAllPersuaded] = useState(true);
  const [uniqueWords, setUniqueWords] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('food');
  const [difficulty, setDifficulty] = useState('easy');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [listeningCmd, setListeningCmd] = useState(false);
  const [lastCmd, setLastCmd] = useState('');
  const [cmdError, setCmdError] = useState('');
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [voiceLang, setVoiceLang] = useState('twi');
  const [showEngagement, setShowEngagement] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showListeningModal, setShowListeningModal] = useState(false);
  // Add Duolingo streak and XP progress variables
  const DAILY_GOAL = 100;
  const streak = userStats?.current_streak ?? 0;
  const totalXp = userStats?.total_score ?? 0;
  const dailyXp = totalXp % DAILY_GOAL;
  const dailyProgress = Math.min(1, dailyXp / DAILY_GOAL);
  // Add this state near other user stats
  const [hasStreakFreeze, setHasStreakFreeze] = useState(true); // For demo, always true. Replace with real logic if available.
  // Add this state near other user stats
  const [showMascotCelebrate, setShowMascotCelebrate] = useState(false);
  // Add state for achievement popup
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{ name: string, description: string } | null>(null);
  // Add state for daily chest
  const [chestOpenState, setChestOpenState] = useState(false);
  const [showChestReward, setShowChestReward] = useState(false);
  const [chestReward, setChestReward] = useState<string | null>(null);
  // Motivational mascot tips
  const MASCOT_TIPS = [
    "Keep going! You're doing great!",
    "Practice makes perfect!",
    "Don't give up, you're almost there!",
    "Try to use new words in your arguments!",
    "Remember: Consistency is key!",
    "Celebrate your progress!",
    "Every round is a new opportunity!",
    "You're building a language superpower!",
  ];
  const [mascotTipIndex, setMascotTipIndex] = useState(0);
  const [showMascotBubble, setShowMascotBubble] = useState(true);
  const [mascotBubbleMsg, setMascotBubbleMsg] = useState(MASCOT_TIPS[0]);
  // Progression Map (Skill Tree) state
  const [showProgressionMap, setShowProgressionMap] = useState(false);
  // Example skill tree structure (can be replaced with real data)
  const SKILL_TREE = [
    { id: 'cat1', label: 'Basics', unlocked: true, children: [
      { id: 'cat1-easy', label: 'Easy', unlocked: true },
      { id: 'cat1-med', label: 'Medium', unlocked: false },
      { id: 'cat1-hard', label: 'Hard', unlocked: false },
    ]},
    { id: 'cat2', label: 'Food', unlocked: false, children: [
      { id: 'cat2-easy', label: 'Easy', unlocked: false },
      { id: 'cat2-med', label: 'Medium', unlocked: false },
      { id: 'cat2-hard', label: 'Hard', unlocked: false },
    ]},
    { id: 'cat3', label: 'Travel', unlocked: false, children: [
      { id: 'cat3-easy', label: 'Easy', unlocked: false },
      { id: 'cat3-med', label: 'Medium', unlocked: false },
      { id: 'cat3-hard', label: 'Hard', unlocked: false },
    ]},
  ];
  // Language Club/Group Challenges state
  const [showClubModal, setShowClubModal] = useState(false);
  // Example club data (replace with real data later)
  const CLUB = {
    name: 'Lingua Legends',
    members: [
      { nickname: 'You', xp: 320, avatar: avatar || mascotImg },
      { nickname: 'Ama', xp: 280, avatar: undefined },
      { nickname: 'Kwame', xp: 210, avatar: undefined },
      { nickname: 'Esi', xp: 150, avatar: undefined },
    ],
    groupGoal: 1000,
    groupProgress: 760,
    challenge: 'Earn 1000 XP as a club this week!'
  };
  // Add responsive styles and global age validation error UI
  const [ageError, setAgeError] = useState<string | null>(null);
  // Apply theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else if (theme === 'light') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('light');
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

  // Initialize game when user is logged in and no scenario is loaded
  useEffect(() => {
    if (user && !scenario && !loading) {
      console.log('Initializing game with first scenario...');
      
      // Set default values if they're not already set
      if (!category) setCategory('food');
      if (!difficulty) setDifficulty('easy');
      if (!language) setLanguage('twi');
      
      fetchScenario();
    }
  }, [user, scenario, loading, category, difficulty, language]);

  // Fetch scenario
  const fetchScenario = async () => {
    setLoading(true);
    try {
      const res = await axios.post<ScenarioResponse>('http://127.0.0.1:8000/scenario', { 
        category, 
        difficulty,
        language: language // Pass current language to get scenario in that language
      });
      setScenario(res.data.scenario);
      setLanguage(res.data.language || language);
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
        scenario, // Include scenario for better context
      });
      
      console.log('Evaluation API response score:', res.data.score);
      setFeedback(res.data.feedback);
      setScore(res.data.score);
      console.log('Set score to:', res.data.score);
      
      // Real-time XP calculation based on persuasiveness
      const baseXp = Math.floor(res.data.score * 10); // Base XP from score
      const bonusXp = res.data.persuaded ? 50 : 0; // Bonus XP for successful persuasion
      const earnedXp = baseXp + bonusXp;
      
      // Update XP with animation
      setDisplayedXp(prevXp => {
        const newXp = prevXp + earnedXp;
        // Level is based on total XP
        const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP
        
        // Update level in real-time if it changed
        if (user) {
          axios.patch(`http://127.0.0.1:8000/api/v1/level?nickname=${encodeURIComponent(user.nickname)}&level=${newLevel}`)
            .then(() => {
              // Update leaderboard with new level
              const leaderboardUpdate = {
                nickname: user.nickname,
                total_score: newXp,
                level: newLevel
              };
              return axios.post('/api/v1/leaderboard', leaderboardUpdate);
            })
            .catch(error => console.error('Failed to update level/leaderboard:', error));
        }
        return newXp;
      });
      
      if (res.data.persuaded) {
        setRoundResult('success');
        setTimerActive(false);
        
        if (user) {
          // Submit score first
          await submitScore({
            score: earnedXp,
            details: {
              argument: userArgument,
              feedback: res.data.feedback,
              persuasiveness: res.data.score,
              scenario: scenario,
              bonusXp: bonusXp
            }
          });
          
          // Update streak
          await incrementStreak();
          
          // Update leaderboard entry with new data
          const leaderboardUpdate = {
            nickname: user.nickname,
            total_score: displayedXp + earnedXp,
            // Optionally, you can remove current_streak or fetch it separately if needed
            last_activity: new Date().toISOString()
          };
          
          // Update leaderboard
          await axios.post('/api/v1/leaderboard', leaderboardUpdate)
            .catch(error => console.error('Failed to update leaderboard:', error));
          
          // Show confetti for successful persuasion
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          
          // Play success sound
          playSuccess();
        }
      }
    } catch (e) {
      setFeedback('Evaluation error.');
      setScore(null);
      // Play fail sound
      playFail();
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
    setShowListeningModal(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setLastCmd(transcript);
      setListeningCmd(false);
      setShowListeningModal(false);
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
    recognition.onerror = () => {
      setListeningCmd(false);
      setShowListeningModal(false);
    };
    recognition.onend = () => {
      setListeningCmd(false);
      setShowListeningModal(false);
    };
  };

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
      // Reset streak on failure (optional - depends on game design)
      // Uncomment the following lines if you want to reset streak on any failure
      // if (user) {
      //   resetStreak().catch(error => {
      //     console.error('Failed to reset streak:', error);
      //   });
      // }
    }
    if (roundResult === 'playing' && round === 1) {
      setRoundWins(0);
      setAllPersuaded(true);
      setUniqueWords(new Set());
    }
  }, [roundResult, userArgument, round, user, incrementStreak, resetStreak]);

  // Unlock badges on game over
  useEffect(() => {
    if (roundResult === 'gameover' && user) {
      const unlocked: string[] = [];
      if (roundWins >= 3) unlocked.push('streak');
      if ((score ?? 0) >= 8) unlocked.push('highscore');
      if (uniqueWords.size >= 20) unlocked.push('creative');
      if (allPersuaded && round === TOTAL_ROUNDS + 1) unlocked.push('perfect');
      setBadges(unlocked);
      // Show achievement popup for each badge
      if (unlocked.length > 0) {
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
        // Show popup for the first badge (can be extended to cycle through all)
        setUnlockedBadge({
          name: badgeNames[unlocked[0] as keyof typeof badgeNames],
          description: badgeDescriptions[unlocked[0] as keyof typeof badgeDescriptions]
        });
        setShowAchievementPopup(true);
        setTimeout(() => setShowAchievementPopup(false), 3500);
      }
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
    // localStorage.setItem('lq_nickname', name); // No longer needed, handled by context
    setShowNicknamePrompt(false);
    setShowAvatarPicker(true);
  };

  // Handle avatar confirm
  const handleAvatarConfirm = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    // localStorage.setItem('lq_avatar', avatarUrl); // No longer needed, handled by context
    setShowAvatarPicker(false);
    setShowLogin(true);
  };

  // Handle age confirm
  const handleLogin = async (age: number) => {
    if (isNaN(age) || age < 13 || age > 120) {
      setAgeError('Please enter a valid age between 13 and 120.');
      return;
    }
    setAgeError(null);
    setShowLogin(false);
    setShowEngagement(true);
    // You can store the age if needed
    // Record login in backend after nickname is set
    if (nickname) {
      try {
        await loginUser(nickname);
      } catch (err) {
        // Optionally handle login error (e.g., show a message)
        console.error('Failed to record login:', err);
      }
    }
  };

  // Handle engagement start
  const handleEngagementStart = () => {
    setShowEngagement(false);
    setShowCategorySelector(true);
  };

  // Handle category confirm
  const handleCategoryConfirm = async (cat: string, diff: string) => {
    console.log('App.tsx: CategorySelector confirmed:', cat, diff);
    console.log('App.tsx: Current user:', user);
    console.log('App.tsx: About to set state and navigate...');
    
    setCategory(cat);
    setDifficulty(diff);
    setShowCategorySelector(false);
    setRound(1);
    setScore(0);
    setDisplayedXp(0);
    setTimeLeft(ROUND_TIME);
    setTimerActive(true);
    setRoundResult('playing');
    setUserArgument('');
    setTranslation('');
    setFeedback('');
    setAiResponse('');
    setNewStance('');
    setLoading(true);
    
    console.log('App.tsx: State set, now navigating to /app...');
    // Always navigate to app immediately to ensure user can access the game
    navigate('/app');
    console.log('App.tsx: Navigation called');
    
    // Animate transition and load scenario in background
    setTimeout(async () => {
      console.log('App.tsx: Loading scenario with:', cat, diff, language);
      try {
        const res = await axios.post<ScenarioResponse>('http://127.0.0.1:8000/scenario', { 
          category: cat, 
          difficulty: diff,
          language: language // Pass current language to get scenario in that language
        });
        setScenario(res.data.scenario);
        setLanguage(res.data.language || language);
        console.log('App.tsx: Scenario loaded successfully:', res.data.scenario);
      } catch (e) {
        console.error('App.tsx: Error loading scenario:', e);
        setScenario('Error loading scenario. Please try starting a new round.');
      }
      setLoading(false);
      console.log('App.tsx: Loading complete');
    }, 350);
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
  const playSuccess = () => { if (sound && audioSuccess.current) audioSuccess.current.play(); };
  const playFail = () => { if (sound && audioFail.current) audioFail.current.play(); };
  const playClick = () => { if (sound && audioClick.current) audioClick.current.play(); };

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

  // Fetch new scenario when language changes
  const handleScenarioLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    // Fetch a new scenario in the selected language
      setLoading(true);
      try {
      const res = await axios.post<ScenarioResponse>('http://127.0.0.1:8000/scenario', { 
        category, 
        difficulty,
        language: newLang // Get scenario in the new language
      });
      setScenario(res.data.scenario);
      setLanguage(res.data.language || newLang);
      } catch (e) {
      setScenario('Error loading scenario.');
      }
      setLoading(false);
  };

  // Animate mascot when daily goal is reached
  useEffect(() => {
    if (dailyProgress >= 1) {
      setShowMascotCelebrate(true);
      const timeout = setTimeout(() => setShowMascotCelebrate(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [dailyProgress]);

  // Daily chest reward logic
  const handleOpenChest = async () => {
    if (!chestOpenState) {
      setChestOpenState(true);
      // Random reward: XP, badge, or streak freeze
      const rewards = [
        '+25 XP',
        '+50 XP',
        'Streak Freeze',
        'Lucky Badge',
        'Bonus Badge',
      ];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      setChestReward(reward);
      setShowChestReward(true);

      // If XP reward, animate and submit score
      if (reward.includes('XP')) {
        const xpAmount = parseInt(reward.replace(/[^0-9]/g, ''));
        if (!isNaN(xpAmount)) {
          // Animate XP increase
          setDisplayedXp(prevXp => {
            const newXp = prevXp + xpAmount;
            // Optionally update level, etc. here if needed
            return newXp;
          });
          // Submit score to backend for persistence
          if (user) {
            await submitScore({
              score: xpAmount,
              details: {
                source: 'Daily Chest',
                reward,
                date: new Date().toISOString(),
              },
            });
            // Refresh user stats to sync nav/progress
            if (typeof refreshUserStats === 'function') {
              await refreshUserStats();
            }
          }
        }
      }

      setTimeout(() => {
        setShowChestReward(false);
        setChestOpenState(false);
      }, 3200);
    }
  };

  // Cycle through tips every 10 seconds
  useEffect(() => {
    if (!showMascotBubble) return;
    const interval = setInterval(() => {
      setMascotTipIndex(idx => {
        const next = (idx + 1) % MASCOT_TIPS.length;
        setMascotBubbleMsg(MASCOT_TIPS[next]);
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [showMascotBubble]);

  // Show special mascot messages on success/fail/gameover
  useEffect(() => {
    if (roundResult === 'success') {
      setMascotBubbleMsg('🎉 Great job! You persuaded the AI!');
      setShowMascotBubble(true);
    } else if (roundResult === 'fail') {
      setMascotBubbleMsg('😅 Don\'t worry, try again next round!');
      setShowMascotBubble(true);
    } else if (roundResult === 'gameover') {
      setMascotBubbleMsg('🏆 Game complete! Check your achievements!');
      setShowMascotBubble(true);
    }
  }, [roundResult]);

  // Onboarding screens
  if (showWelcome) {
    return <WelcomePage onGetStarted={() => {
      setShowWelcome(false);
      setShowLanguageSelect(true);
    }} />;
  }

  if (showLanguageSelect) {
    return <LanguageSelector 
      onSelect={(lang) => {
        setLanguage(lang); // from context, not local state
        setShowLanguageSelect(false);
        setShowNicknamePrompt(true);
      }}
      onBack={() => {
        setShowLanguageSelect(false);
        setShowWelcome(true);
      }}
    />;
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
    return (
      <CategorySelector onConfirm={async (cat, diff) => {
        setCategory(cat);
        setDifficulty(diff);
        setShowCategorySelector(false);
        setRound(1);
        setScore(0);
        setDisplayedXp(0);
        setTimeLeft(ROUND_TIME);
        setTimerActive(true);
        setRoundResult('playing');
        setUserArgument('');
        setTranslation('');
        setFeedback('');
        setAiResponse('');
        setNewStance('');
        setLoading(true);
        // Animate transition
        setTimeout(async () => {
          try {
            const res = await axios.post<ScenarioResponse>('http://127.0.0.1:8000/scenario', { 
              category: cat, 
              difficulty: diff,
              language: language // Pass current language to get scenario in that language
            });
            setScenario(res.data.scenario);
            setLanguage(res.data.language || language);
          } catch (e) {
            setScenario('Error loading scenario.');
          }
          setLoading(false);
        }, 350);
      }} />
    );
  }

  if (showSettingsPage) {
    return <SettingsPage onClose={() => navigate('/')} />;
  }

 

  // Main game layout with Duolingo styling
return (
    <Routes>
      <Route path="/" element={<WelcomePage onGetStarted={() => navigate('/onboarding/language')} />} />
      <Route path="/onboarding/language" element={
        <LanguageSelector
          onSelect={(lang) => {
            setLanguage(lang);
            navigate('/onboarding/nickname');
          }}
          onBack={() => navigate('/')}
        />
      } />
      <Route path="/onboarding/nickname" element={
        <NicknamePrompt onConfirm={(name) => {
          setNickname(name);
          navigate('/onboarding/avatar');
        }} />
      } />
      <Route path="/onboarding/avatar" element={
        <AvatarPicker onConfirm={(avatarUrl) => {
          setAvatar(avatarUrl);
          navigate('/onboarding/age');
        }} />
      } />
      <Route path="/onboarding/age" element={
        <Age onConfirm={async (age) => {
          if (isNaN(age) || age < 13 || age > 120) {
            setAgeError('Please enter a valid age between 13 and 120.');
            return;
          }
          setAgeError(null);
          if (nickname) {
            try {
              await loginUser(nickname);
              navigate('/onboarding/engagement');
            } catch (err) {
              console.error('Failed to record login:', err);
            }
          }
        }} />
      } />
      <Route path="/onboarding/engagement" element={
        <Engagement
          nickname={nickname}
          avatar={avatar}
          onStart={() => navigate('/onboarding/category')}
        />
      } />
      <Route path="/onboarding/category" element={
        <CategorySelector onConfirm={handleCategoryConfirm} />
      } />
      <Route path="/debug" element={
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h2>Debug Info</h2>
          <p>User: {user ? user.nickname : 'Not logged in'}</p>
          <p>Category: {category || 'Not set'}</p>
          <p>Difficulty: {difficulty || 'Not set'}</p>
          <p>Language: {language || 'Not set'}</p>
          <p>Scenario: {scenario || 'Not loaded'}</p>
          <button onClick={() => navigate('/app')}>Go to App</button>
          <button onClick={() => navigate('/onboarding/category')}>Go to Category Selector</button>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      } />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={
    <div className="app-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Duolingo style */}
      <header style={{
        background: DUOLINGO_COLORS.white,
        padding: 'clamp(8px, 2vw, 16px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          minWidth: 0,
          maxWidth: '100%',
          margin: '0 auto',
          gap: 'clamp(8px, 2vw, 24px)',
        }}>
          {/* Left: Logo + Streak */}
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 18px)', minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
            {/* Logo and app name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  color: DUOLINGO_COLORS.green,
                  fontSize: 'clamp(1.1rem, 4vw, 22px)',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.01em',
                  opacity: 0.92
                }}>
                  LinguaQuest
                </span>
                <span className="material-icons" style={{ fontSize: 'clamp(1.1rem, 4vw, 22px)', color: DUOLINGO_COLORS.green, opacity: 0.85 }}>psychology</span>
              </div>
              <span style={{
                color: DUOLINGO_COLORS.darkGray,
                fontSize: 'clamp(0.7rem, 3vw, 12px)',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 400,
                opacity: 0.7,
                marginTop: '2px',
                letterSpacing: '0.01em'
              }}>
                Language Game
              </span>
            </div>
            {/* Streak + Daily Goal Ring */}
            <div style={{ position: 'relative', width: 'clamp(38px, 12vw, 54px)', height: 'clamp(38px, 12vw, 54px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Mascot pop-up when daily goal is reached */}
              {showMascotCelebrate && (
                <motion.img
                  src={mascotImg}
                  alt="Mascot Celebrate"
                  initial={{ y: 30, opacity: 0, scale: 0.7 }}
                  animate={{ y: -60, opacity: 1, scale: 1.1, rotate: [0, 10, -10, 0] }}
                  exit={{ y: 30, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: -60,
                    width: 'clamp(32px, 10vw, 48px)',
                    height: 'clamp(32px, 10vw, 48px)',
                    zIndex: 10,
                    filter: 'drop-shadow(0 4px 16px #58cc0255)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* Sparkle/confetti effect */}
              {showMascotCelebrate && (
                <Confetti
                  width={80}
                  height={60}
                  numberOfPieces={40}
                  recycle={false}
                  gravity={0.2}
                  colors={[DUOLINGO_COLORS.green, DUOLINGO_COLORS.blue, DUOLINGO_COLORS.orange, DUOLINGO_COLORS.purple]}
                  style={{
                    position: 'absolute',
                    left: '-30px',
                    top: '-60px',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* SVG Circular Progress */}
              <svg width="100%" height="100%" viewBox="0 0 54 54" style={{ position: 'absolute', top: 0, left: 0, minWidth: 0, minHeight: 0 }}>
                <circle
                  cx={27}
                  cy={27}
                  r={24}
                  fill="none"
                  stroke="#e5e5e5"
                  strokeWidth={6}
                />
                <motion.circle
                  cx={27}
                  cy={27}
                  r={24}
                  fill="none"
                  stroke="#ff9c1a"
                  strokeWidth={6}
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - dailyProgress)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - dailyProgress) }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </svg>
              {/* Flame icon */}
              <span className="material-icons" style={{
                fontSize: 'clamp(1.2rem, 6vw, 32px)',
                color: '#ff9c1a',
                filter: 'drop-shadow(0 2px 6px #ff9c1a33)',
                zIndex: 1,
                position: 'relative',
                background: 'white',
                borderRadius: '50%',
                padding: 4,
                boxShadow: '0 2px 8px #ff9c1a22',
              }}>local_fire_department</span>
              {/* Streak Freeze (Duolingo feature) */}
              <span
                className="material-icons"
                title="Streak Freeze: Protect your streak for one missed day!"
                style={{
                  fontSize: 'clamp(1rem, 5vw, 26px)',
                  color: hasStreakFreeze ? '#1cb0f6' : '#b0bec5',
                  position: 'absolute',
                  bottom: -8,
                  left: -10,
                  background: '#fff',
                  borderRadius: '50%',
                  padding: 2,
                  boxShadow: hasStreakFreeze ? '0 2px 8px #1cb0f622' : 'none',
                  opacity: hasStreakFreeze ? 1 : 0.6,
                  border: hasStreakFreeze ? '1.5px solid #b3e5fc' : '1.5px solid #eceff1',
                  zIndex: 2,
                  cursor: hasStreakFreeze ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >ac_unit</span>
              {/* Streak number */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontWeight: 700,
                  fontSize: 'clamp(0.8rem, 3vw, 14px)',
                  color: '#ff9c1a',
                  boxShadow: '0 1px 4px #ff9c1a22',
                  border: '1.5px solid #ffe0b2',
                  zIndex: 2,
                  minWidth: 24,
                  textAlign: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {userStats ? streak : <span style={{ opacity: 0.5 }}>--</span>}
              </motion.div>
            </div>
            {/* Daily XP label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, flex: '1 1 80px', maxWidth: '100%' }}>
              <span style={{ fontWeight: 700, color: '#ff9c1a', fontSize: 15, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.01em' }}>
                {userStats ? `${dailyXp} / ${DAILY_GOAL} XP` : '-- / 100 XP'}
              </span>
              <span style={{ color: '#6c6f7d', fontSize: 12, opacity: 0.7, fontFamily: 'JetBrains Mono, monospace' }}>
                Daily Goal
              </span>
            </div>
          </div>
          {/* User profile and right side */}
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 2vw, 8px)', minWidth: 0, flexWrap: 'wrap', flexShrink: 0 }}>
            {/* Daily Reward Chest */}
            <motion.button
              style={{
                width: 'clamp(32px, 10vw, 48px)',
                height: 'clamp(32px, 10vw, 48px)',
                marginRight: 'clamp(2px, 1vw, 8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: '50%',
                background: chestOpenState
                  ? 'linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)'
                  : 'linear-gradient(135deg, #fffbe6 0%, #ffe082 100%)',
                border: chestOpenState
                  ? '2.5px solid #ffb300'
                  : '2px solid #ffe082',
                boxShadow: chestOpenState
                  ? '0 0 24px 8px #ffb300cc, 0 4px 16px #ffb30033'
                  : '0 2px 8px #ffb30022',
                transition: 'all 0.2s',
                outline: 'none',
                zIndex: 2,
                overflow: 'visible',
              }}
              title="Daily Reward Chest: Open for a surprise!"
              onClick={handleOpenChest}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.97 }}
              animate={chestOpenState ? { scale: [1, 1.08, 1], boxShadow: ['0 0 24px 8px #ffb300cc, 0 4px 16px #ffb30033', '0 0 32px 12px #ffd700cc, 0 8px 32px #ffb30033', '0 0 24px 8px #ffb300cc, 0 4px 16px #ffb30033'] } : {}}
              transition={{ duration: 1.2, repeat: chestOpenState ? Infinity : 0, repeatType: 'loop', ease: 'easeInOut' }}
              aria-label="Open Daily Reward Chest"
            >
              <motion.span
                className="material-icons"
                style={{
                  fontSize: 'clamp(1.1rem, 6vw, 32px)',
                  color: chestOpenState ? '#ffb300' : '#8d6e63',
                  filter: chestOpenState ? 'brightness(1.2)' : 'none',
                  userSelect: 'none',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
                animate={chestOpenState ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
                transition={chestOpenState ? { duration: 1.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' } : {}}
              >
                {chestOpenState ? 'emoji_events' : 'card_giftcard'}
              </motion.span>
              {/* Animated Sparkle when open */}
              {chestOpenState && (
                <motion.span
                  className="material-icons"
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    color: '#ffd700',
                    fontSize: 'clamp(1rem, 5vw, 24px)',
                    filter: 'drop-shadow(0 2px 8px #ffd70088)',
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                >auto_awesome</motion.span>
              )}
              {/* Pulsing gold glow when open */}
              {chestOpenState && (
                <motion.span
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: -12,
                    width: 'clamp(40px, 18vw, 80px)',
                    height: 'clamp(40px, 18vw, 80px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #ffe08255 0%, transparent 70%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                />
              )}
            </motion.button>
            <div 
              style={{
                width: 'clamp(24px, 8vw, 36px)',
                height: 'clamp(24px, 8vw, 36px)',
                borderRadius: '50%',
                background: theme === 'dark' ? '#232946' : DUOLINGO_COLORS.gray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: theme === 'dark' ? '2px solid #e0e7ff' : `2px solid ${DUOLINGO_COLORS.green}`,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => setShowSettingsPage(true)}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 0 3px #d7f7c8'}
              onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <img 
                src={user?.avatar || avatar} 
                alt="User" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', minWidth: 0, minHeight: 0 }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{
                 fontFamily: 'JetBrains Mono, monospace',
                 fontWeight: 400,
                 color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                 fontSize: 'clamp(0.7rem, 3vw, 13px)',
                 opacity: 0.7,
                 letterSpacing: '0.01em',
                 lineHeight: 1.1
               }}>
                 Welcome back
               </span>
               <span style={{
                 fontWeight: 'bold',
                 color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                 fontSize: 'clamp(0.8rem, 3vw, 14px)',
                 fontFamily: 'JetBrains Mono, monospace',
                 letterSpacing: '0.01em',
                 lineHeight: 1.1
               }}>
                 {nickname}
               </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main style={{
        flex: 1,
        padding: '0 16px 16px',
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
          : 'none',
        minHeight: '100vh',
      }}>
        {/* Category & Difficulty Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '14px', // smaller radius
            padding: '8px 12px', // smaller padding
            margin: '14px 0 8px 0', // smaller margin
            boxShadow: '0 1px 4px rgba(88,204,2,0.08)',
            border: '1px solid rgba(88,204,2,0.10)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.98rem',
            fontWeight: 600,
            color: '#3caa3c',
            gap: '10px',
            maxWidth: '420px', // smaller and responsive
            width: '100%',
            minWidth: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="material-icons" style={{ fontSize: '20px', color: '#58cc02' }}>view_module</i>
              {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="material-icons" style={{ fontSize: '20px', color: '#1cb0f6' }}>signal_cellular_alt</i>
              {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Difficulty'}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: '#58cc02',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #3caa3c',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.01em',
              transition: 'all 0.2s',
              marginLeft: '12px'
            }}
            onClick={() => setShowCategorySelector(true)}
          >
            <i className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>edit</i>
            Change
          </motion.button>
        </motion.div>
        {/* Progress/XP/Timer Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            margin: '12px auto 24px auto', // center horizontally
            width: '100%',
            maxWidth: '700px', // wider for responsiveness
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
              : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: theme === 'dark'
              ? '0 2px 8px rgba(35,41,70,0.18)'
              : '0 2px 8px rgba(88,204,2,0.08)',
            border: theme === 'dark'
              ? '1px solid #232946'
              : '1px solid rgba(88,204,2,0.12)',
            color: theme === 'dark' ? '#e0e7ff' : undefined,
            position: 'relative',
            overflow: 'visible',
            gap: '0',
            minHeight: '110px',
            padding: '12px 10px',
            flexWrap: 'wrap',
          }}
        >
          {/* Responsive style for mobile: stack vertically */}
          <style>{`
            @media (max-width: 600px) {
              .progress-section-flex {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 12px !important;
                min-height: 0 !important;
                padding: 8px 2vw !important;
              }
              .progress-section-divider {
                display: none !important;
              }
              .progress-section-timer, .progress-section-xp {
                margin: 0 auto !important;
                width: 100% !important;
                min-width: 0 !important;
                max-width: 100% !important;
                justify-content: center !important;
              }
            }
          `}</style>
          <div className="progress-section-flex" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            {/* Decorative background elements */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(88, 204, 2, 0.06) 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              style={{
                position: 'absolute',
                bottom: '-15px',
                left: '-15px',
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, rgba(28, 176, 246, 0.06) 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            />
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ 
                minWidth: 0, 
                flex: 1,
                position: 'relative',
                zIndex: 1,
                marginRight: '20px',
                minHeight: '100px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
            <ProgressBar round={round} totalRounds={TOTAL_ROUNDS} />
            </motion.div>
            {/* Visual divider */}
            <motion.div
              className="progress-section-divider"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                width: '2px',
                height: '40px',
                background: 'linear-gradient(180deg, rgba(88, 204, 2, 0.3) 0%, rgba(88, 204, 2, 0.1) 50%, transparent 100%)',
                margin: '0 20px',
                borderRadius: '1px',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0
              }}
            />
            {/* Timer with enhanced styling */}
            <motion.div 
              className="progress-section-timer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                position: 'relative',
                zIndex: 1,
                background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.05) 0%, rgba(88, 204, 2, 0.02) 100%)',
                padding: '12px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(88, 204, 2, 0.1)',
                boxShadow: '0 2px 8px rgba(88, 204, 2, 0.08)',
                flexShrink: 0,
                minWidth: '120px'
              }}
            >
            <Timer seconds={ROUND_TIME} timeLeft={timeLeft} isActive={timerActive} />
            </motion.div>
            {/* Enhanced XP badge */}
            <motion.div
              className="progress-section-xp"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              style={{
            display: 'flex',
            alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
                padding: '12px 20px',
                borderRadius: '28px',
            fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(88, 204, 2, 0.15), 0 2px 4px rgba(88, 204, 2, 0.1)',
                minWidth: '80px',
            justifyContent: 'center',
                border: '1px solid rgba(88, 204, 2, 0.2)',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                marginLeft: '20px'
              }}
            >
              <motion.span
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #58cc02 0%, #3caa3c 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(88, 204, 2, 0.3)'
                }}
              >XP</motion.span>
              <motion.span 
                key={displayedXp}
                initial={{ scale: 1.2, color: '#58cc02' }}
                animate={{ scale: 1, color: '#58cc02' }}
                transition={{ duration: 0.3 }}
                style={{ 
                  color: '#58cc02', 
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(88, 204, 2, 0.1)'
                }}
              >
                {displayedXp}
              </motion.span>
            </motion.div>
          </div>
        </div>
        </motion.div>
        {/* Two-column layout for cards */}
        <div style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-start',
          width: '100%',
          flexWrap: 'wrap',
        }}>
          {/* Left column: Scenario, AI Response, and Feedback */}
          <div style={{ flex: 1, minWidth: '320px', maxWidth: '520px' }}>
            {/* Scenario card - Polished */}
            <div className="duo-card" style={{
              borderRadius: '28px',
              padding: '36px 28px 32px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
                : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: theme === 'dark'
                ? '0 2px 12px rgba(35,41,70,0.25)'
                : '0 2px 12px rgba(88,204,2,0.10)',
              border: theme === 'dark'
                ? '1.5px solid #232946'
                : '1.5px solid rgba(88,204,2,0.18)',
              color: theme === 'dark' ? '#e0e7ff' : undefined,
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
                    error={scenario === 'Error loading scenario.' ? 'Failed to load scenario from server' : undefined}
                  />
                </div>
              </div>
            </div>
            {/* AI Response area - Polished, no side line */}
            <div className="duo-card" style={{
              borderRadius: '28px',
              padding: '36px 28px 32px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
                : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: theme === 'dark'
                ? '0 2px 12px rgba(35,41,70,0.25)'
                : '0 2px 12px rgba(88,204,2,0.10)',
              border: theme === 'dark'
                ? '1.5px solid #232946'
                : '1.5px solid rgba(88,204,2,0.18)',
              color: theme === 'dark' ? '#e0e7ff' : undefined,
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
            {/* Feedback area - Polished, no side line */}
            <div className="duo-card" style={{
              borderRadius: '28px',
              padding: '36px 28px 32px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
                : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: theme === 'dark'
                ? '0 2px 12px rgba(35,41,70,0.25)'
                : '0 2px 12px rgba(88,204,2,0.10)',
              border: theme === 'dark'
                ? '1.5px solid #232946'
                : '1.5px solid rgba(88,204,2,0.18)',
              color: theme === 'dark' ? '#e0e7ff' : undefined,
              marginLeft: 'auto',
              marginRight: 'auto',
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
            {(roundResult === 'success' || roundResult === 'fail') && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <button
                  onClick={nextRound}
                  style={{
                    background: '#58cc02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 36px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #3caa3c',
                    transition: 'all 0.2s ease',
                    margin: '0 auto',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          {/* Right column: ArgumentInput and ToneSelector */}
          <div style={{ flex: 1, minWidth: '320px', maxWidth: '520px' }}>
            {/* Input area - Polished */}
            <div className="duo-card" style={{
              borderRadius: '28px',
              padding: '36px 28px 32px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
                : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: theme === 'dark'
                ? '0 2px 12px rgba(35,41,70,0.25)'
                : '0 2px 12px rgba(88,204,2,0.10)',
              border: theme === 'dark'
                ? '1.5px solid #232946'
                : '1.5px solid rgba(88,204,2,0.18)',
              color: theme === 'dark' ? '#e0e7ff' : undefined,
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
                    languages={LANGUAGES}
                    enableVoice={true}
                    maxLength={500}
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
          </div>
        </div>
        
        {/* Action buttons - Duolingo style */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
          justifyContent: 'center', // center align
          alignItems: 'center',
        }}>
          {/* New Scenario Button - icon only, perfectly centered */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #58cc02 0%, #3caa3c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 56,
              height: 56,
              minWidth: 56,
              minHeight: 56,
              boxShadow: '0 4px 16px #58cc0222',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              transition: 'all 0.2s',
              position: 'relative',
              padding: 0,
            }}
            onClick={fetchScenario}
            disabled={loading || roundResult !== 'playing'}
            title="New Scenario"
            aria-label="New Scenario"
          >
            <span className="material-icons" style={{ fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>autorenew</span>
          </motion.button>
          {/* Microphone Button - unchanged */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: 56,
              height: 56,
              background: listeningCmd ? DUOLINGO_COLORS.orange : DUOLINGO_COLORS.blue,
              color: DUOLINGO_COLORS.white,
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 4px 0 ${listeningCmd ? '#d18616' : '#0d8ecf'}`,
              fontSize: 28,
              transition: 'all 0.2s',
            }}
            onClick={handleVoiceCommand}
            disabled={listeningCmd}
            title="Voice Command"
            aria-label="Voice Command"
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

      {/* Status Modal - Duolingo style */}
      {(roundResult === 'success' || roundResult === 'gameover') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: roundResult === 'success' ? DUOLINGO_COLORS.green : DUOLINGO_COLORS.blue,
            color: DUOLINGO_COLORS.white,
            padding: '32px 36px',
            borderRadius: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            minWidth: '320px',
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            {roundResult === 'success' && (
              <>
                <span className="material-icons" style={{ fontSize: '40px' }}>check_circle</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Great job! +1 Point</span>
              </>
            )}
            {roundResult === 'gameover' && (
              <>
                <span className="material-icons" style={{ fontSize: '40px' }}>emoji_events</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Game Complete!</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Listening Modal - Google Assistant Style */}
      {showListeningModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              padding: '48px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid rgba(88, 204, 2, 0.1)',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}
          >
            {/* Main listening animation */}
            <div style={{ position: 'relative' }}>
              {/* Outer pulsing ring */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(88, 204, 2, 0.3) 0%, transparent 70%)',
                  border: '2px solid rgba(88, 204, 2, 0.2)'
                }}
              />
              
              {/* Middle pulsing ring */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(88, 204, 2, 0.4) 0%, transparent 70%)',
                  border: '2px solid rgba(88, 204, 2, 0.3)'
                }}
              />
              
              {/* Main microphone button */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 8px 32px rgba(88, 204, 2, 0.3)',
                    '0 12px 40px rgba(88, 204, 2, 0.4)',
                    '0 8px 32px rgba(88, 204, 2, 0.3)'
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #58cc02 0%, #3caa3c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(88, 204, 2, 0.3)',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <span className="material-icons" style={{
                  fontSize: '36px',
                  color: '#ffffff',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}>
                  mic
                </span>
              </motion.div>
            </div>
            
            {/* Status text */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#2d3748',
                marginBottom: '8px',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Listening...
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#718096',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Speak your command clearly
              </p>
            </div>
            
            {/* Animated dots */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#58cc02'
                  }}
                />
              ))}
            </div>
            
            {/* Cancel button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowListeningModal(false);
                setListeningCmd(false);
              }}
              style={{
                padding: '12px 24px',
                borderRadius: '16px',
                background: 'rgba(108, 122, 137, 0.1)',
                border: '1px solid rgba(108, 122, 137, 0.2)',
                color: '#6c757d',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'JetBrains Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(108, 122, 137, 0.2)';
                e.currentTarget.style.color = '#58cc02';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(108, 122, 137, 0.1)';
                e.currentTarget.style.color = '#6c757d';
              }}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
              Cancel
            </motion.button>
          </motion.div>
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

      {/* Achievement Popup */}
      {showAchievementPopup && unlockedBadge && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{
              background: 'linear-gradient(135deg, #fffbe6 0%, #e0ffe6 100%)',
              color: '#3caa3c',
              borderRadius: '32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              minWidth: '320px',
              maxWidth: '90vw',
              textAlign: 'center',
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              position: 'relative',
            }}
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={180}
              colors={[DUOLINGO_COLORS.green, DUOLINGO_COLORS.blue, DUOLINGO_COLORS.orange, DUOLINGO_COLORS.purple]}
              style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
            />
            <span className="material-icons" style={{ fontSize: '48px', color: '#ff9c1a', filter: 'drop-shadow(0 2px 6px #ff9c1a33)' }}>emoji_events</span>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', margin: 0 }}>{unlockedBadge.name}</h2>
            <div style={{ fontSize: '1.1rem', color: '#6c6f7d', marginBottom: '8px' }}>{unlockedBadge.description}</div>
            <button
              onClick={() => setShowAchievementPopup(false)}
              style={{
                marginTop: '12px',
                padding: '10px 28px',
                borderRadius: '18px',
                background: '#58cc02',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #58cc0222',
                transition: 'all 0.2s',
              }}
            >
              Awesome!
            </button>
            {/* Social Share Button */}
            <button
              onClick={() => {
                const text = encodeURIComponent(`I just earned the "${unlockedBadge.name}" badge on LinguaQuest! 🏅\n${unlockedBadge.description}\nTry it: https://linguaquest.app`);
                const url = `https://twitter.com/intent/tweet?text=${text}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              style={{
                marginTop: '8px',
                padding: '8px 22px',
                borderRadius: '14px',
                background: '#1cb0f6',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.98rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1cb0f622',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-icons" style={{ fontSize: 20, verticalAlign: 'middle' }}>share</span>
              Share
            </button>
          </motion.div>
        </div>
      )}
      {/* Daily Chest Reward Popup */}
      {showChestReward && chestReward && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              color: '#3c2c00',
              borderRadius: '36px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 0 0 4px #ffcc8055',
              minWidth: '320px',
              maxWidth: '90vw',
              textAlign: 'center',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '22px',
              position: 'relative',
              border: '2.5px solid #ffb300',
              overflow: 'hidden',
            }}
          >
            {/* White overlay for extra clarity */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.55)',
              zIndex: 0,
              pointerEvents: 'none',
            }} />
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={120}
              colors={[DUOLINGO_COLORS.green, DUOLINGO_COLORS.blue, DUOLINGO_COLORS.orange, DUOLINGO_COLORS.purple]}
              style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 1 }}
            />
            <span className="material-icons" style={{ fontSize: 72, color: '#ffb300', marginBottom: 8, filter: 'drop-shadow(0 2px 8px #ffd70088)', zIndex: 2 }}>emoji_events</span>
            <h2 style={{ fontWeight: 900, fontSize: '2.2rem', margin: 0, color: '#ffb300', textShadow: '0 2px 8px #fff, 0 1px 2px #0008', zIndex: 2 }}>Daily Reward!</h2>
            {/* Reward text - highly visible pill */}
            <div style={{
              display: 'inline-block',
              fontSize: '2.1rem',
              color: '#fff',
              background: 'linear-gradient(90deg, #ffb300 0%, #ffec80 100%)',
              padding: '12px 36px',
              borderRadius: '32px',
              fontWeight: 900,
              marginBottom: '12px',
              boxShadow: '0 2px 12px #ffb30055, 0 0 0 2px #fff8',
              border: '2.5px solid #ffb300',
              textShadow: '0 2px 8px #000b, 0 1px 2px #fff8',
              letterSpacing: '0.03em',
              zIndex: 2,
              position: 'relative',
            }}>{chestReward}</div>
            <button
              onClick={() => setShowChestReward(false)}
              style={{
                marginTop: '12px',
                padding: '14px 36px',
                borderRadius: '22px',
                background: '#58cc02',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.15rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #58cc0222',
                transition: 'all 0.2s',
                zIndex: 2,
                textShadow: '0 1px 2px #0008',
              }}
            >
              Thanks!
            </button>
          </motion.div>
        </div>
      )}
      {/* Motivational Mascot Floating UI */}
      <div style={{
        position: 'fixed',
        left: 24,
        bottom: 24,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring' }}
          style={{ position: 'relative', pointerEvents: 'auto' }}
        >
          {/* Speech bubble */}
          {showMascotBubble && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, #fffbe6 0%, #e0ffe6 100%)',
                color: '#3caa3c',
                borderRadius: '18px',
                boxShadow: '0 2px 8px #58cc0222',
                padding: '16px 22px',
                fontWeight: 600,
                fontSize: '1rem',
                marginBottom: 12,
                maxWidth: 260,
                minWidth: 120,
                textAlign: 'center',
                position: 'relative',
                pointerEvents: 'auto',
              }}
              onClick={() => setShowMascotBubble(false)}
              title="Click to hide tip"
            >
              {mascotBubbleMsg}
              <span style={{
                position: 'absolute',
                left: 24,
                bottom: -16,
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '16px solid #fffbe6',
                filter: 'drop-shadow(0 2px 4px #58cc0222)',
              }} />
            </motion.div>
          )}
          {/* Mascot image */}
          <motion.img
            src={mascotImg}
            alt="Mascot"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 8px #58cc0222',
              border: '2.5px solid #58cc02',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => setShowMascotBubble(b => !b)}
            title="Click mascot for a tip!"
          />
        </motion.div>
      </div>
      {/* Floating Action Buttons (FABs) - stack vertically with spacing */}
      <div style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 2100,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        alignItems: 'flex-end',
      }}>
        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          style={{
            background: 'linear-gradient(135deg, #e3e3fd 0%, #b3b5fc 100%)',
            color: '#1c47f6',
            border: '2.5px solid #1c47f6',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px #1c47f622',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Help"
        >
          <span className="material-icons">help_outline</span>
        </button>
        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsPage(true)}
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#6c6f7d',
            border: '2.5px solid #6c6f7d',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px #6c6f7d22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Settings"
        >
          <span className="material-icons">settings</span>
        </button>
        {/* Club/Group Challenges Button */}
        <button
          onClick={() => setShowClubModal(true)}
          style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)',
            color: '#1cb0f6',
            border: '2.5px solid #1cb0f6',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px #1cb0f622',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="View Language Club"
        >
          <span className="material-icons">group</span>
        </button>
        {/* Leaderboard Button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          style={{
            background: 'linear-gradient(135deg, #ffe082 0%, #ffd54f 100%)',
            color: '#ffb300',
            border: '2.5px solid #ffb300',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 6px 20px #ffb30055, 0 2px 8px #ffb30022',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="View Leaderboard"
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 8px 28px #ffb30099, 0 4px 16px #ffb30033';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px #ffb30055, 0 2px 8px #ffb30022';
          }}
        >
          <span className="material-icons">emoji_events</span>
        </button>
        {/* Progression Map Button */}
        <button
          onClick={() => setShowProgressionMap(true)}
          style={{
            background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
            color: '#58cc02',
            border: '2.5px solid #58cc02',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px #58cc0222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="View Progression Map"
        >
          <span className="material-icons">account_tree</span>
        </button>
      </div>
      {/* Club/Group Challenges Modal */}
      {showClubModal && (
        <LanguageClub
          club={CLUB}
          mascotImg={mascotImg}
          onClose={() => setShowClubModal(false)}
        />
      )}
      {/* Progression Map Modal */}
      {showProgressionMap && (
        <ProgressionMap
          onClose={() => setShowProgressionMap(false)}
        />
      )}
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20,20,30,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        </div>
      )}
      {/* Help Modal */}
      {showHelp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            borderRadius: '24px',
            width: '90%',
            maxWidth: '520px',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(88, 204, 2, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid rgba(88, 204, 2, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.02) 0%, rgba(88, 204, 2, 0.05) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-icons" style={{ 
                  fontSize: '28px', 
                  color: '#58cc02',
                  background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 2px 8px rgba(88, 204, 2, 0.15)'
                }}>
                  mic
                </span>
                <h2 style={{ 
                  margin: 0, 
                  color: '#3caa3c',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  Voice Commands
                </h2>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                style={{
                  background: 'rgba(108, 122, 137, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#3caa3c',
                  transition: 'all 0.2s ease',
                  fontSize: '20px'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(108, 122, 137, 0.2)';
                  e.currentTarget.style.color = '#58cc02';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(108, 122, 137, 0.1)';
                  e.currentTarget.style.color = '#3caa3c';
                }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            {/* Content */}
            <div style={{ 
              padding: '20px 28px 28px', 
              maxHeight: '65vh', 
              overflowY: 'auto',
              background: '#fff'
            }}>
              <div style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
              }}>
                {VOICE_COMMANDS.map(cmd => (
                  <div key={cmd.action} style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid rgba(88, 204, 2, 0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(88, 204, 2, 0.12)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(88, 204, 2, 0.15)',
                        border: '1px solid rgba(88, 204, 2, 0.2)'
                      }}>
                        <span className="material-icons" style={{
                          fontSize: '24px',
                          color: '#58cc02'
                        }}>
                          {cmd.action === 'next' ? 'skip_next' :
                           cmd.action === 'repeat' ? 'replay' :
                           cmd.action === 'leaderboard' ? 'emoji_events' :
                           cmd.action === 'settings' ? 'settings' :
                           cmd.action === 'start' ? 'play_arrow' :
                           cmd.action === 'profile' ? 'person' :
                           cmd.action === 'help' ? 'help_outline' :
                           cmd.action === 'back' ? 'arrow_back' :
                           cmd.action === 'home' ? 'home' :
                           cmd.action === 'exit' ? 'exit_to_app' : 'mic'}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#3caa3c',
                          fontSize: '1rem',
                          marginBottom: '4px',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          {cmd.phrases[0].charAt(0).toUpperCase() + cmd.phrases[0].slice(1)}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#3caa3c',
                          opacity: 0.8,
                          lineHeight: 1.4
                        }}>
                          {cmd.desc}
                        </div>
                        <div style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#58cc02',
                          opacity: 0.7,
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          Try: {cmd.phrases.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer tip */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.05) 0%, rgba(88, 204, 2, 0.02) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(88, 204, 2, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span className="material-icons" style={{
                  fontSize: '20px',
                  color: '#58cc02'
                }}>
                  lightbulb
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#3caa3c',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  <strong>Tip:</strong> Speak clearly and naturally. The AI will respond with spoken feedback for recognized commands.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add global age validation error UI */}
      {ageError && (
        <div style={{
          color: '#ff4d4f',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '12px',
          padding: '1rem',
          margin: '1rem auto',
          maxWidth: 400,
          fontWeight: 600,
          fontSize: '1rem',
          textAlign: 'center',
          zIndex: 10000
        }}>
          <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: 6 }}>error_outline</span>
          {ageError}
        </div>
      )}
    </div>
  } />
    </Routes>
  );
};

function App() {
  const navigate = useNavigate();

  return (
    <UserProvider>
      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage onClose={() => { navigate('/'); }} />} />
        <Route path="/" element={
          <AppContent />
        } />
      </Routes>
    </UserProvider>
  );
}

export default App;