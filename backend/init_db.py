#!/usr/bin/env python3
"""
Database initialization script for LinguaQuest
Run this script to create the database tables and add sample data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db, SessionLocal, User, UserStreak
from crud import create_user
from models import UserCreate
from datetime import datetime

def create_sample_data():
    """Create sample users and data"""
    db = SessionLocal()
    try:
        # Create sample users
        sample_users = [
            {"nickname": "alice", "avatar": "avatar1.jpg"},
            {"nickname": "bob", "avatar": "avatar2.jpg"},
            {"nickname": "charlie", "avatar": "avatar3.jpg"},
            {"nickname": "diana", "avatar": "avatar4.jpg"},
        ]
        
        for user_data in sample_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.nickname == user_data["nickname"]).first()
            if not existing_user:
                user_create = UserCreate(
                    nickname=user_data["nickname"],
                    avatar=user_data["avatar"]
                )
                create_user(db, user_create)
                print(f"Created user: {user_data['nickname']}")
            else:
                print(f"User {user_data['nickname']} already exists")
        
        print("Sample data creation completed!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("Initializing LinguaQuest database...")
    
    # Create tables
    init_db()
    print("Database tables created successfully!")
    
    # Create sample data
    create_sample_data()
    
    print("Database initialization completed!")

if __name__ == "__main__":
    main() 