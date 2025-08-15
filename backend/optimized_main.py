

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
from typing import Dict, Optional, Any, AsyncGenerator

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

# AI Service
from services.ai_service import AIService

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

# Lazy-load argument evaluator and conversational AI
def get_argument_evaluator():
    global _argument_evaluator
    if _argument_evaluator is None:
        try:
            from simple_nlp_services import SimpleArgumentEvaluator
            _argument_evaluator = SimpleArgumentEvaluator()
            print("✅ Argument evaluator loaded")
        except Exception as e:
            print(f"❌ Argument evaluator loading failed: {e}")
            return None
    return _argument_evaluator

def get_conversational_ai():
    global _conversational_ai
    if _conversational_ai is None:
        try:
            from simple_nlp_services import SimpleConversationalAI
            _conversational_ai = SimpleConversationalAI()
            print("✅ Conversational AI loaded")
        except Exception as e:
            print(f"❌ Conversational AI loading failed: {e}")
            return None
    return _conversational_ai

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
    "I think eating healthy is important.",
    "I like to work in the morning.",
    "It is important to try hard in school.",
    "Technology makes our lives easier.",
    "Social media helps people connect.",
    "Learning many languages is useful.",
    "Tradition is more important than new ideas.",
    "Climate change is the most pressing issue of our time.",
    "I like to play games every day.",
    "Helping each other is important.",
    "I want to have a big job in the future.",
    "Reading books every morning is good.",
    "Having good conversations is important.",
    "I want to be a doctor in the future.",
    "Going to church every day is important.",
    "Learning something new every day is good.",
    "Helping others is important.",
    "I want to be a teacher.",
    "Being honest every day is important.",
    "I want to be a scholar at school.",
    "Trying hard is important.",
    "I want to be a royal at home.",
    "Working hard at work is important.",
    "I want to be an elder who helps people."
]

SCENARIOS_TWI = [
    "Mekae sɛ didi ntutummu yɛ fɛ.",
    "Mepɛ sɛ meyɛ adwuma anɔpa biara.",
    "Mekae sɛ ɛho hia sɛ yɛbɔ mmɔden wɔ sukuu.",
    "Teknoloji boa ma yɛn nkwa yɛ mmerɛw.",
    "Sosɔl midia boa ma nnipa bɔ abom.",
    "Sɛ wokɔ sukuu a, ɛsɛ sɛ wokɔ so sua kasa pii.",
    "Amammerɛ titiriw sen nsusui foforo.",
    "Nsakrae a ɛba asase so yɛ asɛm kɛse a ɛsɛ sɛ yɛhwɛ so.",
    "Mepɛ sɛ mebɔ agorɔ da biara.",
    "Mekae sɛ ɛho hia sɛ yɛboa yɛn ho.",
    "Mepɛ sɛ meyɛ adwuma kɛse daakye.",
    "Mepɛ sɛ mekenkan nwoma anɔpa biara.",
    "Mekae sɛ ɛho hia sɛ yɛbɔ nkɔmmɔ pa.",
    "Mepɛ sɛ meyɛ dɔkita daakye.",
    "Mekae sɛ ɛho hia sɛ yɛkɔ asɔre da biara.",
    "Mepɛ sɛ mesua ade foforo da biara.",
    "Mekae sɛ ɛho hia sɛ yɛboa afoforo.",
    "Mepɛ sɛ meyɛ ɔkyerɛkyerɛni.",
    "Mekae sɛ ɛho hia sɛ yɛdi nokware da biara.",
    "Mepɛ sɛ meyɛ ɔbenfo wɔ sukuu.",
    "Mekae sɛ ɛho hia sɛ yɛkɔ mmɔdenbɔ mu.",
    "Mepɛ sɛ meyɛ ɔdehyeɛ wɔ fie.",
    "Mekae sɛ ɛho hia sɛ yɛkɔ mmɔdenbɔ mu wɔ adwuma.",
    "Mepɛ sɛ meyɛ ɔpanyin a ɔboa nkurɔfo."
]

