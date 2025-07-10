#!/usr/bin/env python3
"""
Test script for the simple translator.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from integrations.translation.simple_translator import SimpleTranslator

def test_simple_translator():
    """Test the simple translator functionality."""
    
    translator = SimpleTranslator()
    
    # Test cases for African languages
    test_cases = [
        ("en", "twi", "hello"),
        ("en", "twi", "thank you"),
        ("en", "twi", "good morning"),
        ("twi", "en", "Mema wo akwaaba"),
        ("twi", "en", "Meda wo ase"),
        ("en", "gaa", "hello"),
        ("gaa", "en", "Mile gbɛ"),
        ("en", "ewe", "thank you"),
        ("ewe", "en", "Akpe"),
        # Test unsupported phrases
        ("en", "twi", "this is a very long sentence that should not be translated"),
        ("en", "fr", "hello world"),  # Not supported by fallback
    ]
    
    print("Testing Simple Translator...")
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
    
    print("\n" + "=" * 50)
    print("Available phrases for Twi:")
    phrases = translator.get_available_phrases("twi")
    for phrase in phrases[:10]:  # Show first 10
        print(f"  - {phrase}")

if __name__ == "__main__":
    test_simple_translator() 