from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from pydantic import BaseModel
from database import get_db, User, UserProgressionStage
from datetime import datetime

router = APIRouter(prefix="/api/v1")

# Pydantic models for API
class ProgressionStageBase(BaseModel):
    id: str
    label: str
    unlocked: bool
    children: Optional[List['ProgressionStageBase']] = None

class ProgressionStageCreate(ProgressionStageBase):
    stage_type: str = 'main'
    parent_stage_id: Optional[str] = None

class ProgressionStageResponse(ProgressionStageBase):
    class Config:
        from_attributes = True

# Define initial progression stages
INITIAL_STAGES = [
    {
        "id": "basics",
        "label": "Language Basics",
        "stage_type": "main",
        "unlocked": True,  # First stage is always unlocked
        "children": [
            {
                "id": "basics_1",
                "label": "Introduction",
                "stage_type": "sub",
                "unlocked": True
            },
            {
                "id": "basics_2",
                "label": "Simple Phrases",
                "stage_type": "sub",
                "unlocked": False
            },
            {
                "id": "basics_3",
                "label": "Basic Grammar",
                "stage_type": "sub",
                "unlocked": False
            }
        ]
    },
    {
        "id": "intermediate",
        "label": "Intermediate Skills",
        "stage_type": "main",
        "unlocked": False,
        "children": [
            {
                "id": "intermediate_1",
                "label": "Advanced Phrases",
                "stage_type": "sub",
                "unlocked": False
            },
            {
                "id": "intermediate_2",
                "label": "Complex Grammar",
                "stage_type": "sub",
                "unlocked": False
            }
        ]
    },
    {
        "id": "advanced",
        "label": "Advanced Topics",
        "stage_type": "main",
        "unlocked": False,
        "children": [
            {
                "id": "advanced_1",
                "label": "Idiomatic Expressions",
                "stage_type": "sub",
                "unlocked": False
            },
            {
                "id": "advanced_2",
                "label": "Cultural Context",
                "stage_type": "sub",
                "unlocked": False
            }
        ]
    },
    {
        "id": "mastery",
        "label": "Language Mastery",
        "stage_type": "main",
        "unlocked": False,
        "children": [
            {
                "id": "mastery_1",
                "label": "Native-like Fluency",
                "stage_type": "sub",
                "unlocked": False
            },
            {
                "id": "mastery_2",
                "label": "Professional Usage",
                "stage_type": "sub",
                "unlocked": False
            }
        ]
    }
]

def get_user_by_nickname(db: Session, nickname: str) -> Optional[User]:
    return db.query(User).filter(User.nickname == nickname).first()

def initialize_user_progression(db: Session, user_id: int):
    """Initialize progression stages for a new user"""
    for stage in INITIAL_STAGES:
        # Create main stage
        main_stage = UserProgressionStage(
            user_id=user_id,
            stage_id=stage["id"],
            stage_type="main",
            label=stage["label"],
            unlocked=stage["unlocked"]
        )
        db.add(main_stage)
        
        # Create sub-stages
        if stage.get("children"):
            for child in stage["children"]:
                sub_stage = UserProgressionStage(
                    user_id=user_id,
                    stage_id=child["id"],
                    stage_type="sub",
                    label=child["label"],
                    unlocked=child["unlocked"],
                    parent_stage_id=stage["id"]
                )
                db.add(sub_stage)
    
    db.commit()

def build_progression_tree(stages: List[UserProgressionStage]) -> List[ProgressionStageResponse]:
    """Build a hierarchical progression tree from flat stage list"""
    # Group stages by type
    main_stages = [s for s in stages if s.stage_type == 'main']
    sub_stages = [s for s in stages if s.stage_type == 'sub']
    
    # Build tree
    tree = []
    for main in main_stages:
        children = [
            ProgressionStageResponse(
                id=sub.stage_id,
                label=sub.label,
                unlocked=sub.unlocked,
                children=[]
            )
            for sub in sub_stages
            if sub.parent_stage_id == main.stage_id
        ]
        
        tree.append(ProgressionStageResponse(
            id=main.stage_id,
            label=main.label,
            unlocked=main.unlocked,
            children=children
        ))
    
    return tree

@router.get("/progression/{nickname}", response_model=List[ProgressionStageResponse])
async def get_user_progression(nickname: str, db: Session = Depends(get_db)):
    """Get user's progression stages"""
    # Get user
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's progression stages
    stages = db.query(UserProgressionStage).filter(
        UserProgressionStage.user_id == user.id
    ).all()
    
    # If user has no stages, initialize them
    if not stages:
        initialize_user_progression(db, user.id)
        stages = db.query(UserProgressionStage).filter(
            UserProgressionStage.user_id == user.id
        ).all()
    
    # Build and return progression tree
    return build_progression_tree(stages)

@router.post("/progression/{nickname}/unlock/{stage_id}")
async def unlock_stage(nickname: str, stage_id: str, db: Session = Depends(get_db)):
    """Unlock a progression stage for a user"""
    # Get user
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get stage
    stage = db.query(UserProgressionStage).filter(
        and_(
            UserProgressionStage.user_id == user.id,
            UserProgressionStage.stage_id == stage_id
        )
    ).first()
    
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Update stage
    stage.unlocked = True
    stage.updated_at = datetime.utcnow()
    
    # If this is a main stage, also unlock its first sub-stage
    if stage.stage_type == 'main':
        first_sub = db.query(UserProgressionStage).filter(
            and_(
                UserProgressionStage.user_id == user.id,
                UserProgressionStage.parent_stage_id == stage_id
            )
        ).first()
        if first_sub:
            first_sub.unlocked = True
            first_sub.updated_at = datetime.utcnow()
    
    # If this is a sub-stage, check if we should unlock the next stage
    elif stage.stage_type == 'sub':
        # Get all sub-stages for this main stage
        siblings = db.query(UserProgressionStage).filter(
            and_(
                UserProgressionStage.user_id == user.id,
                UserProgressionStage.parent_stage_id == stage.parent_stage_id
            )
        ).all()
        
        # If all sub-stages are unlocked, unlock the next main stage
        if all(s.unlocked for s in siblings):
            # Find the next main stage
            next_main = db.query(UserProgressionStage).filter(
                and_(
                    UserProgressionStage.user_id == user.id,
                    UserProgressionStage.stage_type == 'main',
                    UserProgressionStage.unlocked == False
                )
            ).first()
            
            if next_main:
                next_main.unlocked = True
                next_main.updated_at = datetime.utcnow()
                
                # Also unlock its first sub-stage
                first_sub = db.query(UserProgressionStage).filter(
                    and_(
                        UserProgressionStage.user_id == user.id,
                        UserProgressionStage.parent_stage_id == next_main.stage_id
                    )
                ).first()
                if first_sub:
                    first_sub.unlocked = True
                    first_sub.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Stage unlocked successfully"}

@router.post("/progression/{nickname}/reset")
async def reset_progression(nickname: str, db: Session = Depends(get_db)):
    """Reset user's progression stages to initial state"""
    # Get user
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete existing stages
    db.query(UserProgressionStage).filter(
        UserProgressionStage.user_id == user.id
    ).delete()
    
    # Initialize new stages
    initialize_user_progression(db, user.id)
    
    return {"message": "Progression reset successfully"}
