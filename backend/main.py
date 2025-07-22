from fastapi import FastAPI, Body, UploadFile, File
from pydantic import BaseModel
from transformers import MarianMTModel, MarianTokenizer
import random
from fastapi.middleware.cors import CORSMiddleware
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json
import os
import threading
from datetime import datetime
from fastapi import Request
from mock_modules import router as engagement_router
import requests
from gtts import gTTS
from fastapi.responses import FileResponse
import tempfile
from fastapi import Query
from urllib.parse import quote
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
from typing import Dict

# Import enhanced NLP services
from simple_nlp_services import (
    SimpleSentimentAnalyzer as EnhancedSentimentAnalyzer,
    SimpleArgumentEvaluator as ArgumentEvaluator,
    SimpleConversationalAI as ConversationalAI,
    SimpleSpeechToText as SpeechToText
)

# Import database components
from database import init_db
from user_api import router as user_router
from game_api import router as game_router
from engagement_api_v2 import router as engagement_v2_router
from progression_api import router as progression_router
from progression_tracking import router as progression_tracking_router
from language_club import router as language_club_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    init_db()
    print("Database initialized successfully!")

# Include new database routers
app.include_router(user_router, prefix="/api/v1", tags=["users"])
app.include_router(game_router, prefix="/api/v1", tags=["game"])
app.include_router(engagement_v2_router, prefix="/api/v1", tags=["engagement"])
app.include_router(progression_router, prefix="/api/v1", tags=["progression"])
app.include_router(progression_tracking_router, prefix="/api/v1", tags=["progression-tracking"])
app.include_router(language_club_router, prefix="/api/v1", tags=["language-club"])

# Keep the old engagement router for backward compatibility
app.include_router(engagement_router, tags=["engagement-legacy"])

# Initialize enhanced NLP services
sentiment_analyzer = EnhancedSentimentAnalyzer()
argument_evaluator = ArgumentEvaluator()
conversational_ai = ConversationalAI()
speech_to_text = SpeechToText()

# --- Scenario Endpoint ---
class ScenarioRequest(BaseModel):
    category: str = "general"
    difficulty: str = "medium"
    language: str = "twi"  # Default to Twi

class ScenarioResponse(BaseModel):
    scenario: str
    language: str

# English scenarios as base
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

# Twi scenarios (for reference)
SCENARIOS_TWI = [
    "Mekae sɛ didi ntutummu yɛ fɛ.",
    "Mepɛ sɛ meyɛ adwuma anɔpa biara.",
    "Mekae sɛ ɛho hia sɛ yɛbɔ mmɔden wɔ sukuu."
]

# Ga scenarios
SCENARIOS_GAA = [
    "Misusu akɛ niyenii fɛɛfɛo ye nyam.",
    "Misumɔɔ nɔ ni matsu nii leebi.",
    "Miyeɔ mihe akɛ hesusumɔ he hiaa wɔ skul."
]

# Ewe scenarios
SCENARIOS_EWE = [
    "Mesusu be nuɖuɖu nyuitɔwo vivina.",
    "Melɔ̃ be mawɔ dɔ ŋdi sia ŋdi.",
    "Mexɔe se be edze be míawɔ dɔ sesĩe le suku."
]

