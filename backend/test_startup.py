#!/usr/bin/env python3
"""
Test script to verify LinguaQuest API can start properly
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """Test that all imports work correctly"""
    try:
        print("Testing FastAPI import...")
        from fastapi import FastAPI
        print("✓ FastAPI imported successfully")
        
        print("Testing main app import...")
        from main import app
        print("✓ Main app imported successfully")
        
        print("Testing database components...")
        from database import init_db
        print("✓ Database components imported successfully")
        
        print("Testing NLP services...")
        from simple_nlp_services import SimpleSentimentAnalyzer
        print("✓ NLP services imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Other error: {e}")
        return False

def test_app_creation():
    """Test that the FastAPI app can be created"""
    try:
        from main import app
        print(f"✓ App created successfully: {type(app)}")
        return True
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing LinguaQuest API startup...")
    print("-" * 50)
    
    if test_imports() and test_app_creation():
        print("-" * 50)
        print("✅ All tests passed! App should start successfully.")
        print("💡 You can now run: python start.py")
    else:
        print("-" * 50)
        print("❌ Tests failed. Check the errors above.")
