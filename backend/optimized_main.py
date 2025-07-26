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
from typing import Dict, Optional

# Set default encoding to UTF-8 for Windows compatibility
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

from fastapi import FastAPI, Body, UploadFile, File, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import requests
from urllib.parse import quote

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
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "port": os.environ.get("PORT", "not set"),
        "memory_mode": "optimized",
        "message": "LinguaQuest API is running successfully"
    }

# Lazy loading functions
def get_nllb_model():
    """Lazy load NLLB model only when needed"""
    global _nllb_model, _nllb_tokenizer
    if _nllb_model is None:
        try:
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
            model_name = "facebook/nllb-200-distilled-600M"
            _nllb_tokenizer = AutoTokenizer.from_pretrained(model_name)
            _nllb_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            print("✅ NLLB model loaded")
        except Exception as e:
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

@app.post("/scenario", response_model=ScenarioResponse)
def get_scenario(req: ScenarioRequest):
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

@app.post("/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    """Translate text using lightweight methods"""
    try:
        translated = libre_translate(req.text, req.src_lang, req.tgt_lang)
        return TranslationResponse(translated_text=translated)
    except Exception as e:
        error_msg = f"Translation error: {str(e)}"
        print(error_msg)
        return TranslationResponse(translated_text=error_msg)

@app.post("/evaluate", response_model=EvaluateResponse)
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

@app.get("/tts")
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

@app.post('/score')
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

@app.get('/leaderboard', response_model=LeaderboardResponse)
def get_leaderboard():
    """Get leaderboard data"""
    with LEADERBOARD_LOCK:
        if os.path.exists(LEADERBOARD_FILE):
            with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = []
    data = sorted(data, key=lambda x: (-x['score'], x['date']))[:10]
    return LeaderboardResponse(leaderboard=data)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Lightweight startup - only initialize essential components"""
    print("🚀 LinguaQuest Optimized API starting up...")
    print("💾 Memory optimization: ON")
    print("🤖 ML models: Lazy loading enabled")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting LinguaQuest Optimized API on port {port}")
    
    uvicorn.run(
        "optimized_main:app",
        host="0.0.0.0",
        port=port,
        workers=1,
        log_level="info"
    )