SCENARIOS_GAA = [
    "Mɛni tsɔɔ shikpon nɔ lɛ mli.",
    "Mɛni yɛ adwuma anɔpa kɛji.",
    "Shikpon yɛ hewalɛ mli.",
    "Technologii yɛ mli hewalɛ.",
    "Sosɔl midia yɛ mli kɛji amɛi bɔ abom.",
    "Kɛ yɛkɛ sukuu, yɛtsɔɔ kasa pii.",
    "Amɛi amammerɛ yɛ hewalɛ kɛji nsusui foforo.",
    "Asaase nsakrae yɛ asɛm kɛse lɛ.",
    "Mɛni bɔ agorɔ da biara.",
    "Mɛni yɛ adwuma kɛse daakye.",
    "Mɛni yɛ hewalɛ kɛji yɛboa yɛn ho.",
    "Mɛni pɛ shikpon kɛji gbɛi.",
    "Kɛ yɛkɛ gbɛi, yɛtsɔɔ nɔ lɛ mli.",
    "Mɛni yɛ gbɛi kɛji yɛkɛ hewalɛ.",
    "Kɛ yɛkɛ asɔre, yɛtsɔɔ gbɛi kɛji shikpon.",
    "Mɛni yɛ hewalɛ kɛji yɛkɛ sukuu.",
    "Kɛ yɛkɛ dɔkita, yɛtsɔɔ hewalɛ mli.",
    "Mɛni yɛ adwuma kɛji yɛboa amɛi.",
    "Kɛ yɛkɛ asafotufiami, yɛtsɔɔ amammerɛ pii.",
    "Mɛni yɛ hewalɛ kɛji yɛkɛ gbɛi daakye.",
    "Mɛni yɛ shikpon kɛji yɛkɛ hewalɛ da biara.",
    "Kɛ yɛkɛ sukuu, yɛtsɔɔ amɛi bɔ abom.",
    "Mɛni yɛ hewalɛ kɛji yɛkɛ asɔre.",
    "Kɛ yɛkɛ asɔre, yɛtsɔɔ shikpon kɛji gbɛi."
]

