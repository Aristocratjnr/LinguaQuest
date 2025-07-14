#!/usr/bin/env python3
"""
Test script for LinguaQuest database implementation
Run this script to test the database functionality.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from crud import create_user, get_user_by_nickname, create_score, get_user_stats
from models import UserCreate, ScoreCreate
import requests
import json

def test_database_operations():
    """Test basic database operations"""
    print("Testing database operations...")
    
    db = SessionLocal()
    try:
        # Test user creation
        user_data = UserCreate(nickname="test_user", avatar="test_avatar.jpg")
        user = create_user(db, user_data)
        print(f"✓ Created user: {user.nickname}")
        
        # Test user retrieval
        retrieved_user = get_user_by_nickname(db, "test_user")
        if retrieved_user:
            print(f"✓ Retrieved user: {retrieved_user.nickname}")
        else:
            print("✗ Failed to retrieve user")
        
        # Test score creation
        score_data = ScoreCreate(
            score=85,
            language="twi",
            category="politics",
            difficulty="medium"
        )
        score = create_score(db, user.id, score_data)
        print(f"✓ Created score: {score.score} for {score.language}")
        
        # Test user stats
        stats = get_user_stats(db, user.id)
        print(f"✓ User stats: {stats}")
        
        print("All database tests passed!")
        
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        db.rollback()
    finally:
        db.close()

def test_api_endpoints():
    """Test API endpoints"""
    print("\nTesting API endpoints...")
    
    base_url = "http://localhost:8000/api/v1"
    
    try:
        # Test user creation
        user_data = {
            "nickname": "api_test_user",
            "avatar": "api_test_avatar.jpg"
        }
        
        response = requests.post(f"{base_url}/users", json=user_data)
        if response.status_code == 200:
            print("✓ User creation API works")
        else:
            print(f"✗ User creation API failed: {response.status_code}")
        
        # Test score submission
        score_data = {
            "score": 90,
            "language": "twi",
            "category": "education",
            "difficulty": "hard"
        }
        
        response = requests.post(
            f"{base_url}/scores?nickname=api_test_user",
            json=score_data
        )
        if response.status_code == 200:
            print("✓ Score submission API works")
        else:
            print(f"✗ Score submission API failed: {response.status_code}")
        
        # Test user stats
        response = requests.get(f"{base_url}/stats/api_test_user")
        if response.status_code == 200:
            print("✓ User stats API works")
        else:
            print(f"✗ User stats API failed: {response.status_code}")
        
        # Test leaderboard
        response = requests.get(f"{base_url}/leaderboard")
        if response.status_code == 200:
            print("✓ Leaderboard API works")
        else:
            print(f"✗ Leaderboard API failed: {response.status_code}")
        
        print("All API tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to server. Make sure the server is running on localhost:8000")
    except Exception as e:
        print(f"✗ API test failed: {e}")

def main():
    """Main test function"""
    print("LinguaQuest Database Test Suite")
    print("=" * 40)
    
    # Initialize database
    print("Initializing database...")
    init_db()
    print("✓ Database initialized")
    
    # Test database operations
    test_database_operations()
    
    # Test API endpoints
    test_api_endpoints()
    
    print("\nTest suite completed!")

if __name__ == "__main__":
    main() 