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
  const { user, userStats, submitScore, startGameSession, endGameSession, incrementStreak, resetStreak, awardBadge } = useUser();
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
      
      setFeedback(res.data.feedback);
      setScore(res.data.score);
      
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
          audioSuccess.current?.play();
        }
      }
    } catch (e) {
      setFeedback('Evaluation error.');
      setScore(null);
      // Play fail sound
      audioFail.current?.play();
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

  // Scenario will be loaded after category/difficulty selection
  // useEffect(() => {
  //   fetchScenario();
  //   // eslint-disable-next-line
  // }, []);

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
  const handleOpenChest = () => {
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
    return <SettingsPage onClose={() => setShowSettingsPage(false)} />;
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
          {/* Left: Logo + Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: 0 }}>
            {/* Logo and app name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  color: DUOLINGO_COLORS.green,
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.01em',
                  opacity: 0.92
                }}>
                  LinguaQuest
                </span>
                <span className="material-icons" style={{ fontSize: '22px', color: DUOLINGO_COLORS.green, opacity: 0.85 }}>psychology</span>
              </div>
              <span style={{
                color: DUOLINGO_COLORS.darkGray,
                fontSize: '12px',
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
            <div style={{ position: 'relative', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    width: 48,
                    height: 48,
                    zIndex: 10,
                    filter: 'drop-shadow(0 4px 16px #58cc0255)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* Sparkle/confetti effect */}
              {showMascotCelebrate && (
                <Confetti
                  width={120}
                  height={80}
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
              <svg width={54} height={54} style={{ position: 'absolute', top: 0, left: 0 }}>
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
                fontSize: 32,
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
                  fontSize: 26,
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
                  fontSize: 14,
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <span style={{ fontWeight: 700, color: '#ff9c1a', fontSize: 15, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.01em' }}>
                {userStats ? `${dailyXp} / ${DAILY_GOAL} XP` : '-- / 100 XP'}
              </span>
              <span style={{ color: '#6c6f7d', fontSize: 12, opacity: 0.7, fontFamily: 'JetBrains Mono, monospace' }}>
                Daily Goal
              </span>
            </div>
          </div>
          {/* User profile and right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Daily Reward Chest */}
            <div
              style={{
                width: 38,
                height: 38,
                marginRight: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.2s',
                zIndex: 2,
              }}
              title="Daily Reward Chest: Open for a surprise!"
              onClick={handleOpenChest}
            >
              <motion.span
                className="material-icons"
                initial={{ scale: 1 }}
                animate={{ scale: chestOpenState ? 1.15 : 1, rotate: chestOpenState ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.5 }}
                style={{
                  fontSize: 36,
                  color: chestOpenState ? '#ffb300' : '#8d6e63',
                  filter: chestOpenState ? 'brightness(1.2)' : 'none',
                  transition: 'color 0.2s',
                  userSelect: 'none',
                }}
              >{chestOpenState ? 'emoji_events' : 'card_giftcard'}</motion.span>
              {/* Sparkle when open */}
              {chestOpenState && (
                <span className="material-icons" style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  color: '#ffd700',
                  fontSize: 24,
                  filter: 'drop-shadow(0 2px 8px #ffd70088)',
                  zIndex: 3,
                  animation: 'chest-sparkle 1.2s infinite',
                }}>auto_awesome</span>
              )}
            </div>
            <div 
              style={{
                width: '36px',
                height: '36px',
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
                src={user?.avatar_url || avatar} 
                alt="User" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 400,
                color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                fontSize: '13px',
                opacity: 0.7,
                letterSpacing: '0.01em',
                lineHeight: 1.1
              }}>
                Welcome back
              </span>
              <span style={{
                fontWeight: 'bold',
                color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                fontSize: '14px',
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #232946 0%, #181c2a 100%)'
            : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px', // smaller radius
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
          minHeight: '110px', // smaller height
          padding: '12px 10px', // smaller padding
        }}>
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
                minHeight: '140px'
              }}
            >
            <ProgressBar round={round} totalRounds={TOTAL_ROUNDS} />
            </motion.div>
            
            {/* Visual divider */}
            <motion.div
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
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: DUOLINGO_COLORS.green,
              color: DUOLINGO_COLORS.white,
              border: 'none',
              borderRadius: '8px', // smaller radius
              padding: '8px 18px', // smaller padding, more compact
              fontWeight: 600,
              fontSize: '14px', // smaller font
              cursor: 'pointer',
              boxShadow: `0 4px 0 ${DUOLINGO_COLORS.darkGreen}`,
              minWidth: '120px', // set a minimum width
              maxWidth: '160px', // set a maximum width
              width: 'auto', // do not stretch
              flex: 'none', // do not stretch
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

      {/* Footer - Duolingo style */}
      {!showLeaderboard && !showHelp && !showSettingsPage && (
        <>
          <footer style={{
            padding: '12px 16px',
            marginTop: 'auto',
            boxShadow: theme === 'dark' ? '0 -2px 8px #181c2a' : '0 -2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'center',
            background: theme === 'dark' ? '#181c2a' : '#fff',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              display: 'flex',
              gap: '32px',
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
                  color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = DUOLINGO_COLORS.green}
                onMouseOut={e => e.currentTarget.style.color = DUOLINGO_COLORS.darkGray}
              >
                <span className="material-icons" style={{ fontSize: '28px', marginBottom: '2px', transition: 'color 0.2s' }}>leaderboard</span>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', opacity: 0.85 }}>Leaderboard</span>
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
                  color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = DUOLINGO_COLORS.green}
                onMouseOut={e => e.currentTarget.style.color = DUOLINGO_COLORS.darkGray}
              >
                <span className="material-icons" style={{ fontSize: '28px', marginBottom: '2px', transition: 'color 0.2s' }}>settings</span>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', opacity: 0.85 }}>Settings</span>
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
                  color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = DUOLINGO_COLORS.green}
                onMouseOut={e => e.currentTarget.style.color = DUOLINGO_COLORS.darkGray}
              >
                <span className="material-icons" style={{ fontSize: '28px', marginBottom: '2px', transition: 'color 0.2s' }}>help_outline</span>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', opacity: 0.85 }}>Help</span>
              </button>
            </div>
          </footer>
          <div style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '12px',
            color: theme === 'dark' ? '#e0e7ff' : DUOLINGO_COLORS.darkGray,
            opacity: 0.7,
            fontFamily: 'JetBrains Mono, monospace',
            padding: '8px 0 16px 0',
            background: theme === 'dark' ? '#181c2a' : '#fff',
            letterSpacing: '0.01em',
            zIndex: 0
          }}>
            &copy; {new Date().getFullYear()} LinguaQuest. All rights reserved. Developed by Opoku Boakye Michael
          </div>
        </>
      )}

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
                  color: DUOLINGO_COLORS.green,
                  background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 2px 8px rgba(88, 204, 2, 0.15)'
                }}>
                  mic
                </span>
                <h2 style={{ 
                  margin: 0, 
                  color: DUOLINGO_COLORS.darkGray,
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
                  color: DUOLINGO_COLORS.darkGray,
                  transition: 'all 0.2s ease',
                  fontSize: '20px'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(108, 122, 137, 0.2)';
                  e.currentTarget.style.color = DUOLINGO_COLORS.green;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(108, 122, 137, 0.1)';
                  e.currentTarget.style.color = DUOLINGO_COLORS.darkGray;
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
                          color: DUOLINGO_COLORS.green
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
                          color: DUOLINGO_COLORS.darkGray,
                          fontSize: '1rem',
                          marginBottom: '4px',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          {cmd.phrases[0].charAt(0).toUpperCase() + cmd.phrases[0].slice(1)}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: DUOLINGO_COLORS.darkGray,
                          opacity: 0.8,
                          lineHeight: 1.4
                        }}>
                          {cmd.desc}
                        </div>
                        <div style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: DUOLINGO_COLORS.green,
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
                  color: DUOLINGO_COLORS.green
                }}>
                  lightbulb
                </span>
                <span style={{
                  fontSize: '14px',
                  color: DUOLINGO_COLORS.darkGray,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  <strong>Tip:</strong> Speak clearly and naturally. The AI will respond with spoken feedback for recognized commands.
                </span>
              </div>
            </div>
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
              numberOfPieces={120}
              colors={[DUOLINGO_COLORS.green, DUOLINGO_COLORS.blue, DUOLINGO_COLORS.orange, DUOLINGO_COLORS.purple]}
              style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
            />
            <span className="material-icons" style={{ fontSize: 64, color: '#ffb300', marginBottom: 8, filter: 'drop-shadow(0 2px 8px #ffd70088)' }}>emoji_events</span>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', margin: 0 }}>Daily Reward!</h2>
            <div style={{ fontSize: '1.3rem', color: '#ff9c1a', marginBottom: '8px', fontWeight: 700 }}>{chestReward}</div>
            <button
              onClick={() => setShowChestReward(false)}
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