# Expanded Ga scenarios
SCENARIOS_GAA = [
    "Mɛni tsɔɔ shikpon nɔ lɛ mli.",
    "Mɛni yɛ adwuma anɔpa kɛji.",
    "Shikpon yɛ hewalɛ mli.",
    "Technologii yɛ mli hewalɛ.",
    "Sosɔl midia yɛ mli kɛji amɛi bɔ abom.",
    "Kɛ yɛkɛ sukuu, yɛtsɔɔ kasa pii.",
    "Amɛi amammerɛ yɛ hewalɛ kɛji nsusui foforo.",
    "Asaase nsakrae yɛ asɛm kɛse lɛ.",
    "Mɛni bɔ agorɔ da biara.",
    "Mɛni yɛ adwuma kɛse daakye.",
    "Mɛni yɛ hewalɛ kɛji yɛboa yɛn ho.",
    "Mɛni pɛ shikpon kɛji gbɛi.",
    "Kɛ yɛkɛ gbɛi, yɛtsɔɔ nɔ lɛ mli.",
    "Mɛni yɛ gbɛi kɛji yɛkɛ hewalɛ.",
    "Kɛ yɛkɛ asɔre, yɛtsɔɔ gbɛi kɛji shikpon.",
    "Mɛni yɛ hewalɛ kɛji yɛkɛ sukuu.",
    "Kɛ yɛkɛ dɔkita, yɛtsɔɔ hewalɛ mli.",
    "Mɛni yɛ adwuma kɛji yɛboa amɛi.",
    "Kɛ yɛkɛ asafotufiami, yɛtsɔɔ amammerɛ pii.",
    "Mɛni yɛ hewalɛ kɛji yɛkɛ gbɛi daakye.",
    "Mɛni yɛ shikpon kɛji yɛkɛ hewalɛ da biara.",
    "Kɛ yɛkɛ sukuu, yɛtsɔɔ amɛi bɔ abom.",
    "Mɛni yɛ hewalɛ kɛji yɛkɛ asɔre.",
    "Kɛ yɛkɛ asɔre, yɛtsɔɔ shikpon kɛji gbɛi."
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
    # Check database connection
    db_status = "unknown"
    # (Add actual DB check logic if needed)
    return {"status": "ok"}

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
    details: Optional[Dict[str, Any]] = None

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
        # If the server is offline or unreachable, return a user-friendly message with the original input
        return f"Sorry, translation is temporarily unavailable. Showing your original text: {text}"

    # If translation is not available, return a user-friendly message with the original input
    return f"Sorry, translation to '{target}' is unavailable. Showing your original text: {text}"

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
        

        import datetime
        today = datetime.datetime.utcnow().date()

        if req.language == "en":
            idx = today.toordinal() % len(SCENARIOS_EN)
            scenario = SCENARIOS_EN[idx]
            return ScenarioResponse(scenario=scenario, language="en")

        # Check for pre-translated scenarios first
        if req.language == "twi" and SCENARIOS_TWI:
            idx = today.toordinal() % len(SCENARIOS_TWI)
            scenario = SCENARIOS_TWI[idx]
            return ScenarioResponse(scenario=scenario, language=req.language)

        if req.language == "gaa" and 'SCENARIOS_GAA' in globals() and SCENARIOS_GAA:
            idx = today.toordinal() % len(SCENARIOS_GAA)
            scenario = SCENARIOS_GAA[idx]
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

# Legacy route for backward compatibility
@app.post("/translate", response_model=TranslationResponse)
async def legacy_translate_text(req: TranslationRequest):
    """Legacy translate endpoint for backward compatibility"""
    return await translate_text(req)

@app.post("/api/v1/translate", response_model=TranslationResponse)
async def translate_text(req: TranslationRequest):
    """Translate text using lightweight methods with AIService fallback"""
    try:
        # First try the primary translation method
        translated = libre_translate(req.text, req.src_lang, req.tgt_lang)
        
        # If the translation failed or returned an error message, try AIService
        if translated.startswith("[") and "error" in translated.lower():
            raise Exception("Primary translation service returned an error")
            
        return TranslationResponse(translated_text=translated)
        
    except Exception as e:
        print(f"Primary translation failed, trying AIService fallback: {e}")
        try:
            # Try AIService as fallback
            ai_service = AIService()
            
            # Format the prompt for translation
            messages = [
                {
                    "role": "system", 
                    "content": f"You are a professional translator. Translate the following text from {req.src_lang.upper()} to {req.tgt_lang.upper()}. "
                              f"Return only the translated text with no additional commentary or formatting."
                },
                {
                    "role": "user", 
                    "content": req.text
                }
            ]
            
            # Get translation from AI service
            result = await ai_service.generate_response(
                messages=messages,
                temperature=0.3,  # Lower temperature for more consistent translations
                max_tokens=1000
            )
            
            if result.get('success', False):
                translated = result['response'].strip()
                # Remove any potential quotes or brackets from the response
                translated = translated.strip('"\'[]')
                return TranslationResponse(
                    translated_text=translated,
                    details={"source": "ai_service_fallback"}
                )
            else:
                raise Exception("AIService translation failed")
                
        except Exception as ai_error:
            print(f"AIService translation fallback failed: {ai_error}")
            # Final fallback - return the original text with an error message
            return TranslationResponse(
                translated_text=f"[Translation Error] {req.text}",
                details={
                    "error": str(ai_error),
                    "source": "fallback"
                }
            )


@app.post("/api/v1/evaluate", response_model=EvaluateResponse)
async def evaluate_argument(req: EvaluateRequest):
    """Evaluate argument using AIService with fallback to simple_nlp_services"""
    try:
        # Try AIService first
        ai_service = AIService()
        evaluation = await ai_service.evaluate_argument(
            argument=req.argument,
            scenario="persuasive argument",
            tone=req.tone
        )
        
        if evaluation.get('success', False):
            scores = evaluation.get('evaluation', {})
            return EvaluateResponse(
                persuaded=scores.get('is_persuasive', False),
                feedback=scores.get('explanation', "No detailed feedback available."),
                score=int(scores.get('overall_score', 5))
            )
        
        # Fallback to simple evaluator if AIService fails
        argument_evaluator = get_argument_evaluator()
        if argument_evaluator is not None:
            eval_result = argument_evaluator.evaluate_argument(
                argument=req.argument,
                topic="persuasive argument",
                tone=req.tone
            )
            score = eval_result.get('score', 0)
            persuaded = eval_result.get('persuaded', False)
            feedback = eval_result.get('feedback', [])
            normalized_score = max(0, min(10, round(score / 10)))
            return EvaluateResponse(
                persuaded=persuaded,
                feedback=" ".join(feedback) if isinstance(feedback, list) else str(feedback),
                score=normalized_score
            )
        
        # Final fallback if both methods fail
        return EvaluateResponse(
            persuaded=False,
            feedback="Evaluation service is currently unavailable. Please try again later.",
            score=0
        )
        
    except Exception as e:
        print(f"Evaluation error: {e}")
        return EvaluateResponse(
            persuaded=False, 
            feedback=f"Evaluation error: {str(e)}", 
            score=0
        )


# Real-time streaming dialogue endpoint
from fastapi.responses import StreamingResponse
import asyncio


# Legacy route for backward compatibility
@app.post("/dialogue", response_model=None)
async def legacy_dialogue_stream_endpoint(req: DialogueRequest):
    """Legacy dialogue endpoint for backward compatibility"""
    return StreamingResponse(dialogue_stream_generator(req), media_type="text/event-stream")

@app.post("/api/v1/dialogue", response_model=None)
async def dialogue_stream_endpoint(req: DialogueRequest):
    """Real-time streaming dialogue endpoint using AIService with fallback"""
    try:
        ai_service = AIService()
        context = [f"Scenario: {req.scenario}"]
        
        # Try AIService first for generating response
        ai_response = ""
        new_stance = req.ai_stance
        reasoning = ""
        
        # Generate AI response
        messages = [
            {"role": "system", "content": f"You are having a debate about: {req.scenario}. Your current stance is: {req.ai_stance}."},
            {"role": "user", "content": req.user_argument}
        ]
        
        ai_result = await ai_service.generate_response(
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        if ai_result.get('success', False):
            ai_response = ai_result['response']
            
            # Evaluate argument for stance progression using AIService
            eval_result = await ai_service.evaluate_argument(
                argument=req.user_argument,
                scenario=req.scenario,
                tone="neutral"
            )
            
            if eval_result.get('success', False):
                scores = eval_result.get('evaluation', {})
                score = scores.get('overall_score', 50)  # Default to neutral
                current_stance = req.ai_stance
                
                # Enhanced stance progression logic
                if score >= 75:
                    if current_stance == 'disagree':
                        new_stance = 'neutral'
                        reasoning = "The argument was quite persuasive, so I'm moving towards a more neutral stance."
                    elif current_stance == 'neutral':
                        new_stance = 'agree'
                        reasoning = "The argument was very persuasive, so I now agree with your point."
                elif score >= 50:
                    if current_stance == 'disagree':
                        new_stance = 'neutral'
                        reasoning = "The argument had some good points, so I'm moving towards a more neutral stance."
                    else:
                        new_stance = current_stance
                        reasoning = "The argument was reasonable but not convincing enough to change my stance."
                else:
                    if current_stance == 'agree':
                        new_stance = 'neutral'
                        reasoning = "The argument wasn't very strong, so I'm moving back to a more neutral position."
                    else:
                        new_stance = current_stance
                        reasoning = "The argument wasn't convincing enough to change my stance."
        else:
            # Fallback to simple conversational AI
            conversational_ai = get_conversational_ai()
            if conversational_ai is not None:
                ai_response = conversational_ai.generate_response(
                    user_input=req.user_argument,
                    context=context,
                    personality="neutral",
                    stance=req.ai_stance
                )
                new_stance = req.ai_stance  # Keep same stance in fallback mode
                reasoning = "Using fallback response system"
            else:
                ai_response = "I'm having trouble generating a response right now. Could you rephrase or try again later?"
                new_stance = req.ai_stance
                reasoning = "Service unavailable"

        async def word_stream():
            for word in ai_response.split():
                yield word + " "
                await asyncio.sleep(0.1)  # Slightly faster than before
            yield f"\n[STANCE]: {new_stance}\n[REASONING]: {reasoning}"

        return StreamingResponse(word_stream(), media_type="text/plain")
        
    except Exception as e:
        print(f"Dialogue streaming error: {e}")
        async def error_stream():
            yield "I'm having trouble responding right now. Please try again later."
        return StreamingResponse(error_stream(), media_type="text/plain")

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
