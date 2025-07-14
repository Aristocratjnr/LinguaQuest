from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Models
class UserCreate(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=16)
    avatar: Optional[str] = None
    email: Optional[str] = None

class UserUpdate(BaseModel):
    avatar: Optional[str] = None
    email: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    id: int
    nickname: str
    avatar: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    last_login: datetime
    is_active: bool
    preferences: Dict[str, Any] = {}

    class Config:
        from_attributes = True

# Activity Models
class ActivityCreate(BaseModel):
    activity_type: str
    details: Optional[Dict[str, Any]] = None

class ActivityResponse(BaseModel):
    id: int
    user_id: int
    activity_type: str
    details: Dict[str, Any] = {}
    timestamp: datetime

    class Config:
        from_attributes = True

# Score Models
class ScoreCreate(BaseModel):
    score: int = Field(..., ge=0)
    language: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    game_session_id: Optional[str] = None

class ScoreResponse(BaseModel):
    id: int
    user_id: int
    score: int
    language: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    game_session_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Streak Models
class StreakUpdate(BaseModel):
    current_streak: int = Field(..., ge=0)
    longest_streak: Optional[int] = None

class StreakResponse(BaseModel):
    id: int
    user_id: int
    current_streak: int
    longest_streak: int
    last_activity_date: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Badge Models
class BadgeCreate(BaseModel):
    badge_type: str
    badge_name: str
    badge_description: Optional[str] = None

class BadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_type: str
    badge_name: str
    badge_description: Optional[str] = None
    earned_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Game Session Models
class GameSessionCreate(BaseModel):
    session_id: str
    language: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    session_data: Optional[Dict[str, Any]] = None

class GameSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    total_score: Optional[int] = None
    rounds_played: Optional[int] = None
    rounds_won: Optional[int] = None
    session_data: Optional[Dict[str, Any]] = None

class GameSessionResponse(BaseModel):
    id: int
    session_id: str
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    total_score: int
    rounds_played: int
    rounds_won: int
    language: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    session_data: Dict[str, Any] = {}

    class Config:
        from_attributes = True

# Leaderboard Models
class LeaderboardEntry(BaseModel):
    """Leaderboard entry for a user, including stats, badges, favorite language, and rank."""
    rank: int
    nickname: str
    avatar: Optional[str] = None
    total_score: int
    highest_score: int
    games_played: int
    current_streak: int
    longest_streak: int
    badges_count: int
    last_activity: datetime
    favorite_language: str
    level: int

# User Stats Models
class UserStats(BaseModel):
    total_score: int
    highest_score: int
    games_played: int
    current_streak: int
    longest_streak: int
    badges_count: int
    favorite_language: str
    total_rounds_won: int
    total_rounds_played: int
    win_rate: float 