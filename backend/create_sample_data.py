from database import SessionLocal, User, UserScore, UserStreak, UserActivity
from sqlalchemy import func
from datetime import datetime, timedelta
import random

def create_sample_data():
    db = SessionLocal()
    try:
        # Sample languages
        languages = ['twi', 'gaa', 'ewe']
        
        # Get existing users
        users = db.query(User).all()
        
        for user in users:
            # Create streaks
            streak = db.query(UserStreak).filter(UserStreak.user_id == user.id).first()
            if not streak:
                streak = UserStreak(
                    user_id=user.id,
                    current_streak=random.randint(1, 14),
                    longest_streak=random.randint(14, 30),
                    last_activity_date=datetime.utcnow() - timedelta(days=1)
                )
                db.add(streak)
            
            # Create scores for each language
            for lang in languages:
                # Add multiple score entries
                for _ in range(random.randint(3, 10)):
                    score = UserScore(
                        user_id=user.id,
                        score=random.randint(50, 500),
                        language=lang,
                        category='lesson',
                        created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                    )
                    db.add(score)
                
                # Add activity records
                activity = UserActivity(
                    user_id=user.id,
                    activity_type=f'language_practice_{lang}',
                    details={
                        'language': lang,
                        'session_count': random.randint(5, 20),
                        'total_time': random.randint(30, 180)
                    },
                    timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                )
                db.add(activity)
        
        db.commit()
        print("Sample language club data created successfully!")
        
        # Print some statistics
        for lang in languages:
            users_count = db.query(UserScore.user_id).filter(UserScore.language == lang).distinct().count()
            total_xp = db.query(func.sum(UserScore.score)).filter(UserScore.language == lang).scalar() or 0
            print(f"\n{lang.upper()} Language Club:")
            print(f"Active users: {users_count}")
            print(f"Total XP: {total_xp}")
            
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
