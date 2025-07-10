#!/usr/bin/env python3
"""
Test script to check translation model availability and functionality.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from integrations.translation.marianmt import MarianMTTranslator

def test_translation_models():
    """Test which translation models are available and working."""
    
    translator = MarianMTTranslator()
    
    # Test cases
    test_cases = [
        ("en", "twi", "Hello, how are you?"),
        ("twi", "en", "Mema wo akwaaba"),
        ("en", "gaa", "Good morning"),
        ("gaa", "en", "Mile gbɛ"),
        ("en", "ewe", "Thank you"),
        ("ewe", "en", "Akpe"),
        # Fallback tests
        ("en", "fr", "Hello world"),
        ("fr", "en", "Bonjour le monde"),
        ("en", "es", "Good morning"),
        ("es", "en", "Buenos días"),
    ]
    
    print("Testing translation models...")
    print("=" * 50)
    
    for src_lang, tgt_lang, test_text in test_cases:
        print(f"\nTesting {src_lang} -> {tgt_lang}")
        print(f"Input: {test_text}")
        
        try:
            # Check if supported
            if translator.is_supported(src_lang, tgt_lang):
                print("✓ Language pair supported")
                
                # Try to translate
                result = translator.translate(test_text, src_lang, tgt_lang)
                print(f"✓ Translation: {result}")
                
            else:
                print("✗ Language pair not supported")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Supported language pairs:")
    supported = translator.get_supported_languages()
    for src, tgt in supported:
        print(f"  {src} -> {tgt}")

if __name__ == "__main__":
    test_translation_models() 