@app.post("/scenario", response_model=ScenarioResponse)
def get_scenario(req: ScenarioRequest):
    try:
        print(f"Received scenario request: category={req.category}, difficulty={req.difficulty}, language={req.language}")
        
        # If language is English, return an English scenario directly
        if req.language == "en":
            scenario = random.choice(SCENARIOS_EN)
            return ScenarioResponse(scenario=scenario, language="en")
        
        # For non-English languages, try this order:
        # 1. Pre-translated scenarios if available
        # 2. NLLB translation
        # 3. Fallback translator
        # 4. LibreTranslate
        # 5. Return English with a message
        
        # 1. Check for pre-translated scenarios
        available_scenarios = None
        if req.language == "twi":
            available_scenarios = SCENARIOS_TWI
        elif req.language == "gaa":
            available_scenarios = SCENARIOS_GAA
        elif req.language == "ewe":
            available_scenarios = SCENARIOS_EWE
            
        if available_scenarios:
            scenario = random.choice(available_scenarios)
            print(f"Using pre-translated scenario: {scenario}")
            return ScenarioResponse(scenario=scenario, language=req.language)
        
        # Get a random English scenario to translate
        scenario_en = random.choice(SCENARIOS_EN)
        print(f"Selected English scenario for translation: {scenario_en}")
        
        # 2. Try NLLB translation first if available
        if nllb_model is not None and nllb_tokenizer is not None:
            try:
                print(f"Attempting NLLB translation to {req.language}...")
                translated = nllb_translate(scenario_en, "en", req.language)
                if translated and not translated.startswith("["):
                    print(f"NLLB translation successful: {translated}")
                    return ScenarioResponse(scenario=translated, language=req.language)
                print("NLLB translation returned invalid result")
            except Exception as e:
                print(f"NLLB translation failed: {e}")
        else:
            print("NLLB translation not available - model not loaded")
        
        # 3. Try fallback translator for African languages
        if req.language in ["twi", "gaa", "ewe"]:
            try:
                from integrations.translation.fallback_translator import FallbackTranslator
                translated = FallbackTranslator.translate(scenario_en, "en", req.language)
                if translated and not translated.startswith("["):
                    print(f"Fallback translation successful: {translated}")
                    return ScenarioResponse(scenario=translated, language=req.language)
                print("Fallback translation returned invalid result")
            except Exception as e:
                print(f"Fallback translation failed: {e}")
        
        # 4. Try LibreTranslate as last resort
        try:
            print(f"Attempting LibreTranslate translation to {req.language}...")
            translated = libre_translate(scenario_en, "en", req.language)
            if translated and not translated.startswith("["):
                print(f"LibreTranslate translation successful: {translated}")
                return ScenarioResponse(scenario=translated, language=req.language)
            print("LibreTranslate translation returned invalid result")
        except Exception as e:
            print(f"LibreTranslate translation failed: {e}")
        
        # 5. If all translation attempts fail, return English with a message
        print("All translation attempts failed - returning English with message")
        return ScenarioResponse(
            scenario=f"{scenario_en} [Translation not available for {req.language}]",
            language="en"
        )
        
    except Exception as e:
        print(f"Scenario generation error: {e}")
        return ScenarioResponse(
            scenario="Error generating scenario.", 
            language="en"
        )
    except Exception as e:
        print(f"Scenario generation error: {e}")
        return ScenarioResponse(scenario="Error generating scenario.", language="en")

# --- Translation Endpoint ---
class TranslationRequest(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

class TranslationResponse(BaseModel):
    translated_text: str

# --- LibreTranslate Real-Time Translation ---
def libre_translate(text, source, target):
    urls = [
        "https://libretranslate.de/translate",
        "https://translate.argosopentech.com/translate"
    ]
    payload = {
        "q": text,
        "source": source,
        "target": target,
        "format": "text"
    }
    for url in urls:
        try:
            response = requests.post(url, data=payload, timeout=10)
            print(f"LibreTranslate response from {url}: {response.text}")
            if response.status_code != 200:
                continue
            try:
                return response.json().get("translatedText", "[Translation error]")
            except Exception as e:
                print(f"JSON decode error from {url}: {e}")
                continue
        except Exception as e:
            print(f"Request error from {url}: {e}")
            continue
    # Fallback: MyMemory API
    try:
        mm_url = f"https://api.mymemory.translated.net/get?q={quote(text)}&langpair={source}|{target}"
        mm_response = requests.get(mm_url, timeout=10)
        print(f"MyMemory response: {mm_response.text}")
        if mm_response.status_code == 200:
            data = mm_response.json()
            return data.get("responseData", {}).get("translatedText", "[Translation error]")
    except Exception as e:
        print(f"MyMemory error: {e}")
    return "[Translation error: All translation services failed]"

# NLLB setup
# Use a smaller NLLB model that's more accessible
NLLB_MODEL_NAME = "facebook/nllb-200-distilled-600M"  # Smaller, faster model

# Initialize model with better error handling
try:
    nllb_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME)
    nllb_model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL_NAME)
    print(f"Successfully loaded NLLB model: {NLLB_MODEL_NAME}")
except Exception as e:
    print(f"Failed to load NLLB model: {e}")
    nllb_tokenizer = None
    nllb_model = None

# Updated language code mapping for African languages
LANG_CODE_MAP = {
    'en': 'eng_Latn',
    'fr': 'fra_Latn',
    'twi': 'aka_Latn',  # Akan/Twi
    'ak': 'aka_Latn',   # Alternative code for Akan
    'ewe': 'ewe_Latn',  # Ewe
    'gaa': 'gaa_Latn',  # Ga
    # Add other commonly used languages
    'es': 'spa_Latn',
    'de': 'deu_Latn',
    'pt': 'por_Latn',
    'sw': 'swh_Latn',  # Swahili
    'yo': 'yor_Latn',  # Yoruba
    'ha': 'hau_Latn',  # Hausa
}

