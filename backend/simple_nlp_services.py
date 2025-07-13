import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    AutoModelForSeq2SeqLM
)
import numpy as np
import json
import tempfile
import os
from typing import Dict, List, Tuple, Optional
import re

class SimpleSentimentAnalyzer:
    """Simplified sentiment and tone analysis using basic NLP techniques"""
    
    def __init__(self):
        # Use a simpler sentiment model that's more likely to be available
        try:
            self.sentiment_model_name = "cardiffnlp/twitter-roberta-base-sentiment"
            self.sentiment_tokenizer = AutoTokenizer.from_pretrained(self.sentiment_model_name)
            self.sentiment_model = AutoModelForSequenceClassification.from_pretrained(self.sentiment_model_name)
            self.use_model = True
        except Exception as e:
            print(f"Could not load sentiment model: {e}")
            self.use_model = False
        
        # Tone classification patterns
        self.tone_patterns = {
            "polite": ["please", "thank you", "kindly", "would you", "could you", "may i"],
            "passionate": ["believe", "think", "feel", "strongly", "convinced", "certain", "love", "hate"],
            "formal": ["therefore", "consequently", "furthermore", "moreover", "thus", "hence"],
            "casual": ["hey", "cool", "awesome", "great", "nice", "yeah", "okay"],
            "confrontational": ["wrong", "false", "never", "always", "impossible", "ridiculous", "stupid"]
        }
        
    def analyze_sentiment(self, text: str) -> Dict[str, any]:
        """Analyze sentiment with confidence scores"""
        if self.use_model:
            try:
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
            except Exception as e:
                print(f"Model sentiment analysis failed: {e}")
        
        # Fallback to rule-based sentiment analysis
        return self._rule_based_sentiment(text)
    
    def _rule_based_sentiment(self, text: str) -> Dict[str, any]:
        """Rule-based sentiment analysis as fallback"""
        text_lower = text.lower()
        
        positive_words = ["good", "great", "excellent", "amazing", "wonderful", "love", "like", "happy", "positive"]
        negative_words = ["bad", "terrible", "awful", "hate", "dislike", "sad", "negative", "wrong", "horrible"]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(text.split())
        if total_words == 0:
            return {
                "sentiment": "neutral",
                "confidence": 0.5,
                "scores": {"positive": 0.33, "neutral": 0.34, "negative": 0.33}
            }
        
        positive_score = positive_count / total_words
        negative_score = negative_count / total_words
        
        if positive_score > negative_score and positive_score > 0.1:
            sentiment = "positive"
            confidence = min(positive_score * 5, 0.9)
        elif negative_score > positive_score and negative_score > 0.1:
            sentiment = "negative"
            confidence = min(negative_score * 5, 0.9)
        else:
            sentiment = "neutral"
            confidence = 0.6
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "scores": {
                "positive": positive_score,
                "neutral": 1 - positive_score - negative_score,
                "negative": negative_score
            }
        }
    
    def analyze_tone(self, text: str) -> Dict[str, any]:
        """Analyze tone characteristics using pattern matching"""
        text_lower = text.lower()
        
        tone_scores = {tone: 0.0 for tone in self.tone_patterns.keys()}
        
        # Calculate tone scores based on pattern matches
        for tone, patterns in self.tone_patterns.items():
            matches = sum(1 for pattern in patterns if pattern in text_lower)
            tone_scores[tone] = min(matches * 0.3, 1.0)
        
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

