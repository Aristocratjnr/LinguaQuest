import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    AutoModelForSeq2SeqLM,
    AutoModelForCausalLM,
    pipeline,
    WhisperProcessor,
    WhisperForConditionalGeneration
)
from sentence_transformers import SentenceTransformer
import numpy as np
from scipy.spatial.distance import cosine
import soundfile as sf
import librosa
import tempfile
import os
from typing import Dict, List, Tuple, Optional
import json

class EnhancedSentimentAnalyzer:
    """Enhanced sentiment and tone analysis using RoBERTa-based models"""
    
    def __init__(self):
        # Load sentiment model
        self.sentiment_model_name = "cardiffnlp/twitter-roberta-base-sentiment"
        self.sentiment_tokenizer = AutoTokenizer.from_pretrained(self.sentiment_model_name)
        self.sentiment_model = AutoModelForSequenceClassification.from_pretrained(self.sentiment_model_name)
        
        # Tone classification labels
        self.tone_labels = ["polite", "passionate", "formal", "casual", "confrontational"]
        
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment with confidence scores"""
        inputs = self.sentiment_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = self.sentiment_model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
        
        labels = ["negative", "neutral", "positive"]
        scores = probabilities[0].numpy()
        
        return {
            "sentiment": labels[np.argmax(scores)],
            "confidence": float(np.max(scores)),
            "scores": {label: float(score) for label, score in zip(labels, scores)}
        }
    
    def analyze_tone(self, text: str) -> Dict[str, any]:
        """Analyze tone characteristics"""
        # Simple rule-based tone analysis (can be enhanced with fine-tuned models)
        text_lower = text.lower()
        
        tone_scores = {
            "polite": 0.0,
            "passionate": 0.0,
            "formal": 0.0,
            "casual": 0.0,
            "confrontational": 0.0
        }
        
        # Polite indicators
        polite_words = ["please", "thank you", "kindly", "would you", "could you"]
        if any(word in text_lower for word in polite_words):
            tone_scores["polite"] += 0.3
        
        # Passionate indicators
        passionate_words = ["believe", "think", "feel", "strongly", "convinced", "certain"]
        if any(word in text_lower for word in passionate_words):
            tone_scores["passionate"] += 0.4
        
        # Formal indicators
        formal_words = ["therefore", "consequently", "furthermore", "moreover", "thus"]
        if any(word in text_lower for word in formal_words):
            tone_scores["formal"] += 0.3
        
        # Casual indicators
        casual_words = ["hey", "cool", "awesome", "great", "nice"]
        if any(word in text_lower for word in casual_words):
            tone_scores["casual"] += 0.3
        
        # Confrontational indicators
        confrontational_words = ["wrong", "false", "never", "always", "impossible"]
        if any(word in text_lower for word in confrontational_words):
            tone_scores["confrontational"] += 0.4
        
        # Normalize scores
        max_score = max(tone_scores.values())
        if max_score > 0:
            tone_scores = {k: v/max_score for k, v in tone_scores.items()}
        
        dominant_tone = max(tone_scores, key=tone_scores.get)
        
        return {
            "dominant_tone": dominant_tone,
            "tone_scores": tone_scores,
            "confidence": tone_scores[dominant_tone]
        }

class ArgumentEvaluator:
    """Enhanced argument evaluation using semantic similarity"""
    
    def __init__(self):
        # Load sentence transformer model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pre-defined strong argument patterns
        self.strong_patterns = [
            "because", "therefore", "consequently", "as a result",
            "evidence shows", "research indicates", "studies have found",
            "logically", "reasonably", "clearly"
        ]
        
        # Pre-defined weak argument patterns
        self.weak_patterns = [
            "i think", "maybe", "perhaps", "possibly",
            "i guess", "sort of", "kind of", "i don't know"
        ]
    
    def evaluate_argument(self, argument: str, topic: str = None, tone: str = None) -> Dict[str, any]:
        """Evaluate argument strength and relevance"""
        
        # Base score calculation
        base_score = 50
        
        # Length factor (longer arguments tend to be more detailed)
        length_factor = min(len(argument.split()) / 20, 1.0) * 20
        base_score += length_factor
        
        # Semantic relevance to topic (if provided)
        if topic:
            relevance_score = self._calculate_semantic_similarity(argument, topic)
            base_score += relevance_score * 30
        
        # Tone impact
        if tone:
            tone_impact = self._calculate_tone_impact(tone)
            base_score += tone_impact
        
        # Pattern analysis
        pattern_score = self._analyze_argument_patterns(argument)
        base_score += pattern_score
        
        # Clamp score between 0 and 100
        final_score = max(0, min(100, base_score))
        
        # Determine if persuaded
        persuaded = final_score >= 70
        
        # Generate feedback
        feedback = self._generate_feedback(argument, final_score, tone)
        
        return {
            "score": int(final_score),
            "persuaded": persuaded,
            "feedback": feedback,
            "relevance_score": relevance_score if topic else None,
            "tone_impact": tone_impact if tone else None
        }
    
    def _calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            embeddings1 = self.model.encode([text1])
            embeddings2 = self.model.encode([text2])
            
            # Calculate cosine similarity
            similarity = 1 - cosine(embeddings1[0], embeddings2[0])
            return max(0, similarity)  # Ensure non-negative
        except Exception as e:
            print(f"Error calculating semantic similarity: {e}")
            return 0.5  # Default neutral score
    
    def _calculate_tone_impact(self, tone: str) -> float:
        """Calculate impact of tone on argument strength"""
        tone_impacts = {
            "polite": 5,
            "passionate": 10,
            "formal": 8,
            "casual": -2,
            "confrontational": -5
        }
        return tone_impacts.get(tone.lower(), 0)
    
    def _analyze_argument_patterns(self, argument: str) -> float:
        """Analyze argument for strong/weak patterns"""
        argument_lower = argument.lower()
        
        strong_count = sum(1 for pattern in self.strong_patterns if pattern in argument_lower)
        weak_count = sum(1 for pattern in self.weak_patterns if pattern in argument_lower)
        
        pattern_score = (strong_count * 3) - (weak_count * 2)
        return pattern_score
    
    def _generate_feedback(self, argument: str, score: float, tone: str = None) -> List[str]:
        """Generate constructive feedback based on evaluation"""
        feedback = []
        
        if score >= 80:
            feedback.append("Excellent argument! Your points are well-structured and persuasive.")
        elif score >= 60:
            feedback.append("Good argument with room for improvement.")
        elif score >= 40:
            feedback.append("Your argument needs more structure and evidence.")
        else:
            feedback.append("Try to provide more specific examples and logical connections.")
        
        if tone:
            if tone == "confrontational":
                feedback.append("Consider using a more respectful tone to increase persuasiveness.")
            elif tone == "casual":
                feedback.append("A more formal tone might strengthen your argument.")
        
        return feedback

class ConversationalAI:
    """Enhanced conversational AI using DialoGPT"""
    
    def __init__(self):
        # Load DialoGPT model
        self.model_name = "microsoft/DialoGPT-medium"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        
        # Add special tokens for conversation management
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Personality templates
        self.personalities = {
            "agreeable": "I'm open to different perspectives and willing to be convinced.",
            "skeptical": "I need strong evidence to change my mind.",
            "neutral": "I'm evaluating arguments objectively."
        }
    
    def generate_response(self, user_input: str, context: List[str] = None, 
                         personality: str = "neutral", stance: str = "neutral") -> str:
        """Generate contextual AI response"""
        
        # Build conversation context
        conversation = []
        if context:
            conversation.extend(context)
        
        # Add personality context
        personality_context = self.personalities.get(personality, "")
        if personality_context:
            conversation.append(f"AI: {personality_context}")
        
        # Add stance context
        stance_context = self._get_stance_context(stance)
        if stance_context:
            conversation.append(f"AI: {stance_context}")
        
        # Add user input
        conversation.append(f"User: {user_input}")
        
        # Combine conversation
        full_context = " ".join(conversation)
        
        try:
            # Generate response
            inputs = self.tokenizer.encode(full_context, return_tensors="pt", max_length=512, truncation=True)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=150,
                    num_return_sequences=1,
                    no_repeat_ngram_size=2,
                    do_sample=True,
                    top_k=50,
                    top_p=0.9,
                    temperature=0.7,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the AI response part
            if "AI:" in response:
                response = response.split("AI:")[-1].strip()
            
            return response if response else "I understand your point. Can you elaborate?"
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return self._fallback_response(stance)
    
    def _get_stance_context(self, stance: str) -> str:
        """Get context based on AI stance"""
        stance_contexts = {
            "agree": "I generally agree with this perspective.",
            "disagree": "I have some concerns about this approach.",
            "neutral": "I'm considering different viewpoints."
        }
        return stance_contexts.get(stance, "")
    
    def _fallback_response(self, stance: str) -> str:
        """Fallback responses when model fails"""
        fallback_responses = {
            "agree": "I see your point and agree with much of what you're saying.",
            "disagree": "I have a different perspective on this matter.",
            "neutral": "That's an interesting point. I'm still considering the evidence."
        }
        return fallback_responses.get(stance, "I understand your perspective.")

class SpeechToText:
    """Speech-to-text using Whisper"""
    
    def __init__(self):
        # Load Whisper model
        self.model_name = "openai/whisper-base"
        self.processor = WhisperProcessor.from_pretrained(self.model_name)
        self.model = WhisperForConditionalGeneration.from_pretrained(self.model_name)
        
        # Language mapping for African languages
        self.language_mapping = {
            "twi": "en",  # Whisper doesn't have direct Twi support, use English
            "gaa": "en",
            "ewe": "en",
            "en": "en",
            "fr": "fr"
        }
    
    def transcribe_audio(self, audio_file_path: str, language: str = "en") -> Dict[str, any]:
        """Transcribe audio file to text"""
        try:
            # Load and preprocess audio
            audio, sample_rate = sf.read(audio_file_path)
            
            # Resample if necessary (Whisper expects 16kHz)
            if sample_rate != 16000:
                audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)
            
            # Process audio
            inputs = self.processor(audio, sampling_rate=16000, return_tensors="pt")
            
            # Get language code
            lang_code = self.language_mapping.get(language, "en")
            
            # Generate transcription
            with torch.no_grad():
                generated_ids = self.model.generate(
                    inputs["input_features"],
                    language=lang_code,
                    task="transcribe"
                )
            
            transcription = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return {
                "transcription": transcription,
                "confidence": 0.8,  # Placeholder confidence
                "language": language,
                "success": True
            }
            
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return {
                "transcription": "",
                "confidence": 0.0,
                "language": language,
                "success": False,
                "error": str(e)
            }
    
    def transcribe_audio_bytes(self, audio_bytes: bytes, language: str = "en") -> Dict[str, any]:
        """Transcribe audio from bytes"""
        try:
            # Save bytes to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file.write(audio_bytes)
                temp_file_path = temp_file.name
            
            # Transcribe
            result = self.transcribe_audio(temp_file_path, language)
            
            # Clean up
            os.unlink(temp_file_path)
            
            return result
            
        except Exception as e:
            print(f"Error processing audio bytes: {e}")
            return {
                "transcription": "",
                "confidence": 0.0,
                "language": language,
                "success": False,
                "error": str(e)
            }

# Initialize services
sentiment_analyzer = EnhancedSentimentAnalyzer()
argument_evaluator = ArgumentEvaluator()
conversational_ai = ConversationalAI()
speech_to_text = SpeechToText() 