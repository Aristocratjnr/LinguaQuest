# LinguaQuest Database Implementation

This document describes the database implementation for LinguaQuest, which stores users, activities, scores, streaks, badges, and game sessions.

## Database Schema

### Tables

1. **users** - User profiles and preferences
2. **user_activities** - User activity tracking
3. **user_scores** - Game scores and performance
4. **user_streaks** - Daily streaks and engagement
5. **user_badges** - Achievements and badges
6. **game_sessions** - Game session tracking

### Key Features

- **SQLite database** for simplicity and portability
- **SQLAlchemy ORM** for database operations
- **Pydantic models** for API request/response validation
- **Comprehensive CRUD operations** for all entities
- **Activity tracking** for analytics
- **Streak management** for engagement
- **Badge system** for gamification
- **Game session tracking** for detailed analytics

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
python init_db.py
```

This will:
- Create all database tables
- Add sample users (alice, bob, charlie, diana)
- Set up initial streaks for all users

### 3. Start the Server

```bash
uvicorn main:app --reload
```

## API Endpoints

### User Management (`/users`)

- `POST /users` - Create new user
- `GET /users/{nickname}` - Get user profile
- `PUT /users/{nickname}` - Update user profile
- `POST /users/{nickname}/login` - Record user login
- `GET /users/{nickname}/activities` - Get user activity history
- `GET /users/validate` - Validate username

### Game Operations (`/game`)

- `POST /scores` - Submit game score
- `GET /scores/{nickname}` - Get user score history
- `GET /scores/{nickname}/highest` - Get user's best score
- `GET /leaderboard` - Get leaderboard data
- `POST /sessions` - Start game session
- `PUT /sessions/{session_id}` - End game session
- `GET /sessions/{session_id}` - Get session details
- `GET /stats/{nickname}` - Get user statistics

### Engagement (`/engagement`)

- `GET /streak` - Get user streak
- `PATCH /streak` - Update user streak
- `POST /streak/increment` - Increment streak
- `POST /streak/reset` - Reset streak
- `GET /level` - Get user level
- `PATCH /level` - Update user level
- `GET /badges/{nickname}` - Get user badges
- `POST /badges/{nickname}` - Award badge
- `GET /quotes` - Get motivational quotes
- `GET /tips` - Get game tips

## Database Models

### User
```python
{
    "id": int,
    "nickname": str,
    "avatar": str,
    "email": str,
    "created_at": datetime,
    "last_login": datetime,
    "is_active": bool,
    "preferences": dict
}
```

### UserActivity
```python
{
    "id": int,
    "user_id": int,
    "activity_type": str,
    "details": dict,
    "timestamp": datetime
}
```

### UserScore
```python
{
    "id": int,
    "user_id": int,
    "score": int,
    "language": str,
    "category": str,
    "difficulty": str,
    "game_session_id": str,
    "created_at": datetime
}
```

### UserStreak
```python
{
    "id": int,
    "user_id": int,
    "current_streak": int,
    "longest_streak": int,
    "last_activity_date": datetime,
    "updated_at": datetime
}
```

### UserBadge
```python
{
    "id": int,
    "user_id": int,
    "badge_type": str,
    "badge_name": str,
    "badge_description": str,
    "earned_at": datetime,
    "is_active": bool
}
```

### GameSession
```python
{
    "id": int,
    "session_id": str,
    "user_id": int,
    "start_time": datetime,
    "end_time": datetime,
    "total_score": int,
    "rounds_played": int,
    "rounds_won": int,
    "language": str,
    "category": str,
    "difficulty": str,
    "session_data": dict
}
```

## Usage Examples

### Creating a User
```python
import requests

user_data = {
    "nickname": "john_doe",
    "avatar": "avatar.jpg",
    "email": "john@example.com"
}

response = requests.post("http://localhost:8000/users", json=user_data)
user = response.json()
```

### Submitting a Score
```python
score_data = {
    "score": 85,
    "language": "twi",
    "category": "politics",
    "difficulty": "medium"
}

response = requests.post(
    "http://localhost:8000/scores?nickname=john_doe", 
    json=score_data
)
```

### Getting User Stats
```python
response = requests.get("http://localhost:8000/stats/john_doe")
stats = response.json()
# Returns: total_score, highest_score, games_played, current_streak, etc.
```

### Awarding a Badge
```python
response = requests.post(
    "http://localhost:8000/badges/john_doe",
    params={
        "badge_type": "streak",
        "badge_name": "7-Day Streak",
        "badge_description": "Maintained a 7-day streak"
    }
)
```

## Migration from Old System

The new database system is designed to be backward compatible with the existing API endpoints. The old in-memory data has been replaced with persistent database storage.

### Key Changes

1. **Persistent Storage** - All data is now stored in SQLite database
2. **User Management** - Proper user creation and validation
3. **Activity Tracking** - All user actions are logged
4. **Enhanced Analytics** - Detailed statistics and reporting
5. **Badge System** - Comprehensive achievement tracking

## Development

### Adding New Features

1. **Add new models** in `database.py`
2. **Create Pydantic schemas** in `models.py`
3. **Implement CRUD operations** in `crud.py`
4. **Add API endpoints** in appropriate router files
5. **Update tests** as needed

### Database Migrations

For production, consider using Alembic for database migrations:

```bash
pip install alembic
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Troubleshooting

### Common Issues

1. **Database not found** - Run `python init_db.py`
2. **Import errors** - Ensure all dependencies are installed
3. **Permission errors** - Check file permissions for database file
4. **Connection errors** - Verify database URL in `database.py`

### Debugging

Enable SQLAlchemy logging:
```python
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

## Performance Considerations

- **Indexes** - All foreign keys and frequently queried fields are indexed
- **Connection pooling** - SQLAlchemy handles connection management
- **Query optimization** - Use appropriate joins and filters
- **Caching** - Consider Redis for frequently accessed data

## Security

- **Input validation** - All inputs are validated using Pydantic
- **SQL injection protection** - SQLAlchemy provides parameterized queries
- **User authentication** - Implement proper authentication for production
- **Data sanitization** - All user inputs are sanitized

## Future Enhancements

1. **PostgreSQL support** - For production scalability
2. **Redis caching** - For improved performance
3. **User authentication** - JWT tokens and password hashing
4. **Analytics dashboard** - Real-time user analytics
5. **Multi-language support** - Internationalization
6. **API rate limiting** - Prevent abuse
7. **Backup and recovery** - Automated database backups 