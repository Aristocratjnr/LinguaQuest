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
from backend.integrations.translation.simple_translator import SimpleTranslator
from backend.integrations.nlp.sentiment import SentimentAnalyzer
from backend.integrations.nlp.argument_eval import ArgumentEvaluator
import requests
from gtts import gTTS
from fastapi.responses import FileResponse
import tempfile
from fastapi import Query
from urllib.parse import quote
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
NLLB_MODEL_NAME = "facebook/nllb-200-distilled-600M"
nllb_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME)
nllb_model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL_NAME)

LANG_CODE_MAP = {
    'en': 'eng_Latn',
    'fr': 'fra_Latn',
    'twi': 'aka_Latn',  # Akan/Twi
    'ak': 'aka_Latn',
    'ewe': 'ewe_Latn',
    'gaa': 'gaa_Latn',
    # Add more as needed
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
            response = libre_translate(response, 'en', req.language)
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