class SimpleArgumentEvaluator:
    """Simplified argument evaluation using basic NLP techniques"""
    
    def __init__(self):
        # Strong argument indicators
        self.strong_patterns = [
            "because", "therefore", "consequently", "as a result",
            "evidence shows", "research indicates", "studies have found",
            "logically", "reasonably", "clearly", "obviously",
            "for example", "specifically", "in particular"
        ]
        
        # Weak argument indicators
        self.weak_patterns = [
            "i think", "maybe", "perhaps", "possibly",
            "i guess", "sort of", "kind of", "i don't know",
            "probably", "might", "could be"
        ]
        
        # Topic relevance keywords
        self.topic_keywords = {
            "language learning": ["language", "learn", "speak", "communication", "culture"],
            "education": ["education", "learn", "study", "knowledge", "school"],
            "cultural preservation": ["culture", "heritage", "tradition", "preserve", "history"],
            "community": ["community", "people", "society", "together", "group"]
        }
    
    def evaluate_argument(self, argument: str, topic: str = None, tone: str = None) -> Dict[str, any]:
        """Evaluate argument strength and relevance"""
        
        # Base score calculation
        base_score = 50
        
        # Length factor (longer arguments tend to be more detailed)
        words = argument.split()
        length_factor = min(len(words) / 20, 1.0) * 20
        base_score += length_factor
        
        # Topic relevance (if provided)
        if topic:
            relevance_score = self._calculate_topic_relevance(argument, topic)
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
    
    def _calculate_topic_relevance(self, argument: str, topic: str) -> float:
        """Calculate topic relevance using keyword matching"""
        argument_lower = argument.lower()
        topic_lower = topic.lower()
        
        # Get relevant keywords for the topic
        keywords = self.topic_keywords.get(topic_lower, [topic_lower])
        
        # Count keyword matches
        matches = sum(1 for keyword in keywords if keyword in argument_lower)
        
        # Normalize by argument length
        word_count = len(argument.split())
        if word_count == 0:
            return 0.5
        
        relevance = min(matches / word_count * 10, 1.0)
        return relevance
    
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

class SimpleConversationalAI:
    """Simplified conversational AI using rule-based responses"""
    
    def __init__(self):
        # Response templates based on stance and argument quality
        self.response_templates = {
            "agree": {
                "strong": [
                    "I completely agree with your excellent points.",
                    "You've made a compelling argument that I fully support.",
                    "Your reasoning is sound and I'm convinced."
                ],
                "moderate": [
                    "I see your point and generally agree.",
                    "You make some good arguments that I find convincing.",
                    "I tend to agree with your perspective."
                ],
                "weak": [
                    "I see where you're coming from.",
                    "There's some merit to your argument.",
                    "I understand your point of view."
                ]
            },
            "disagree": {
                "strong": [
                    "I have some concerns about your argument.",
                    "I'm not fully convinced by your reasoning.",
                    "I see things differently on this matter."
                ],
                "moderate": [
                    "I'm not sure I agree with all your points.",
                    "I have a different perspective on this.",
                    "I'm not entirely convinced by your argument."
                ],
                "weak": [
                    "I'm not sure I follow your reasoning.",
                    "Could you explain your point more clearly?",
                    "I need more information to understand your position."
                ]
            },
            "neutral": {
                "strong": [
                    "That's a very interesting perspective worth considering.",
                    "You've raised some compelling points to think about.",
                    "Your argument presents an intriguing viewpoint."
                ],
                "moderate": [
                    "I see both sides of this issue.",
                    "This is a complex topic with multiple viewpoints.",
                    "I'm still evaluating the different perspectives."
                ],
                "weak": [
                    "I need to think more about this.",
                    "This is an interesting point to consider.",
                    "I'm not sure what to make of this argument."
                ]
            }
        }
    
    def generate_response(self, user_input: str, context: List[str] = None, 
                         personality: str = "neutral", stance: str = "neutral") -> str:
        """Generate contextual AI response"""
        
        # Simple argument strength assessment
        words = user_input.split()
        argument_strength = "weak"
        
        if len(words) > 15:
            argument_strength = "strong"
        elif len(words) > 8:
            argument_strength = "moderate"
        
        # Get appropriate response template
        responses = self.response_templates.get(stance, self.response_templates["neutral"])
        response_list = responses.get(argument_strength, responses["weak"])
        
        # Select a response
        import random
        response = random.choice(response_list)
        
        return response

class SimpleSpeechToText:
    """Simplified speech-to-text service (placeholder)"""
    
    def __init__(self):
        self.supported_languages = ["en", "fr"]
        
    def transcribe_audio_bytes(self, audio_bytes: bytes, language: str = "en") -> Dict[str, any]:
        """Placeholder for speech-to-text functionality"""
        # This is a placeholder - in a real implementation, you would use Whisper or similar
        return {
            "transcription": "[Speech-to-text not implemented - placeholder]",
            "confidence": 0.0,
            "language": language,
            "success": False,
            "error": "Speech-to-text requires additional dependencies (Whisper)"
        }

# Initialize services
sentiment_analyzer = SimpleSentimentAnalyzer()
argument_evaluator = SimpleArgumentEvaluator()
conversational_ai = SimpleConversationalAI()
speech_to_text = SimpleSpeechToText() 