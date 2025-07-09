from fastapi import FastAPI, Body
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
from backend.integrations.translation.marianmt import MarianMTTranslator
from backend.integrations.nlp.sentiment import SentimentAnalyzer
from backend.integrations.nlp.argument_eval import ArgumentEvaluator

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Remove MODEL_NAMES, MODEL_CACHE, get_model_and_tokenizer, translate, analyzer, analyze_sentiment

# --- Scenario Endpoint ---
class ScenarioResponse(BaseModel):
    scenario: str
    language: str

SCENARIOS_TWI = [
    "Mekae sɛ didi ntutummu yɛ fɛ.",
    "Mepɛ sɛ meyɛ adwuma anɔpa biara.",
    "Mekae sɛ ɛho hia sɛ yɛbɔ mmɔden wɔ sukuu."
]

@app.post("/scenario", response_model=ScenarioResponse)
def get_scenario():
    try:
        scenario = random.choice(SCENARIOS_TWI)
        return ScenarioResponse(scenario=scenario, language="twi")
    except Exception as e:
        return ScenarioResponse(scenario="Error generating scenario.", language="twi")

# --- Translation Endpoint ---
class TranslationRequest(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

class TranslationResponse(BaseModel):
    translated_text: str

translation_service = MarianMTTranslator()

@app.post("/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    try:
        translated = translation_service.translate(req.text, req.src_lang, req.tgt_lang)
        return TranslationResponse(translated_text=translated)
    except Exception as e:
        return TranslationResponse(translated_text="Translation error.")

# --- Evaluation Endpoint ---
class EvaluateRequest(BaseModel):
    argument: str
    tone: str  # e.g., polite, passionate, formal

class EvaluateResponse(BaseModel):
    persuaded: bool
    feedback: str
    score: int

sentiment_service = SentimentAnalyzer()
argument_evaluator = ArgumentEvaluator()

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(req: EvaluateRequest):
    try:
        # Use argument_evaluator and sentiment_service
        sentiment = sentiment_service.analyze(req.argument)
        eval_result = argument_evaluator.evaluate(req.argument, req.tone)
        score = eval_result.get('score', 0)
        feedback = eval_result.get('feedback', [])
        persuaded = eval_result.get('persuaded', False)
        # Add sentiment-based feedback
        if sentiment > 0.3:
            score += 2
            feedback.append("Your argument has a positive, persuasive tone.")
        elif sentiment < -0.3:
            score -= 1
            feedback.append("Your argument sounds negative or confrontational.")
        else:
            feedback.append("Your argument is neutral in sentiment.")
        return EvaluateResponse(persuaded=persuaded, feedback=" ".join(feedback), score=score)
    except Exception as e:
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
    stance = req.ai_stance
    response = ""
    if len(req.user_argument.split()) > 7:
        if stance == 'disagree':
            new_stance = 'neutral'
            response = "You make some good points. Maybe I should reconsider."
        elif stance == 'neutral':
            new_stance = 'agree'
            response = "I am convinced by your argument!"
        else:
            new_stance = 'agree'
            response = "I already agree with you!"
    else:
        if stance == 'disagree':
            new_stance = 'disagree'
            response = "I am not convinced yet. Can you explain more?"
        elif stance == 'neutral':
            new_stance = 'disagree'
            response = "I'm not sure I agree with you."
        else:
            new_stance = 'neutral'
            response = "I'm not fully convinced anymore."
    if req.language != 'en':
        try:
            response = translation_service.translate(response, 'en', req.language)
        except Exception:
            pass
    return DialogueResponse(ai_response=response, new_stance=new_stance)

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