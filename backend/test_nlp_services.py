#!/usr/bin/env python3
"""
Test script for the enhanced NLP services
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required modules can be imported"""
    try:
        from nlp_services import (
            EnhancedSentimentAnalyzer,
            ArgumentEvaluator,
            ConversationalAI,
            SpeechToText
        )
        print("✅ All NLP services imported successfully")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_sentiment_analyzer():
    """Test sentiment analysis functionality"""
    try:
        from nlp_services import EnhancedSentimentAnalyzer
        
        analyzer = EnhancedSentimentAnalyzer()
        
        # Test sentiment analysis
        test_text = "I love this language learning app! It's amazing."
        sentiment_result = analyzer.analyze_sentiment(test_text)
        
        print(f"✅ Sentiment analysis: {sentiment_result}")
        
        # Test tone analysis
        tone_result = analyzer.analyze_tone(test_text)
        print(f"✅ Tone analysis: {tone_result}")
        
        return True
    except Exception as e:
        print(f"❌ Sentiment analyzer error: {e}")
        return False

def test_argument_evaluator():
    """Test argument evaluation functionality"""
    try:
        from nlp_services import ArgumentEvaluator
        
        evaluator = ArgumentEvaluator()
        
        # Test argument evaluation
        test_argument = "I believe that learning local languages is important because it helps preserve cultural heritage and enables better communication with local communities."
        test_topic = "language learning importance"
        
        result = evaluator.evaluate_argument(
            argument=test_argument,
            topic=test_topic,
            tone="passionate"
        )
        
        print(f"✅ Argument evaluation: {result}")
        return True
    except Exception as e:
        print(f"❌ Argument evaluator error: {e}")
        return False

def test_conversational_ai():
    """Test conversational AI functionality"""
    try:
        from nlp_services import ConversationalAI
        
        ai = ConversationalAI()
        
        # Test response generation
        user_input = "I think learning local languages is very important for cultural preservation."
        context = ["Scenario: Discussing the importance of language learning"]
        
        response = ai.generate_response(
            user_input=user_input,
            context=context,
            personality="neutral",
            stance="neutral"
        )
        
        print(f"✅ Conversational AI response: {response}")
        return True
    except Exception as e:
        print(f"❌ Conversational AI error: {e}")
        return False

def test_speech_to_text():
    """Test speech-to-text functionality"""
    try:
        from nlp_services import SpeechToText
        
        stt = SpeechToText()
        print("✅ Speech-to-text service initialized")
        return True
    except Exception as e:
        print(f"❌ Speech-to-text error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Enhanced NLP Services")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Sentiment Analyzer", test_sentiment_analyzer),
        ("Argument Evaluator", test_argument_evaluator),
        ("Conversational AI", test_conversational_ai),
        ("Speech-to-Text", test_speech_to_text),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! NLP services are ready to use.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main() 