from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from user_api import router as user_router
from game_api import router as game_router
from engagement_api_v2 import router as engagement_v2_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include database routers
app.include_router(user_router, prefix="/api/v1", tags=["users"])
app.include_router(game_router, prefix="/api/v1", tags=["game"])
app.include_router(engagement_v2_router, prefix="/api/v1", tags=["engagement"])

@app.get("/")
def read_root():
    return {"message": "LinguaQuest API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 