from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from database import User, UserActivity, UserScore, UserStreak, UserBadge, GameSession
from models import UserCreate, UserUpdate, ActivityCreate, ScoreCreate, StreakUpdate, BadgeCreate, GameSessionCreate, GameSessionUpdate

# User CRUD operations
def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        nickname=user.nickname,
        avatar=user.avatar,
        email=user.email,
        preferences={}
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create initial streak record
    streak = UserStreak(user_id=db_user.id)
    db.add(streak)
    db.commit()
    
    return db_user

def get_user_by_nickname(db: Session, nickname: str) -> Optional[User]:
    return db.query(User).filter(User.nickname == nickname).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_last_login(db: Session, user_id: int):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.last_login = datetime.utcnow()
        db.commit()

# Activity CRUD operations
def create_activity(db: Session, user_id: int, activity: ActivityCreate) -> UserActivity:
    db_activity = UserActivity(
        user_id=user_id,
        activity_type=activity.activity_type,
        details=activity.details or {}
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def get_user_activities(db: Session, user_id: int, limit: int = 50) -> List[UserActivity]:
    return db.query(UserActivity).filter(
        UserActivity.user_id == user_id
    ).order_by(desc(UserActivity.timestamp)).limit(limit).all()

# Score CRUD operations
def create_score(db: Session, user_id: int, score: ScoreCreate) -> UserScore:
    db_score = UserScore(
        user_id=user_id,
        score=score.score,
        language=score.language,
        category=score.category,
        difficulty=score.difficulty,
        game_session_id=score.game_session_id
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

def get_user_scores(db: Session, user_id: int, limit: int = 50) -> List[UserScore]:
    return db.query(UserScore).filter(
        UserScore.user_id == user_id
    ).order_by(desc(UserScore.created_at)).limit(limit).all()

def get_user_highest_score(db: Session, user_id: int) -> Optional[UserScore]:
    return db.query(UserScore).filter(
        UserScore.user_id == user_id
    ).order_by(desc(UserScore.score)).first()

def get_leaderboard(db: Session, limit: int = 100, offset: int = 0, sort_by: str = 'score', sort_dir: str = 'desc') -> List[Dict[str, Any]]:
    """Get leaderboard with user stats, badges, favorite language, and support for sorting/pagination"""
    subquery = db.query(
        UserScore.user_id,
        func.sum(UserScore.score).label('total_score'),
        func.max(UserScore.score).label('highest_score'),
        func.count(UserScore.id).label('games_played')
    ).group_by(UserScore.user_id).subquery()

    # Join user, streak, and aggregate score
    query = db.query(
        User.id,
        User.nickname,
        User.avatar,
        subquery.c.total_score,
        subquery.c.highest_score,
        subquery.c.games_played,
        UserStreak.current_streak,
        UserStreak.longest_streak,
        User.last_login.label('last_activity')
    ).join(subquery, User.id == subquery.c.user_id).join(
        UserStreak, User.id == UserStreak.user_id
    )

    # Sorting
    if sort_by == 'score':
        order = subquery.c.total_score
    elif sort_by == 'streak':
        order = UserStreak.current_streak
    elif sort_by == 'level':
        # Level is derived from streak
        order = func.min(10, func.max(1, (UserStreak.current_streak // 3) + 1))
    else:
        order = subquery.c.total_score
    if sort_dir == 'asc':
        query = query.order_by(order.asc())
    else:
        query = query.order_by(order.desc())

    # Pagination
    query = query.offset(offset).limit(limit)
    result = query.all()

    leaderboard = []
    for idx, row in enumerate(result):
        # Get badges_count and favorite_language
        badges_count = len(get_user_badges(db, row.id))
        # Favorite language: get all scores for user
        scores = get_user_scores(db, row.id, limit=1000)
        language_counts = {}
        for score in scores:
            language_counts[score.language] = language_counts.get(score.language, 0) + 1
        favorite_language = max(language_counts.items(), key=lambda x: x[1])[0] if language_counts else "twi"
        # Level from streak
        level = min(10, max(1, (row.current_streak // 3) + 1))
        leaderboard.append({
            "rank": offset + idx + 1,
            "nickname": row.nickname,
            "avatar": row.avatar,
            "total_score": row.total_score,
            "highest_score": row.highest_score,
            "games_played": row.games_played,
            "current_streak": row.current_streak,
            "longest_streak": row.longest_streak,
            "last_activity": row.last_activity,
            "badges_count": badges_count,
            "favorite_language": favorite_language,
            "level": level
        })
    return leaderboard

# Streak CRUD operations
def get_user_streak(db: Session, user_id: int) -> Optional[UserStreak]:
    return db.query(UserStreak).filter(UserStreak.user_id == user_id).first()

def update_user_streak(db: Session, user_id: int, streak_update: StreakUpdate) -> Optional[UserStreak]:
    db_streak = get_user_streak(db, user_id)
    if not db_streak:
        return None
    
    db_streak.current_streak = streak_update.current_streak
    if streak_update.longest_streak:
        db_streak.longest_streak = max(db_streak.longest_streak, streak_update.longest_streak)
    db_streak.last_activity_date = datetime.utcnow()
    db_streak.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_streak)
    return db_streak

def increment_streak(db: Session, user_id: int) -> Optional[UserStreak]:
    db_streak = get_user_streak(db, user_id)
    if not db_streak:
        return None
    
    # Check if user has been active today
    today = datetime.utcnow().date()
    last_activity_date = db_streak.last_activity_date.date()
    
    if last_activity_date < today:
        # New day, increment streak
        db_streak.current_streak += 1
        db_streak.longest_streak = max(db_streak.longest_streak, db_streak.current_streak)
        db_streak.last_activity_date = datetime.utcnow()
        db_streak.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_streak)
    
    return db_streak

def reset_streak(db: Session, user_id: int) -> Optional[UserStreak]:
    db_streak = get_user_streak(db, user_id)
    if not db_streak:
        return None
    
    db_streak.current_streak = 1
    db_streak.last_activity_date = datetime.utcnow()
    db_streak.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_streak)
    return db_streak

# Badge CRUD operations
def create_badge(db: Session, user_id: int, badge: BadgeCreate) -> UserBadge:
    db_badge = UserBadge(
        user_id=user_id,
        badge_type=badge.badge_type,
        badge_name=badge.badge_name,
        badge_description=badge.badge_description
    )
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

def get_user_badges(db: Session, user_id: int) -> List[UserBadge]:
    return db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.is_active == True
    ).order_by(UserBadge.earned_at.desc()).all()

def check_badge_exists(db: Session, user_id: int, badge_type: str) -> bool:
    return db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_type == badge_type,
        UserBadge.is_active == True
    ).first() is not None

# Game Session CRUD operations
def create_game_session(db: Session, user_id: int, session: GameSessionCreate) -> GameSession:
    db_session = GameSession(
        session_id=session.session_id,
        user_id=user_id,
        language=session.language,
        category=session.category,
        difficulty=session.difficulty,
        session_data=session.session_data or {}
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def update_game_session(db: Session, session_id: str, session_update: GameSessionUpdate) -> Optional[GameSession]:
    db_session = db.query(GameSession).filter(GameSession.session_id == session_id).first()
    if not db_session:
        return None
    
    update_data = session_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_session, field, value)
    
    db.commit()
    db.refresh(db_session)
    return db_session

def get_game_session(db: Session, session_id: str) -> Optional[GameSession]:
    return db.query(GameSession).filter(GameSession.session_id == session_id).first()

# User Stats operations
def get_user_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """Get comprehensive user statistics"""
    user = get_user_by_id(db, user_id)
    if not user:
        return {}
    
    # Get scores
    scores = get_user_scores(db, user_id)
    total_score = sum(score.score for score in scores)
    highest_score = max((score.score for score in scores), default=0)
    
    # Get streak
    streak = get_user_streak(db, user_id)
    current_streak = streak.current_streak if streak else 0
    longest_streak = streak.longest_streak if streak else 0
    
    # Get badges
    badges = get_user_badges(db, user_id)
    badges_count = len(badges)
    
    # Get favorite language
    language_counts = {}
    for score in scores:
        language_counts[score.language] = language_counts.get(score.language, 0) + 1
    
    favorite_language = max(language_counts.items(), key=lambda x: x[1])[0] if language_counts else "twi"
    
    # Get game sessions
    sessions = db.query(GameSession).filter(GameSession.user_id == user_id).all()
    games_played = len(sessions)
    total_rounds_won = sum(session.rounds_won for session in sessions)
    total_rounds_played = sum(session.rounds_played for session in sessions)
    win_rate = (total_rounds_won / total_rounds_played * 100) if total_rounds_played > 0 else 0
    
    return {
        "total_score": total_score,
        "highest_score": highest_score,
        "games_played": games_played,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "badges_count": badges_count,
        "favorite_language": favorite_language,
        "total_rounds_won": total_rounds_won,
        "total_rounds_played": total_rounds_played,
        "win_rate": round(win_rate, 2)
    } 