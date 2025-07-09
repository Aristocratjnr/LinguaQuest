import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets';
import avatar from './assets/images/avatar.png';
import Confetti from 'react-confetti';
import successSfx from './assets/sounds/sfx-success.mp3';
import failSfx from './assets/sounds/sfx-fail.mp3';
import clickSfx from './assets/music/sfx-buttonclick.mp3';
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
import Badges from './components/Badges';
import CategorySelector from './components/CategorySelector';

const TONES = ['polite', 'passionate', 'formal', 'casual'];
const LANGUAGES = [
  { code: 'twi', label: 'Twi' },
  { code: 'gaa', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
];
const TOTAL_ROUNDS = 5;
const ROUND_TIME = 30; // seconds

const App: React.FC = () => {
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
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [shake, setShake] = useState(false);
  const audioSuccess = useRef<HTMLAudioElement|null>(null);
  const audioFail = useRef<HTMLAudioElement|null>(null);
  const audioClick = useRef<HTMLAudioElement|null>(null);
  const [nickname, setNickname] = useState(() => localStorage.getItem('lq_nickname') || '');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('lq_avatar') || '');
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(!nickname);
  const [showAvatarPicker, setShowAvatarPicker] = useState(!avatar && !showNicknamePrompt);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [roundWins, setRoundWins] = useState(0);
  const [allPersuaded, setAllPersuaded] = useState(true);
  const [uniqueWords, setUniqueWords] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(true);

  // Timer logic
  useEffect(() => {
    if (!timerActive || roundResult !== 'playing') return;
    if (timeLeft === 0) {
      setRoundResult('fail');
      setTimerActive(false);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [timeLeft, timerActive, roundResult]);

  // Fetch scenario
  const fetchScenario = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/scenario', { category, difficulty });
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
      const res = await axios.post('/translate', {
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
      const res = await axios.post('/evaluate', {
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
      const res = await axios.post('/dialogue', {
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
    setAvatar(avatarUrl);
    localStorage.setItem('lq_avatar', avatarUrl);
    setShowAvatarPicker(false);
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

  // Onboarding logic
  if (showNicknamePrompt) {
    return <NicknamePrompt onConfirm={handleNicknameConfirm} />;
  }
  if (showAvatarPicker) {
    return <AvatarPicker onConfirm={handleAvatarConfirm} />;
  }
  if (showCategorySelector) {
    return <CategorySelector onConfirm={handleCategoryConfirm} />;
  }
  if (showOnboarding) {
    return (
      <>
        <Onboarding show={showOnboarding} onStart={() => { setShowOnboarding(false); playClick(); }} playClick={playClick} />
        <button className="lq-btn lq-btn-scenario" style={{ marginTop: 24 }} onClick={() => setShowLeaderboard(true)}>View Leaderboard</button>
        {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      </>
    );
  }

  // Game over screen leaderboard button
  const showGameOverLeaderboard = roundResult === 'gameover' && !showLeaderboard;

  return (
    <div className={`lq-root${shake ? ' lq-shake' : ''}`}>
      {roundResult === 'success' && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200} recycle={false} />}
      <header className="lq-header">
        <img src={logo} alt="LinguaQuest Logo" className="lq-logo" />
        <h1>LinguaQuest</h1>
        <img src={avatar || require('./avatar.png')} alt="AI Character" className="lq-avatar" />
      </header>
      <ProgressBar round={round} totalRounds={TOTAL_ROUNDS} />
      <main className="lq-card">
        <div className="lq-timer-container">
          <Timer seconds={ROUND_TIME} timeLeft={timeLeft} isActive={timerActive && roundResult === 'playing'} />
        </div>
        {roundResult === 'success' && <div className="lq-round-success">🎉 Persuaded! +1</div>}
        {roundResult === 'fail' && <div className="lq-round-fail">⏰ Time's up! Try next round.</div>}
        {roundResult === 'gameover' && <>
          <div className="lq-gameover">🏆 Game Over! Thanks for playing.</div>
          {badges.length > 0 && <Badges badges={badges} />}
        </>}
        {showGameOverLeaderboard && <button className="lq-btn lq-btn-scenario" onClick={() => setShowLeaderboard(true)}>View Leaderboard</button>}
        {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
        <button className="lq-btn lq-btn-scenario" onClick={fetchScenario} disabled={loading || roundResult !== 'playing'}>New Scenario</button>
        <Scenario
          scenario={scenario}
          language={language}
          loading={loading || roundResult !== 'playing'}
          onLanguageChange={setLanguage}
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
        />
        {loading && <div className="lq-loading">Loading...</div>}
      </main>
      <footer className="lq-footer">&copy; {new Date().getFullYear()} LinguaQuest</footer>
      <audio ref={audioSuccess} src={successSfx} preload="auto" />
      <audio ref={audioFail} src={failSfx} preload="auto" />
      <audio ref={audioClick} src={clickSfx} preload="auto" />
    </div>
  );
};

export default App; 