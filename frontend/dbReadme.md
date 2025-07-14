# Database Integration for Frontend

This document describes how the frontend integrates with the backend database system.

## Overview

The frontend now uses a comprehensive database system to store user data, game sessions, scores, streaks, badges, and activities. The integration is built around a centralized API service and React context.

## Architecture

### 1. API Service (`src/services/api.ts`)

The main API service provides:
- **User Management**: Create, get, update users, validate usernames
- **Game Operations**: Submit scores, manage game sessions, get leaderboard
- **Engagement Features**: Manage streaks, levels, badges, quotes, tips
- **Error Handling**: Centralized error handling and logging
- **Local Storage**: Utilities for managing local user data

### 2. User Context (`src/context/UserContext.tsx`)

React context that provides:
- **User State Management**: Current user, loading states, errors
- **Database Operations**: All CRUD operations wrapped in context
- **Session Management**: Game session lifecycle
- **Automatic Initialization**: Loads user from localStorage on mount

### 3. Updated Components

Components updated to use the database:
- **NicknamePrompt**: Creates users in database
- **App**: Manages game sessions, submits scores, awards badges
- **Leaderboard**: Fetches data from database API

## Key Features

### User Management
```typescript
// Create new user
const { createUser } = useUser();
await createUser({ nickname: 'player1', avatar_url: 'url' });

// Login existing user
const { loginUser } = useUser();
await loginUser('player1');
```

### Game Session Management
```typescript
// Start game session
const { startGameSession } = useUser();
const sessionId = await startGameSession({
  category: 'debate',
  difficulty: 'medium'
});

// End game session
const { endGameSession } = useUser();
await endGameSession(sessionId, {
  end_time: new Date().toISOString(),
  total_score: 85,
  rounds_played: 5,
  status: 'completed'
});
```

### Score Submission
```typescript
// Submit score with details
const { submitScore } = useUser();
await submitScore({
  score: 85,
  details: {
    roundWins: 4,
    uniqueWords: 25,
    allPersuaded: true,
    badges: ['streak', 'creative']
  }
});
```

### Badge System
```typescript
// Award badges
const { awardBadge } = useUser();
await awardBadge('streak', 'Streak Master', 'Won 3+ rounds');
```

### Streak Management
```typescript
// Increment streak on success
const { incrementStreak } = useUser();
await incrementStreak();

// Reset streak on failure
const { resetStreak } = useUser();
await resetStreak();
```

## Database Schema Integration

The frontend integrates with these database tables:

### Users
- `nickname`: Unique username
- `avatar_url`: Profile picture URL
- `created_at`: Account creation date
- `last_login`: Last login timestamp
- `total_score`: Cumulative score
- `games_played`: Number of games
- `current_streak`: Current streak count
- `highest_streak`: Best streak achieved

### Scores
- `user_id`: Reference to user
- `score`: Game score
- `game_session_id`: Session reference
- `details`: JSON with game details
- `created_at`: Submission timestamp

### Game Sessions
- `session_id`: Unique session identifier
- `user_id`: Player reference
- `start_time`: Session start
- `end_time`: Session end
- `total_score`: Final score
- `rounds_played`: Number of rounds
- `status`: active/completed/abandoned

### Streaks
- `user_id`: Player reference
- `current_streak`: Active streak
- `highest_streak`: Best streak
- `last_activity_date`: Last activity

### Badges
- `user_id`: Player reference
- `badge_type`: Badge identifier
- `badge_name`: Display name
- `badge_description`: Description
- `awarded_at`: Award timestamp

### Activities
- `user_id`: Player reference
- `activity_type`: Activity type
- `details`: JSON with activity data
- `created_at`: Activity timestamp

## Error Handling

The integration includes comprehensive error handling:

```typescript
// API errors are caught and displayed
try {
  await createUser(userData);
} catch (error) {
  setError(error.message || 'Failed to create user');
}

// Network errors are handled gracefully
if (error.response?.status === 404) {
  return 'Resource not found';
}
```

## Testing

Use the test integration function to verify database connectivity:

```typescript
import { testDatabaseIntegration } from './services/test-integration';

// Run in browser console
await testDatabaseIntegration();
```

## Migration from Legacy

The integration maintains backward compatibility:
- Legacy score submission still works
- Old leaderboard endpoint is preserved
- Local storage is used for user persistence

## Environment Setup

1. **Backend**: Ensure database is running and initialized
2. **Frontend**: API base URL points to backend (default: `http://localhost:8000/api/v1`)
3. **CORS**: Backend allows frontend origin

## Performance Considerations

- **Caching**: User data cached in context
- **Debouncing**: Username validation debounced
- **Error Recovery**: Automatic retry for network issues
- **Offline Support**: Local storage for user preferences

## Security

- **Input Validation**: All user inputs validated
- **Error Sanitization**: Sensitive data not exposed in errors
- **Rate Limiting**: Backend implements rate limiting
- **CORS**: Proper CORS configuration

