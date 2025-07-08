from fastapi import FastAPI, Body
from pydantic import BaseModel
from transformers import MarianMTModel, MarianTokenizer
import random
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load MarianMT for English <-> Twi
MODEL_NAME = "Helsinki-NLP/opus-mt-en-tw"
tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
model = MarianMTModel.from_pretrained(MODEL_NAME)

def translate(text, src_lang, tgt_lang):
    # MarianMT uses model per direction, but for demo, use en-tw for both
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

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(req: EvaluateRequest):
    try:
        score = 0
        feedback = []
        if req.tone.lower() in req.argument.lower():
            score += 2
            feedback.append("Good use of selected tone.")
        if len(req.argument.split()) > 5:
            score += 2
            feedback.append("Argument is well developed.")
        else:
            feedback.append("Try to elaborate more.")
        persuaded = score >= 3
        if persuaded:
            feedback.append("The AI is persuaded!")
        else:
            feedback.append("The AI is not convinced yet.")
        return EvaluateResponse(persuaded=persuaded, feedback=" ".join(feedback), score=score)
    except Exception as e:
        return EvaluateResponse(persuaded=False, feedback="Evaluation error.", score=0) 