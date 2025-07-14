from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database URL
DATABASE_URL = "sqlite:///./linguaquest.db"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, unique=True, index=True, nullable=False)
    avatar = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    preferences = Column(JSON, default={})  # Store user preferences like theme, language, etc.
    
    # Relationships
    activities = relationship("UserActivity", back_populates="user")
    scores = relationship("UserScore", back_populates="user")
    streaks = relationship("UserStreak", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False)  # 'login', 'game_start', 'game_end', 'argument_submit', etc.
    details = Column(JSON, default={})  # Store activity-specific data
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activities")

class UserScore(Base):
    __tablename__ = "user_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    language = Column(String, nullable=False)
    category = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    game_session_id = Column(String, nullable=True)  # To group scores from same game
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="scores")

class UserStreak(Base):
    __tablename__ = "user_streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_streak = Column(Integer, default=1)
    longest_streak = Column(Integer, default=1)
    last_activity_date = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="streaks")

class UserBadge(Base):
    __tablename__ = "user_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_type = Column(String, nullable=False)  # 'streak', 'highscore', 'creative', 'perfect', etc.
    badge_name = Column(String, nullable=False)
    badge_description = Column(Text, nullable=True)
    earned_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="badges")

class GameSession(Base):
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_score = Column(Integer, default=0)
    rounds_played = Column(Integer, default=0)
    rounds_won = Column(Integer, default=0)
    language = Column(String, nullable=False)
    category = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    session_data = Column(JSON, default={})  # Store session-specific data

# Database utilities
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine) 