from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import ScoreCreate, ScoreResponse, GameSessionCreate, GameSessionUpdate, GameSessionResponse, LeaderboardEntry
from crud import (
    create_score, get_user_scores, get_user_highest_score, get_leaderboard,
    create_game_session, update_game_session, get_game_session,
    get_user_stats, get_user_by_nickname
)
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/scores", response_model=ScoreResponse)
def submit_score(score: ScoreCreate, nickname: str = Query(...), db: Session = Depends(get_db)):
    """Submit a new score"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    db_score = create_score(db, user.id, score)
    return db_score

@router.get("/scores/{nickname}", response_model=List[ScoreResponse])
def get_user_score_history(nickname: str, limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db)):
    """Get user score history"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    scores = get_user_scores(db, user.id, limit)
    return scores

@router.get("/scores/{nickname}/highest", response_model=ScoreResponse)
def get_user_best_score(nickname: str, db: Session = Depends(get_db)):
    """Get user's highest score"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    score = get_user_highest_score(db, user.id)
    if not score:
        raise HTTPException(status_code=404, detail="No scores found for user.")
    
    return score

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard_data(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    sort_by: str = Query('score', regex='^(score|streak|level)$'),
    sort_dir: str = Query('desc', regex='^(asc|desc)$'),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard data.
    - limit: max number of entries to return
    - offset: number of entries to skip (for pagination)
    - sort_by: field to sort by ('score', 'streak', 'level')
    - sort_dir: sort direction ('asc' or 'desc')
    """
    leaderboard = get_leaderboard(db, limit=limit, offset=offset, sort_by=sort_by, sort_dir=sort_dir)
    return leaderboard

@router.post("/sessions", response_model=GameSessionResponse)
def start_game_session(session: GameSessionCreate, nickname: str = Query(...), db: Session = Depends(get_db)):
    """Start a new game session"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Generate session ID if not provided
    if not session.session_id:
        session.session_id = str(uuid.uuid4())
    
    db_session = create_game_session(db, user.id, session)
    return db_session

@router.put("/sessions/{session_id}", response_model=GameSessionResponse)
def end_game_session(session_id: str, session_update: GameSessionUpdate, db: Session = Depends(get_db)):
    """End a game session"""
    db_session = update_game_session(db, session_id, session_update)
    if not db_session:
        raise HTTPException(status_code=404, detail="Game session not found.")
    
    return db_session

@router.get("/sessions/{session_id}", response_model=GameSessionResponse)
def get_session_details(session_id: str, db: Session = Depends(get_db)):
    """Get game session details"""
    session = get_game_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found.")
    
    return session

@router.get("/stats/{nickname}")
def get_user_statistics(nickname: str, db: Session = Depends(get_db)):
    """Get comprehensive user statistics"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    stats = get_user_stats(db, user.id)
    return stats 