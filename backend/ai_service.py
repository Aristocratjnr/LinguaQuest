import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

try:
    import cohere  # type: ignore
except ImportError:
    cohere = None

# Load environment variables
load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
cohere_client = cohere.Client(COHERE_API_KEY) if cohere and COHERE_API_KEY else None

class AIService:
    def __init__(self):
        self.cohere_model = "command"  # Cohere's main chat model

    def evaluate_argument(self, argument: str, tone: str, scenario: str) -> Dict:
        """
        Evaluate argument persuasiveness using Cohere AI
        """
        if cohere_client is None:
            print("Cohere client not available, using fallback.")
            return self._fallback_evaluation(argument, tone)
        try:
            prompt = f"""
            You are an expert in persuasive communication and argument evaluation.
            
            Scenario: {scenario}
            User's Argument: \"{argument}\"
            Tone: {tone}
            
            Please evaluate this argument on a scale of 1-10 based on:
            1. Logical reasoning and evidence
            2. Emotional appeal and tone appropriateness
            3. Relevance to the scenario
            4. Persuasiveness and convincing power
            
            Provide your response in this exact JSON format:
            {{
                \"score\": <number between 1-10>,
                \"persuaded\": <true if score >= 7, false otherwise>,
                \"feedback\": \"<constructive feedback explaining the score>\",
                \"strengths\": [\"<strength1>\", \"<strength2>\"],
                \"suggestions\": [\"<suggestion1>\", \"<suggestion2>\"]
            }}
            """
            response = cohere_client.chat(
                model=self.cohere_model,
                message=prompt,
                temperature=0.3,
                max_tokens=300
            )
            result_text = response.text if hasattr(response, 'text') else response.reply
            import json
            result = json.loads(result_text)
            return {
                "persuaded": result.get("persuaded", False),
                "feedback": result.get("feedback", "Evaluation completed."),
                "score": result.get("score", 5.0),
                "strengths": result.get("strengths", []),
                "suggestions": result.get("suggestions", [])
            }
        except Exception as e:
            print(f"Cohere AI evaluation error: {e}")
            return self._fallback_evaluation(argument, tone)

    def generate_dialogue_response(self, scenario: str, user_argument: str, ai_stance: str, language: str = "en") -> Dict:
        """
        Generate contextual AI dialogue response using Cohere
        """
        if cohere_client is None:
            print("Cohere client not available, using fallback.")
            return self._fallback_dialogue(user_argument, ai_stance)
        try:
            prompt = f"""
            You are an AI character in a persuasion game. The scenario is: \"{scenario}\"
            
            Your current stance: {ai_stance}
            User's argument: \"{user_argument}\"
            
            Generate a natural, contextual response that:
            1. Reflects your current stance
            2. Responds to the user's argument
            3. Can change your stance if the argument is compelling
            4. Sounds natural and conversational
            
            Provide your response in this exact JSON format:
            {{
                \"ai_response\": \"<your response to the user>\",
                \"new_stance\": \"<disagree/neutral/agree>\",
                \"reasoning\": \"<brief explanation of stance change if any>\"
            }}
            """
            response = cohere_client.chat(
                model=self.cohere_model,
                message=prompt,
                temperature=0.7,
                max_tokens=200
            )
            result_text = response.text if hasattr(response, 'text') else response.reply
            import json
            result = json.loads(result_text)
            return {
                "ai_response": result.get("ai_response", "I'm considering your argument."),
                "new_stance": result.get("new_stance", ai_stance),
                "reasoning": result.get("reasoning", "")
            }
        except Exception as e:
            print(f"Cohere AI dialogue error: {e}")
            return self._fallback_dialogue(user_argument, ai_stance)

    def _fallback_evaluation(self, argument: str, tone: str) -> Dict:
        """Fallback rule-based evaluation when AI is unavailable"""
        score = 5  # Base score
        # Tone analysis
        tone_bonus = {"polite": 1, "passionate": 2, "formal": 1, "casual": 0}
        score += tone_bonus.get(tone, 0)
        # Content analysis
        persuasive_keywords = ["because", "since", "therefore", "evidence", "research", "benefit"]
        for keyword in persuasive_keywords:
            if keyword in argument.lower():
                score += 0.5
        score = min(10, max(1, score))
        persuaded = score >= 7
        return {
            "persuaded": persuaded,
            "feedback": "Fallback evaluation completed.",
            "score": round(score, 1),
            "strengths": [],
            "suggestions": []
        }

    def _fallback_dialogue(self, user_argument: str, ai_stance: str) -> Dict:
        """Fallback rule-based dialogue when AI is unavailable"""
        responses = {
            "disagree": "I understand your point, but I'm still not convinced.",
            "neutral": "You make some interesting points. Let me think about this.",
            "agree": "You've made a compelling case. I'm starting to agree."
        }
        return {
            "ai_response": responses.get(ai_stance, "I'm considering your argument."),
            "new_stance": ai_stance,
            "reasoning": "Fallback response"
        }

# Create a global instance
ai_service = AIService() 