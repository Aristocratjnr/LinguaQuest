from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import time
def get_huggingface_conversational_model():
    """Lazy load a HuggingFace conversational model (e.g., DialoGPT)"""
    global _conversational_ai
    return _conversational_ai

def stream_huggingface_response(prompt: str):
    """Generator for streaming HuggingFace model output token by token"""
    ai = get_huggingface_conversational_model()
    response = tokenizer.decode(output_ids[:, input_ids.shape[-1]:][0], skip_special_tokens=True)
    # Stream word by word for demo (can stream by token for more granularity)
    for word in response.split():
        yield word + " "
        time.sleep(0.08)  # Simulate real-time streaming
@app.post("/api/v1/dialogue/stream")
def dialogue_stream_endpoint(req: DialogueRequest):
    """Streaming dialogue endpoint using HuggingFace conversational model"""
# -*- coding: utf-8 -*-
"""
Memory-optimized version of LinguaQuest API for Render deployment
This version lazy-loads heavy models only when needed
"""
import sys
import io
import os
from datetime import datetime
import random
import json
import threading
import tempfile
import re
from typing import Dict, Optional

# Set default encoding to UTF-8 for Windows compatibility
if sys.platform.startswith('win'):
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    except Exception:
        # If stdout is already detached or there's an issue, skip encoding setup
        pass

from fastapi import FastAPI, Body, UploadFile, File, Query, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import requests
from urllib.parse import quote

# Database imports
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from crud import get_user_by_nickname, create_user, update_user_last_login
from models import UserCreate, UserResponse

# Global variables for lazy-loaded models
_nllb_model = None
_nllb_tokenizer = None
_sentiment_analyzer = None
_argument_evaluator = None
_conversational_ai = None
_speech_to_text = None

def safe_print(message: str):
    """Safely print messages with UTF-8 encoding"""
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode('utf-8', errors='replace').decode('utf-8'))

app = FastAPI(title="LinguaQuest API", version="1.0.0-optimized")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic scenarios
SCENARIOS_EN = [
    "I think eating fast food is enjoyable.",
    "I prefer to work early in the morning.",
    "I believe it is important to work hard in school.",
    "Technology makes our lives easier.",
    "Social media brings people together.",
    "Learning multiple languages is essential.",
    "Traditional values are more important than modern ideas.",
    "Climate change is the most pressing issue of our time."
]

SCENARIOS_TWI = [
    "Mekae sɛ didi ntutummu yɛ fɛ.",
    "Mepɛ sɛ meyɛ adwuma anɔpa biara.",
    "Mekae sɛ ɛho hia sɛ yɛbɔ mmɔden wɔ sukuu."
]

@app.get("/")
def read_root():
    """Root endpoint - API status"""
    return {
        "message": "LinguaQuest backend API is running",
        "version": "1.0.0-optimized",
        "status": "active",
        "batmanAristocrat": "trying to save the world",
        "endpoints": {
            "docs": "/docs",
            "api": "/api/v1",
            "health": "/health",
            "keepalive": "/keepalive"
        }
    }

@app.get("/keepalive")
def keepalive():
    """Keepalive endpoint to prevent service from sleeping"""
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat(),
        "message": "Service is awake and responsive"
    }

@app.get("/health")
def health_check():
    """Health check endpoint with detailed status"""
    try:
        # Check database connection
        db_status = "unknown"
        try:
            print(f"❌ NLLB model loading failed: {e}")
            return None, None
    return _nllb_model, _nllb_tokenizer

def get_sentiment_analyzer():
    """Lazy load sentiment analyzer only when needed"""
    global _sentiment_analyzer
    if _sentiment_analyzer is None:
        try:
            # Use simple VADER instead of heavy transformers
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            _sentiment_analyzer = SentimentIntensityAnalyzer()
            print("✅ Sentiment analyzer loaded")
        except Exception as e:
            print(f"❌ Sentiment analyzer loading failed: {e}")
            return None
    return _sentiment_analyzer

# Models and responses
class UserValidationResponse(BaseModel):
    valid: bool
    reason: str

class ScenarioRequest(BaseModel):
    category: str = "general"
    difficulty: str = "medium"
    language: str = "twi"

class ScenarioResponse(BaseModel):
    scenario: str
    language: str

