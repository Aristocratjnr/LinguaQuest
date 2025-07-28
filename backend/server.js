const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

const USER_STREAKS = {
  alice: 5,
  bob: 3,
  guest: 1,
};
const USER_LEVELS = {
  alice: 4,
  bob: 2,
  guest: 1,
};
const QUOTES = [
  '"Learning another language is like becoming another person." – Haruki Murakami',
  '"The limits of my language mean the limits of my world." – Ludwig Wittgenstein',
  '"Practice makes perfect. Keep going!"',
  '"Every day is a new chance to improve your skills."',
  '"Mistakes are proof that you are trying."',
];
const TIPS = [
  'Use persuasive arguments to convince the AI! 💡',
  'Try different tones: polite, passionate, formal, or casual.',
  'Switch languages to challenge yourself.',
  'Check the leaderboard to see how you rank!',
  'Collect badges for creative and high-scoring arguments.',
];
const PROFANITY_LIST = new Set(['badword', 'admin', 'root', 'test']);

const CATEGORIES = [
  { key: 'food', label: 'Food', icon: 'restaurant' },
  { key: 'environment', label: 'Environment', icon: 'eco' },
  { key: 'technology', label: 'Technology', icon: 'devices' },
  { key: 'culture', label: 'Culture', icon: 'diversity_3' },
];
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', color: '#28a745' },
  { key: 'medium', label: 'Medium', color: '#fd7e14' },
  { key: 'hard', label: 'Hard', color: '#dc3545' },
];

// Username validation endpoint
app.get('/api/engagement/validate_username', (req, res) => {
  const nickname = (req.query.nickname || '').trim();
  if (nickname.length < 3 || nickname.length > 16) {
    return res.json({ valid: false, reason: 'Nickname must be 3-16 characters.' });
  }
  if (!/^[A-Za-z0-9_]+$/.test(nickname)) {
    return res.json({ valid: false, reason: 'Only letters, numbers, and underscores allowed.' });
  }
  if (PROFANITY_LIST.has(nickname.toLowerCase())) {
    return res.json({ valid: false, reason: 'Nickname not allowed.' });
  }
  if (USER_STREAKS[nickname.toLowerCase()]) {
    return res.json({ valid: false, reason: 'Nickname already taken.' });
  }
  return res.json({ valid: true, reason: 'Looks good!' });
});

// User creation endpoint
app.post('/api/engagement/user', (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  if (!nickname) return res.status(400).json({ success: false, error: 'Nickname required.' });
  if (USER_STREAKS[nickname.toLowerCase()]) {
    return res.status(400).json({ success: false, error: 'User already exists.' });
  }
  USER_STREAKS[nickname.toLowerCase()] = 1;
  USER_LEVELS[nickname.toLowerCase()] = 1;
  return res.json({ success: true, nickname });
});

// Streak endpoint
app.get('/api/engagement/streak', (req, res) => {
  const nickname = (req.query.nickname || '').toLowerCase();
  res.json({ streak: USER_STREAKS[nickname] || 1 });
});

// Level endpoint
app.get('/api/engagement/level', (req, res) => {
  const nickname = (req.query.nickname || '').toLowerCase();
  res.json({ level: USER_LEVELS[nickname] || 1 });
});

// Quotes endpoint
app.get('/api/engagement/quotes', (req, res) => {
  res.json(QUOTES);
});

// Tips endpoint
app.get('/api/engagement/tips', (req, res) => {
  res.json(TIPS);
});

// Leaderboard endpoint (top users by streak)
app.get('/api/engagement/leaderboard', (req, res) => {
  // Return top 10 users by streak
  const leaderboard = Object.keys(USER_STREAKS)
    .map(nickname => ({
      nickname,
      streak: USER_STREAKS[nickname],
      level: USER_LEVELS[nickname] || 1
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);
  res.json(leaderboard);
});

// User profile endpoint
app.get('/api/engagement/user', (req, res) => {
  const nickname = (req.query.nickname || '').toLowerCase();
  if (!nickname || !USER_STREAKS[nickname]) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({
    nickname,
    streak: USER_STREAKS[nickname],
    level: USER_LEVELS[nickname] || 1
  });
});

// Update streak/level endpoint
app.post('/api/engagement/update', (req, res) => {
  const { nickname, streak, level } = req.body;
  if (!nickname || !USER_STREAKS[nickname.toLowerCase()]) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  if (typeof streak === 'number') USER_STREAKS[nickname.toLowerCase()] = streak;
  if (typeof level === 'number') USER_LEVELS[nickname.toLowerCase()] = level;
  res.json({ success: true });
});

// Increment streak endpoint
app.post('/api/engagement/streak/increment', (req, res) => {
  const nickname = (req.query.nickname || '').toLowerCase();
  if (!nickname || !USER_STREAKS[nickname]) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  USER_STREAKS[nickname] = (USER_STREAKS[nickname] || 0) + 1;
  res.json({ streak: USER_STREAKS[nickname] });
});

// Reset streak endpoint
app.post('/api/engagement/streak/reset', (req, res) => {
  const nickname = (req.query.nickname || '').toLowerCase();
  if (!nickname || !USER_STREAKS[nickname]) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  USER_STREAKS[nickname] = 1;
  res.json({ streak: 1 });
});

// Delete user endpoint
app.delete('/api/engagement/user', (req, res) => {
  const nickname = (req.body.nickname || '').toLowerCase();
  if (!nickname || !USER_STREAKS[nickname]) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  delete USER_STREAKS[nickname];
  delete USER_LEVELS[nickname];
  res.json({ success: true });
});

app.get('/api/engagement/categories', (req, res) => {
  res.json(CATEGORIES);
});
app.get('/api/engagement/difficulties', (req, res) => {
  res.json(DIFFICULTIES);
});

app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
}); 