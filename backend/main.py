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

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load MarianMT for English <-> Twi, Ga, Ewe
MODEL_NAMES = {
    ("en", "twi"): "Helsinki-NLP/opus-mt-en-tw",
    ("twi", "en"): "Helsinki-NLP/opus-mt-tw-en",
    ("en", "gaa"): "Helsinki-NLP/opus-mt-en-gaa",
    ("gaa", "en"): "Helsinki-NLP/opus-mt-gaa-en",
    ("en", "ewe"): "Helsinki-NLP/opus-mt-en-ewe",
    ("ewe", "en"): "Helsinki-NLP/opus-mt-ewe-en",
}

# Cache models and tokenizers
MODEL_CACHE = {}

LEADERBOARD_FILE = 'leaderboard.json'
LEADERBOARD_LOCK = threading.Lock()

class ScoreEntry(BaseModel):
    name: str
    score: int
    date: str

class LeaderboardResponse(BaseModel):
    leaderboard: list

def get_model_and_tokenizer(src_lang, tgt_lang):
    key = (src_lang.lower(), tgt_lang.lower())
    model_name = MODEL_NAMES.get(key)
    if not model_name:
        raise ValueError(f"Translation for {src_lang} -> {tgt_lang} not supported.")
    if key not in MODEL_CACHE:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        MODEL_CACHE[key] = (tokenizer, model)
    return MODEL_CACHE[key]

def translate(text, src_lang, tgt_lang):
    tokenizer, model = get_model_and_tokenizer(src_lang, tgt_lang)
    batch = tokenizer([text], return_tensors="pt", padding=True)
    gen = model.generate(**batch)
    return tokenizer.decode(gen[0], skip_special_tokens=True)

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

@app.post("/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    try:
        translated = translate(req.text, req.src_lang, req.tgt_lang)
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

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    scores = analyzer.polarity_scores(text)
    return scores['compound']

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(req: EvaluateRequest):
    try:
        score = 0
        feedback = []
        # Sentiment analysis
        sentiment = analyze_sentiment(req.argument)
        if sentiment > 0.3:
            score += 2
            feedback.append("Your argument has a positive, persuasive tone.")
        elif sentiment < -0.3:
            score -= 1
            feedback.append("Your argument sounds negative or confrontational.")
        else:
            feedback.append("Your argument is neutral in sentiment.")
        # Tone detection (placeholder)
        if req.tone.lower() in req.argument.lower():
            score += 1
            feedback.append(f"Detected use of the selected tone: {req.tone}.")
        else:
            feedback.append(f"Try to use more {req.tone} language.")
        # Argument quality (placeholder: length-based)
        if len(req.argument.split()) > 7:
            score += 2
            feedback.append("Argument is well developed.")
        else:
            feedback.append("Try to elaborate more for a stronger argument.")
        persuaded = score >= 3
        if persuaded:
            feedback.append("The AI is persuaded!")
        else:
            feedback.append("The AI is not convinced yet.")
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
    # Placeholder: simple rule-based stance shift
    stance = req.ai_stance
    response = ""
    # If user argument is long and positive, AI is more likely to be persuaded
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
    # Optionally, translate response to target language (if not English)
    if req.language != 'en':
        try:
            response = translate(response, 'en', req.language)
        except Exception:
            pass
    return DialogueResponse(ai_response=response, new_stance=new_stance)

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