def nllb_translate(text, src_lang, tgt_lang):
    src_code = LANG_CODE_MAP.get(src_lang, 'eng_Latn')
    tgt_code = LANG_CODE_MAP.get(tgt_lang, 'eng_Latn')
    inputs = nllb_tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        translated_tokens = nllb_model.generate(
            **inputs,
            forced_bos_token_id=nllb_tokenizer.lang_code_to_id[tgt_code]
        )
    return nllb_tokenizer.decode(translated_tokens[0], skip_special_tokens=True)

@app.post("/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    try:
        translated = nllb_translate(req.text, req.src_lang, req.tgt_lang)
        return TranslationResponse(translated_text=translated)
    except Exception as e:
        print(f"NLLB translation failed: {e}")
        # Fallback to LibreTranslate/MyMemory if NLLB fails
        try:
            translated = libre_translate(req.text, req.src_lang, req.tgt_lang)
            return TranslationResponse(translated_text=translated)
        except Exception as e2:
            error_msg = f"Translation error: {str(e2)}"
            print(f"Translation failed: {error_msg}")
            return TranslationResponse(translated_text=error_msg)

# --- gTTS Text-to-Speech Endpoint ---

@app.get("/tts")
def tts(text: str = Query(...), lang: str = Query("en")):
    try:
        tts = gTTS(text=text, lang=lang)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as fp:
            tts.save(fp.name)
            return FileResponse(fp.name, media_type='audio/mpeg', filename='tts.mp3')
    except Exception as e:
        return {"error": str(e)}

# --- Speech-to-Text Endpoint ---
class TranscriptionResponse(BaseModel):
    transcription: str
    confidence: float
    language: str
    success: bool
    error: str = None

@app.post("/stt", response_model=TranscriptionResponse)
async def speech_to_text_endpoint(
    audio_file: UploadFile = File(...),
    language: str = Query("en")
):
    """Convert speech to text using Whisper"""
    try:
        # Read audio file
        audio_bytes = await audio_file.read()
        
        # Transcribe using enhanced speech-to-text service
        result = speech_to_text.transcribe_audio_bytes(audio_bytes, language)
        
        return TranscriptionResponse(
            transcription=result.get('transcription', ''),
            confidence=result.get('confidence', 0.0),
            language=result.get('language', language),
            success=result.get('success', False),
            error=result.get('error')
        )
        
    except Exception as e:
        print(f"Speech-to-text error: {e}")
        return TranscriptionResponse(
            transcription="",
            confidence=0.0,
            language=language,
            success=False,
            error=str(e)
        )

# --- Evaluation Endpoint ---
class EvaluateRequest(BaseModel):
    argument: str
    tone: str  # e.g., polite, passionate, formal

class EvaluateResponse(BaseModel):
    persuaded: bool
    feedback: str
    score: int

sentiment_service = EnhancedSentimentAnalyzer()
argument_evaluator = ArgumentEvaluator()

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(req: EvaluateRequest):
    try:
        # Enhanced evaluation using new NLP services
        sentiment_result = sentiment_analyzer.analyze_sentiment(req.argument)
        tone_result = sentiment_analyzer.analyze_tone(req.argument)
        
        # Evaluate argument with topic context
        eval_result = argument_evaluator.evaluate_argument(
            argument=req.argument,
            topic="persuasive argument",  # Default topic
            tone=req.tone
        )
        
        score = eval_result.get('score', 0)
        feedback = eval_result.get('feedback', [])
        persuaded = eval_result.get('persuaded', False)
        
        # Add sentiment-based feedback
        sentiment = sentiment_result['sentiment']
        sentiment_confidence = sentiment_result['confidence']
        
        if sentiment == 'positive' and sentiment_confidence > 0.6:
            score += 5
            feedback.append("Your argument has a positive, persuasive tone.")
        elif sentiment == 'negative' and sentiment_confidence > 0.6:
            score -= 3
            feedback.append("Your argument sounds negative or confrontational.")
        else:
            feedback.append("Your argument is neutral in sentiment.")
        
        # Add tone feedback
        dominant_tone = tone_result['dominant_tone']
        tone_confidence = tone_result['confidence']
        
        if tone_confidence > 0.5:
            if dominant_tone == 'polite':
                feedback.append("Your polite tone enhances persuasiveness.")
            elif dominant_tone == 'passionate':
                feedback.append("Your passionate tone shows conviction.")
            elif dominant_tone == 'confrontational':
                feedback.append("Consider a more respectful tone.")
        
        # Clamp score between 0 and 100
        score = max(0, min(100, score))
        # Normalize to 0-10 scale for frontend display
        normalized_score = round(score / 10)
        return EvaluateResponse(persuaded=persuaded, feedback=" ".join(feedback), score=normalized_score)
    except Exception as e:
        print(f"Evaluation error: {e}")
        return EvaluateResponse(persuaded=False, feedback="Evaluation error.", score=0)

# --- Dialogue Endpoint ---
class DialogueRequest(BaseModel):
    scenario: str
    user_argument: str
    ai_stance: str  # e.g., 'agree', 'disagree', 'neutral'
    language: str   # e.g., 'twi', 'gaa', 'ewe'

class DialogueResponse(BaseModel):
    ai_response: str
    new_stance: str

@app.post("/dialogue", response_model=DialogueResponse)
def dialogue(req: DialogueRequest):
    try:
        # Use enhanced conversational AI
        context = [f"Scenario: {req.scenario}"]
        
        # Generate AI response using conversational model
        ai_response = conversational_ai.generate_response(
            user_input=req.user_argument,
            context=context,
            personality="neutral",
            stance=req.ai_stance
        )
        
        # Determine new stance based on argument strength
        eval_result = argument_evaluator.evaluate_argument(
            argument=req.user_argument,
            topic=req.scenario,
            tone="neutral"
        )
        
        score = eval_result.get('score', 0)
        current_stance = req.ai_stance
        
        # Update stance based on argument strength
        if score >= 75:
            if current_stance == 'disagree':
                new_stance = 'neutral'
            elif current_stance == 'neutral':
                new_stance = 'agree'
            else:
                new_stance = 'agree'
        elif score >= 50:
            if current_stance == 'disagree':
                new_stance = 'neutral'
            else:
                new_stance = current_stance
        else:
            if current_stance == 'agree':
                new_stance = 'neutral'
            else:
                new_stance = current_stance
        
        # Translate response if needed
        if req.language != 'en':
            try:
                ai_response = libre_translate(ai_response, 'en', req.language)
            except Exception as e:
                print(f"Translation error: {e}")
                # Fallback to original response
        
        return DialogueResponse(ai_response=ai_response, new_stance=new_stance)
        
    except Exception as e:
        print(f"Dialogue error: {e}")
        # Fallback to simple response
        fallback_response = "I understand your point. Can you elaborate?"
        if req.language != 'en':
            try:
                fallback_response = libre_translate(fallback_response, 'en', req.language)
            except Exception:
                pass
        return DialogueResponse(ai_response=fallback_response, new_stance=req.ai_stance)

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
    with LEADERBOARD_LOCK:
        if os.path.exists(LEADERBOARD_FILE):
            with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = []
    # Sort by score descending, then date
    data = sorted(data, key=lambda x: (-x['score'], x['date']))[:10]
    return LeaderboardResponse(leaderboard=data) 

# --- Enhanced Sentiment and Tone Analysis Endpoint ---
class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    sentiment_scores: Dict[str, float]
    dominant_tone: str
    tone_confidence: float
    tone_scores: Dict[str, float]

@app.post("/sentiment", response_model=SentimentResponse)
def analyze_sentiment_and_tone(req: SentimentRequest):
    """Enhanced sentiment and tone analysis"""
    try:
        # Analyze sentiment
        sentiment_result = sentiment_analyzer.analyze_sentiment(req.text)
        
        # Analyze tone
        tone_result = sentiment_analyzer.analyze_tone(req.text)
        
        return SentimentResponse(
            sentiment=sentiment_result['sentiment'],
            confidence=sentiment_result['confidence'],
            sentiment_scores=sentiment_result['scores'],
            dominant_tone=tone_result['dominant_tone'],
            tone_confidence=tone_result['confidence'],
            tone_scores=tone_result['tone_scores']
        )
        
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return SentimentResponse(
            sentiment="neutral",
            confidence=0.0,
            sentiment_scores={"positive": 0.33, "neutral": 0.34, "negative": 0.33},
            dominant_tone="neutral",
            tone_confidence=0.0,
            tone_scores={"polite": 0.0, "passionate": 0.0, "formal": 0.0, "casual": 0.0, "confrontational": 0.0}
        )

app.include_router(engagement_router, prefix="/api/engagement")