class TranslationRequest(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

class TranslationResponse(BaseModel):
    translated_text: str

class EvaluateRequest(BaseModel):
    argument: str
    tone: str = "neutral"

class EvaluateResponse(BaseModel):
    persuaded: bool
    feedback: str
    score: int

class DialogueRequest(BaseModel):
    scenario: str
    user_argument: str
    ai_stance: str = "disagree"

class DialogueResponse(BaseModel):
    ai_response: str
    new_stance: str
    reasoning: str

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    details: dict

class ClubResponse(BaseModel):
    id: str
    name: str
    description: str
    language: str
    member_count: int
    level_requirement: int
    created_at: str

# Language mappings (simplified)
EXTERNAL_LANG_MAP = {
    'en': 'en', 'fr': 'fr', 'es': 'es', 'de': 'de', 'pt': 'pt',
    'twi': 'ak', 'ak': 'ak', 'ewe': 'ee', 'gaa': 'gaa'
}

def libre_translate(text, source, target):
    """Lightweight translation using external APIs"""
    external_source = EXTERNAL_LANG_MAP.get(source, source)
    external_target = EXTERNAL_LANG_MAP.get(target, target)
    
    # Try MyMemory first (lighter than LibreTranslate)
    try:
        url = f"https://api.mymemory.translated.net/get?q={quote(text)}&langpair={external_source}|{external_target}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            translated_text = data.get("responseData", {}).get("translatedText", "[Translation error]")
            if "INVALID" not in translated_text.upper():
                return translated_text
    except Exception as e:
        print(f"MyMemory translation error: {e}")
    
    return f"[Translation to {target} not available]"

# User validation (simplified version without database)
PROFANITY_LIST = {"badword", "admin", "root", "test", "guest", "anonymous"}

@app.get("/api/v1/users/validate", response_model=UserValidationResponse)
def validate_username(nickname: str = Query(...), db: Session = Depends(get_db)):
    """Validate username with database check"""
    name = nickname.strip()
    
    # Length validation
    if not (3 <= len(name) <= 16):
        return UserValidationResponse(valid=False, reason="Nickname must be 3-16 characters.")
    
    # Character validation (only alphanumeric and underscores)
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        return UserValidationResponse(valid=False, reason="Only letters, numbers, and underscores allowed.")
    
    # Profanity filter
    if name.lower() in PROFANITY_LIST:
        return UserValidationResponse(valid=False, reason="Nickname not allowed.")
    
    # Check if user already exists in database
    try:
        existing_user = get_user_by_nickname(db, name)
        if existing_user:
            return UserValidationResponse(valid=False, reason="Nickname already taken.")
    except Exception as e:
        print(f"Database error during validation: {e}")
        # If database is unavailable, we'll still allow validation without uniqueness check
        # This ensures the frontend doesn't break if there are database issues
        print("⚠️ Continuing validation without database check")
        return UserValidationResponse(valid=True, reason="Validation completed (database unavailable)")
    
    return UserValidationResponse(valid=True, reason="Looks good!")

@app.post("/api/v1/users", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Validate nickname first
    name = user.nickname.strip()
    if not (3 <= len(name) <= 16):
        raise HTTPException(status_code=400, detail="Nickname must be 3-16 characters.")
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        raise HTTPException(status_code=400, detail="Only letters, numbers, and underscores allowed.")
    if name.lower() in PROFANITY_LIST:
        raise HTTPException(status_code=400, detail="Nickname not allowed.")
    
    # Check if user already exists
    existing_user = get_user_by_nickname(db, name)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")
    
    # Create user
    try:
        db_user = create_user(db, user)
        return db_user
    except Exception as e:
        print(f"User creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user.")

@app.get("/api/v1/users/{nickname}", response_model=UserResponse)
def get_user(nickname: str, db: Session = Depends(get_db)):
    """Get user by nickname"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

@app.put("/api/v1/users/{nickname}", response_model=UserResponse)
def update_user(nickname: str, user_data: dict = Body(...), db: Session = Depends(get_db)):
    """Update user by nickname"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    try:
        # Update user fields if provided
        if 'email' in user_data:
            user.email = user_data['email']
        if 'favorite_language' in user_data:
            user.favorite_language = user_data['favorite_language']
        if 'avatar_url' in user_data:
            user.avatar_url = user_data['avatar_url']
        
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        print(f"User update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user.")

@app.post("/api/v1/users/{nickname}/login")
def user_login(nickname: str, db: Session = Depends(get_db)):
    """Update user's last login time"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    try:
        update_user_last_login(db, user.id)
        return {"status": "success", "message": "Login recorded"}
    except Exception as e:
        print(f"Login update error: {e}")
        return {"status": "error", "message": "Failed to record login"}

# Add /scenario endpoint (without /api/v1 prefix) for backward compatibility
@app.post("/scenario", response_model=ScenarioResponse)
def get_scenario_legacy(req: ScenarioRequest):
    """Legacy scenario endpoint for backward compatibility"""
    return get_scenario_v1(req)

@app.post("/api/v1/scenario", response_model=ScenarioResponse)
def get_scenario_v1(req: ScenarioRequest):
    """Get a debate scenario with optimized translation"""
    try:
        print(f"Scenario request: {req.category}, {req.difficulty}, {req.language}")
        
        if req.language == "en":
            scenario = random.choice(SCENARIOS_EN)
            return ScenarioResponse(scenario=scenario, language="en")
        
        # Check for pre-translated scenarios first
        if req.language == "twi" and SCENARIOS_TWI:
            scenario = random.choice(SCENARIOS_TWI)
            return ScenarioResponse(scenario=scenario, language=req.language)
        
        # For other languages, use lightweight translation
        scenario_en = random.choice(SCENARIOS_EN)
        try:
            translated = libre_translate(scenario_en, "en", req.language)
            if not translated.startswith("["):
                return ScenarioResponse(scenario=translated, language=req.language)
        except Exception as e:
            print(f"Translation error: {e}")
        
        # Fallback to English with message
        return ScenarioResponse(
            scenario=f"{scenario_en} [Translation to {req.language.upper()} not available]",
            language="en"
        )
        
    except Exception as e:
        print(f"Scenario error: {e}")
        return ScenarioResponse(scenario="Error generating scenario.", language="en")

# Clubs endpoint - commented out to avoid conflicts with the correct endpoint below
# @app.get("/api/v1/clubs/{language}", response_model=ClubResponse)
# def get_club(language: str):
#     """Get language club information"""
#     try:
#         # Mock club data based on language
#         clubs_data = {
#             "twi": {
#                 "id": "twi_club",
#                 "name": "Twi Learning Club",
#                 "description": "Learn Twi with fellow language enthusiasts",
#                 "language": "twi",
#                 "member_count": 142,
#                 "level_requirement": 1,
#                 "created_at": "2024-01-15T00:00:00Z"
#             },
#             "gaa": {
#                 "id": "gaa_club", 
#                 "name": "Gaa Language Club",
#                 "description": "Master Gaa language with native speakers",
#                 "language": "gaa",
#                 "member_count": 87,
#                 "level_requirement": 1,
#                 "created_at": "2024-02-01T00:00:00Z"
#             },
#             "ewe": {
#                 "id": "ewe_club",
#                 "name": "Ewe Learning Circle", 
#                 "description": "Connect with Ewe language learners",
#                 "language": "ewe",
#                 "member_count": 96,
#                 "level_requirement": 1,
#                 "created_at": "2024-01-20T00:00:00Z"
#             }
#         }
#         
#         if language in clubs_data:
#             return ClubResponse(**clubs_data[language])
#         else:
#             raise HTTPException(status_code=404, detail=f"Club for language '{language}' not found")
#             
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Club fetch error: {e}")
#         raise HTTPException(status_code=500, detail="Failed to fetch club information")

@app.post("/api/v1/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    """Translate text using lightweight methods"""
    try:
        translated = libre_translate(req.text, req.src_lang, req.tgt_lang)
        return TranslationResponse(translated_text=translated)
    except Exception as e:
        error_msg = f"Translation error: {str(e)}"
        print(error_msg)
        return TranslationResponse(translated_text=error_msg)

@app.post("/api/v1/evaluate", response_model=EvaluateResponse)
def evaluate_argument(req: EvaluateRequest):
    """Evaluate argument using lightweight methods"""
    try:
        # Simple evaluation without heavy ML models
        argument_length = len(req.argument.split())
        
        # Basic scoring
        score = min(10, argument_length // 3)
        
        # Simple persuasion indicators
        persuasive_words = ["because", "therefore", "however", "moreover", "furthermore", "since", "thus"]
        persuasion_count = sum(1 for word in persuasive_words if word in req.argument.lower())
        
        if persuasion_count > 0:
            score += 2
            persuaded = persuasion_count >= 2
        else:
            persuaded = False
        
        # Simple sentiment check using VADER (lightweight)
        sentiment_analyzer = get_sentiment_analyzer()
        if sentiment_analyzer:
            sentiment_scores = sentiment_analyzer.polarity_scores(req.argument)
            if sentiment_scores['compound'] > 0.1:
                score += 1
                feedback_sentiment = "Your argument has a positive tone."
            elif sentiment_scores['compound'] < -0.1:
                score -= 1
                feedback_sentiment = "Consider using more positive language."
            else:
                feedback_sentiment = "Your argument is neutral in tone."
        else:
            feedback_sentiment = "Tone analysis unavailable."
        
        feedback = f"Your {argument_length}-word argument "
        if persuaded:
            feedback += "is well-structured with good connecting words. "
        else:
            feedback += "could benefit from more persuasive language. "
        feedback += feedback_sentiment
        
        score = max(0, min(10, score))
        
        return EvaluateResponse(
            persuaded=persuaded,
            feedback=feedback,
            score=score
        )
    except Exception as e:
        print(f"Evaluation error: {e}")
        return EvaluateResponse(persuaded=False, feedback="Evaluation error.", score=0)

@app.post("/api/v1/dialogue", response_model=DialogueResponse)
def dialogue_endpoint(req: DialogueRequest):
    """Simple dialogue endpoint for AI conversation"""
    try:
        # Simple response based on stance
        responses = {
            "disagree": "I understand your point, but I have some concerns about this approach.",
            "neutral": "That's an interesting perspective. Let me consider this further.",
            "agree": "You make a compelling argument. I'm starting to see your point."
        }
        
        # Simple stance progression
        new_stance = req.ai_stance
        if len(req.user_argument) > 50:  # If argument is substantial
            if req.ai_stance == "disagree":
                new_stance = "neutral"
            elif req.ai_stance == "neutral":
                new_stance = "agree"
        
        return DialogueResponse(
            ai_response=responses.get(req.ai_stance, "I understand your perspective."),
            new_stance=new_stance,
            reasoning="Simple rule-based response"
        )
    except Exception as e:
        print(f"Dialogue error: {e}")
        return DialogueResponse(
            ai_response="I'm having trouble responding right now.",
            new_stance=req.ai_stance,
            reasoning="Error in dialogue processing"
        )

@app.post("/api/v1/sentiment", response_model=SentimentResponse)
def analyze_sentiment(req: SentimentRequest):
    """Analyze sentiment of text using lightweight VADER"""
    try:
        sentiment_analyzer = get_sentiment_analyzer()
        if sentiment_analyzer:
            scores = sentiment_analyzer.polarity_scores(req.text)
            
            # Determine overall sentiment
            compound = scores['compound']
            if compound >= 0.05:
                sentiment = "positive"
            elif compound <= -0.05:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            confidence = abs(compound)
            
            return SentimentResponse(
                sentiment=sentiment,
                confidence=confidence,
                details=scores
            )
        else:
            return SentimentResponse(
                sentiment="neutral",
                confidence=0.0,
                details={"error": "Sentiment analyzer not available"}
            )
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return SentimentResponse(
            sentiment="neutral",
            confidence=0.0,
            details={"error": str(e)}
        )

# API v1 endpoints for frontend compatibility
@app.get("/api/v1/streak")
def get_streak(nickname: str):
    """Get user's current streak from user stats"""
    try:
        # Get user stats which include current_streak
        user_stats = get_user_stats(nickname)
        return {"streak": user_stats["current_streak"]}
    except Exception as e:
        print(f"Error getting streak for {nickname}: {e}")
        return {"streak": 1}  # Fallback

@app.get("/api/v1/level")
def get_level(nickname: str):
    """Get user's current level from user stats"""
    try:
        # Get user stats which include level calculation
        user_stats = get_user_stats(nickname)
        # Calculate level based on total score (every 100 points = 1 level)
        level = max(1, user_stats["total_score"] // 100)
        return {"level": level}
    except Exception as e:
        print(f"Error getting level for {nickname}: {e}")
        return {"level": 1}  # Fallback

@app.patch("/api/v1/streak")
def reset_streak(nickname: str, streak: int):
    """Reset user's streak (simplified)"""
    # In a real implementation, this would update the database
    # For now, return the requested streak value
    return {"streak": max(1, streak)}

@app.patch("/api/v1/level")
def reset_level(nickname: str, level: int):
    """Reset user's level (simplified)"""
    # In a real implementation, this would update the database
    # For now, return the requested level value
    return {"level": max(1, level)}

@app.post("/api/v1/streak/increment")
def increment_streak(nickname: str):
    """Increment user's streak"""
    try:
        # Get current streak
        current_stats = get_user_stats(nickname)
        current_streak = current_stats["current_streak"]
        new_streak = current_streak + 1
        
        # In a real implementation, this would update the database
        # For now, return incremented value
        return {"streak": new_streak}
    except Exception as e:
        print(f"Error incrementing streak for {nickname}: {e}")
        return {"streak": 2}  # Fallback

@app.post("/api/v1/streak/reset")
def reset_streak_post(nickname: str):
    """Reset user's streak to 1"""
    # In a real implementation, this would update the database
    return {"streak": 1}

# Commented out old leaderboard endpoint to avoid conflicts
# @app.get("/api/v1/leaderboard")
# def get_leaderboard_v1():
#     """Get leaderboard data (API v1 compatible)"""
#     leaderboard_data = get_leaderboard()
#     return {"leaderboard": leaderboard_data.leaderboard}

@app.post("/api/v1/leaderboard")
def submit_leaderboard_v1(entry: dict):
    """Submit to leaderboard (API v1 compatible)"""
    score_entry = ScoreEntry(
        name=entry.get("name", "Anonymous"),
        score=entry.get("score", 0),
        date=entry.get("date", datetime.now().isoformat())
    )
    return submit_score(score_entry)

# Engagement API endpoints
@app.get("/api/engagement/categories")
def get_engagement_categories():
    """Get available categories for scenarios"""
    return [
        {"key": "general", "label": "General Discussion"},
        {"key": "technology", "label": "Technology"},
        {"key": "education", "label": "Education"},
        {"key": "environment", "label": "Environment"},
        {"key": "social", "label": "Social Issues"},
        {"key": "business", "label": "Business"}
    ]

@app.get("/api/engagement/difficulties")
def get_engagement_difficulties():
    """Get available difficulty levels"""
    return [
        {"key": "easy", "label": "Easy"},
        {"key": "medium", "label": "Medium"},
        {"key": "hard", "label": "Hard"}
    ]

@app.get("/api/v1/tts")
def tts(text: str = Query(...), lang: str = Query("en")):
    """Text-to-speech endpoint"""
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang=lang)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as fp:
            tts.save(fp.name)
            return FileResponse(fp.name, media_type='audio/mpeg', filename='tts.mp3')
    except Exception as e:
        return {"error": str(e)}

# Leaderboard functionality (lightweight)
LEADERBOARD_FILE = 'leaderboard.json'
LEADERBOARD_LOCK = threading.Lock()

class LeaderboardResponse(BaseModel):
    leaderboard: list

class ScoreEntry(BaseModel):
    name: str
    score: int
    date: str

# Progression Map data structures
class ProgressionStage(BaseModel):
    id: str
    label: str
    unlocked: bool
    children: Optional[list] = None

# Static progression data for production
PROGRESSION_DATA = [
    {
        "id": "basics",
        "label": "Language Basics",
        "unlocked": True,
        "children": [
            {"id": "basics_1", "label": "Introduction", "unlocked": True},
            {"id": "basics_2", "label": "Simple Phrases", "unlocked": False},
            {"id": "basics_3", "label": "Basic Grammar", "unlocked": False}
        ]
    },
    {
        "id": "food",
        "label": "Food & Dining",
        "unlocked": False,
        "children": [
            {"id": "food_1", "label": "Basic Food Terms", "unlocked": False},
            {"id": "food_2", "label": "Restaurant Conversations", "unlocked": False},
            {"id": "food_3", "label": "Cooking & Recipes", "unlocked": False}
        ]
    },
    {
        "id": "travel",
        "label": "Travel & Transportation",
        "unlocked": False,
        "children": [
            {"id": "travel_1", "label": "Directions", "unlocked": False},
            {"id": "travel_2", "label": "Transportation", "unlocked": False},
            {"id": "travel_3", "label": "Hotels & Accommodation", "unlocked": False}
        ]
    }
]

@app.post('/api/v1/score')
def submit_score(entry: ScoreEntry):
    """Submit score to leaderboard"""
    with LEADERBOARD_LOCK:
        if os.path.exists(LEADERBOARD_FILE):
            with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = []
        data.append(entry.dict())
        with open(LEADERBOARD_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    return {'status': 'ok'}

# Basic leaderboard endpoint - commented out to avoid conflicts with enhanced version
# @app.get('/api/v1/leaderboard', response_model=LeaderboardResponse)
# def get_leaderboard():
#     """Get leaderboard data"""
#     with LEADERBOARD_LOCK:
#         if os.path.exists(LEADERBOARD_FILE):
#             with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
#                 data = json.load(f)
#         else:
#             data = []
#     data = sorted(data, key=lambda x: (-x['score'], x['date']))[:10]
#     return LeaderboardResponse(leaderboard=data)

# Enhanced leaderboard endpoint that returns proper user data
@app.get("/api/v1/leaderboard")
def get_leaderboard_enhanced(limit: int = 10, offset: int = 0, sort_by: str = 'total_score', sort_dir: str = 'desc'):
    """Get enhanced leaderboard data with user stats"""
    # Mock leaderboard data for production
    mock_leaderboard = []
    
    # Try to load existing leaderboard data
    with LEADERBOARD_LOCK:
        if os.path.exists(LEADERBOARD_FILE):
            try:
                with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    # Convert old format to new format
                    for i, entry in enumerate(existing_data[:limit]):
                        mock_leaderboard.append({
                            "rank": i + 1,
                            "nickname": entry.get("name", f"Player{i+1}"),
                            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={entry.get('name', f'player{i+1}')}",
                            "total_score": entry.get("score", 0),
                            "highest_score": entry.get("score", 0),
                            "games_played": max(1, entry.get("score", 0) // 100),
                            "current_streak": max(1, entry.get("score", 0) // 50),
                            "longest_streak": max(1, entry.get("score", 0) // 30),
                            "badges_count": min(5, entry.get("score", 0) // 200),
                            "last_activity": entry.get("date", datetime.now().isoformat()),
                            "favorite_language": "twi",
                            "level": max(1, entry.get("score", 0) // 100)
                        })
            except Exception as e:
                print(f"Error reading leaderboard: {e}")
    
    # If no data exists, create some sample data
    if not mock_leaderboard:
        sample_users = [
            {"name": "Alice", "score": 1250},
            {"name": "Bob", "score": 1100},
            {"name": "Charlie", "score": 950},
            {"name": "Diana", "score": 800},
            {"name": "Eve", "score": 650}
        ]
        
        for i, user in enumerate(sample_users):
            mock_leaderboard.append({
                "rank": i + 1,
                "nickname": user["name"],
                "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user['name'].lower()}",
                "total_score": user["score"],
                "highest_score": user["score"],
                "games_played": max(1, user["score"] // 100),
                "current_streak": max(1, user["score"] // 50),
                "longest_streak": max(1, user["score"] // 30),
                "badges_count": min(5, user["score"] // 200),
                "last_activity": datetime.now().isoformat(),
                "favorite_language": "twi",
                "level": max(1, user["score"] // 100)
            })
    
    # Apply sorting
    if sort_by == 'total_score':
        mock_leaderboard.sort(key=lambda x: x['total_score'], reverse=(sort_dir == 'desc'))
    elif sort_by == 'current_streak':
        mock_leaderboard.sort(key=lambda x: x['current_streak'], reverse=(sort_dir == 'desc'))
    elif sort_by == 'level':
        mock_leaderboard.sort(key=lambda x: x['level'], reverse=(sort_dir == 'desc'))
    
    # Apply pagination
    paginated_data = mock_leaderboard[offset:offset + limit]
    
    # Update ranks after sorting and pagination
    for i, entry in enumerate(paginated_data):
        entry['rank'] = offset + i + 1
    
    return paginated_data

# Progression Map endpoints
@app.get("/api/v1/progression/{nickname}")
def get_user_progression(nickname: str):
    """Get user's progression stages"""
    # For production, return static progression data
    # In a real implementation, this would fetch user-specific progress from database
    
    # Mock user progress - unlock stages based on nickname hash for consistency
    import hashlib
    user_hash = int(hashlib.md5(nickname.encode()).hexdigest()[:8], 16)
    progress_level = (user_hash % 5) + 1  # 1-5 progress level
    
    progression = []
    for stage in PROGRESSION_DATA:
        stage_copy = stage.copy()
        
        # Unlock stages based on progress level
        if stage['id'] == 'basics':
            stage_copy['unlocked'] = True
            # Unlock children based on progress
            if 'children' in stage_copy:
                children = []
                for i, child in enumerate(stage['children']):
                    child_copy = child.copy()
                    child_copy['unlocked'] = i < progress_level
                    children.append(child_copy)
                stage_copy['children'] = children
        elif stage['id'] == 'food':
            stage_copy['unlocked'] = progress_level >= 2
            if 'children' in stage_copy:
                children = []
                for i, child in enumerate(stage['children']):
                    child_copy = child.copy()
                    child_copy['unlocked'] = progress_level >= 3 and i < (progress_level - 2)
                    children.append(child_copy)
                stage_copy['children'] = children
        elif stage['id'] == 'travel':
            stage_copy['unlocked'] = progress_level >= 4
            if 'children' in stage_copy:
                children = []
                for i, child in enumerate(stage['children']):
                    child_copy = child.copy()
                    child_copy['unlocked'] = progress_level >= 5 and i < (progress_level - 4)
                    children.append(child_copy)
                stage_copy['children'] = children
        
        progression.append(stage_copy)
    
    return progression

@app.post("/api/v1/progression/{nickname}/unlock/{stage_id}")
def unlock_stage(nickname: str, stage_id: str):
    """Unlock a progression stage for a user"""
    # For production, this would update the database
    # For now, return success message
    return {"message": f"Stage {stage_id} unlocked for {nickname}", "success": True}

@app.post("/api/v1/progression/{nickname}/reset")
def reset_progression(nickname: str):
    """Reset user's progression stages to initial state"""
    # For production, this would reset the database
    # For now, return the initial progression state
    return PROGRESSION_DATA

# User stats endpoint
@app.get("/api/v1/stats/{nickname}")
def get_user_stats(nickname: str):
    """Get user statistics"""
    # Mock user stats based on nickname for consistency
    import hashlib
    user_hash = int(hashlib.md5(nickname.encode()).hexdigest()[:8], 16)
    
    base_score = (user_hash % 1000) + 100
    return {
        "total_score": base_score,
        "games_played": max(1, base_score // 100),
        "highest_score": min(10, max(5, base_score // 50)),
        "current_streak": max(1, base_score // 200),
        "longest_streak": max(1, base_score // 150),
        "total_rounds_played": max(5, base_score // 20),
        "total_rounds_won": max(3, base_score // 30),
        "badges_count": min(10, base_score // 100),
        "favorite_language": "twi",
        "win_rate": min(1.0, max(0.3, (base_score % 100) / 100))
    }

# Badges endpoint
@app.get("/api/v1/badges/{nickname}")
def get_user_badges(nickname: str):
    """Get user badges"""
    # Mock badges based on user hash
    import hashlib
    user_hash = int(hashlib.md5(nickname.encode()).hexdigest()[:8], 16)
    
    all_badges = [
        {"id": "first_win", "name": "First Victory", "description": "Won your first debate", "earned_at": datetime.now().isoformat()},
        {"id": "streak_master", "name": "Streak Master", "description": "Maintained a 5-day streak", "earned_at": datetime.now().isoformat()},
        {"id": "high_scorer", "name": "High Scorer", "description": "Achieved score of 8 or higher", "earned_at": datetime.now().isoformat()},
        {"id": "creative", "name": "Creative Thinker", "description": "Used 20+ unique words in arguments", "earned_at": datetime.now().isoformat()},
        {"id": "perfect", "name": "Perfect Player", "description": "Won all rounds in a game", "earned_at": datetime.now().isoformat()}
    ]
    
    # Return subset based on user hash
    num_badges = (user_hash % 4) + 1
    return {"badges": all_badges[:num_badges]}

@app.post("/api/v1/badges/{nickname}")
def award_badge(nickname: str, badge_type: str, badge_name: str, badge_description: str = ""):
    """Award a badge to user"""
    return {
        "id": badge_type,
        "name": badge_name,
        "description": badge_description,
        "earned_at": datetime.now().isoformat()
    }

# Clubs endpoint  
@app.get("/api/v1/clubs/{language_code}")
def get_club_data(language_code: str):
    """Get language club data with members, progress, and challenges"""
    try:
        # Enhanced club data with more variety
        club_data = {
            "twi": {
                "name": "Twi Language Club",
                "members": [
                    {"nickname": "Akwasi", "xp": 1450, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=akwasi"},
                    {"nickname": "Ama", "xp": 1320, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ama"},
                    {"nickname": "Kwame", "xp": 1180, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=kwame"},
                    {"nickname": "Abena", "xp": 980, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=abena"},
                    {"nickname": "Kofi", "xp": 750, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=kofi"}
                ],
                "groupGoal": 6000,
                "groupProgress": 4230,
                "challenge": "Master Twi greetings and family terms this week!"
            },
            "gaa": {
                "name": "Ga Language Club",
                "members": [
                    {"nickname": "Tetteh", "xp": 1380, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=tetteh"},
                    {"nickname": "Adjoa", "xp": 1250, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=adjoa"},
                    {"nickname": "Nii", "xp": 1100, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=nii"},
                    {"nickname": "Akeley", "xp": 950, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=akeley"}
                ],
                "groupGoal": 5500,
                "groupProgress": 3850,
                "challenge": "Learn Ga counting and market expressions!"
            },
            "ewe": {
                "name": "Ewe Language Circle",
                "members": [
                    {"nickname": "Komi", "xp": 1520, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=komi"},
                    {"nickname": "Esi", "xp": 1340, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=esi"},
                    {"nickname": "Selorm", "xp": 1150, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=selorm"},
                    {"nickname": "Dela", "xp": 890, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=dela"},
                    {"nickname": "Mawuli", "xp": 720, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=mawuli"}
                ],
                "groupGoal": 5800,
                "groupProgress": 4100,
                "challenge": "Practice Ewe storytelling and proverbs!"
            }
        }
        
        # Get club data or use default
        if language_code in club_data:
            return club_data[language_code]
        else:
            # Return default club data for any language
            return {
                "name": f"{language_code.title()} Language Club",
                "members": [
                    {"nickname": "Alice", "xp": 1250, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=alice"},
                    {"nickname": "Bob", "xp": 1100, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=bob"},
                    {"nickname": "Charlie", "xp": 950, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie"},
                    {"nickname": "Diana", "xp": 800, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=diana"}
                ],
                "groupGoal": 5000,
                "groupProgress": 3300,
                "challenge": f"Master {language_code.title()} conversations this week!"
            }
    except Exception as e:
        print(f"Club fetch error for {language_code}: {e}")
        # Return fallback data even on error
        return {
            "name": f"{language_code.title()} Language Club",
            "members": [
                {"nickname": "Player1", "xp": 1000, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=player1"},
                {"nickname": "Player2", "xp": 800, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=player2"},
                {"nickname": "Player3", "xp": 600, "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=player3"}
            ],
            "groupGoal": 4000,
            "groupProgress": 2400,
            "challenge": f"Learn {language_code.title()} together!"
        }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and essential components"""
    try:
        print("🚀 LinguaQuest Optimized API starting up...")
        print("💾 Memory optimization: ON")
        print("🤖 ML models: Lazy loading enabled")
        
        # Initialize database tables
        try:
            print("🗄️ Creating database tables...")
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully")
        except Exception as e:
            print(f"⚠️ Database initialization warning: {e}")
            print("🔄 Continuing without database (will affect user validation)")
    except Exception as e:
        print(f"❌ Startup error: {e}")
        # Don't crash on startup errors
        import traceback
        traceback.print_exc()

# Add exception handler for unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to prevent server crashes"""
    print(f"❌ Unhandled exception: {exc}")
    import traceback
    traceback.print_exc()
    
    return {
        "error": "Internal server error", 
        "message": "The server encountered an unexpected error but is still running",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting LinguaQuest Optimized API on port {port}")
    
    try:
        uvicorn.run(
            "optimized_main:app",
            host="0.0.0.0",
            port=port,
            workers=1,
            log_level="info",
            access_log=True,
            # Production stability settings
            loop="asyncio",
            timeout_keep_alive=30,
            timeout_graceful_shutdown=10
        )
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        # Log the error but don't exit - let Render restart the service
        import traceback
        traceback.print_exc()
