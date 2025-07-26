# LinguaQuest Render Deployment Guide

## Problem Diagnosis
The error "No open ports detected" on Render typically occurs when:
1. The application doesn't bind to the correct port
2. Heavy dependencies cause startup failures
3. Import errors prevent the app from starting

## Solutions Implemented

### 1. Port Binding Fix
- ✅ Added proper port configuration in `main.py`
- ✅ Created `start.py` script with robust error handling
- ✅ Updated health check endpoint to show port info

### 2. Startup Scripts
- **`start.py`**: Main startup script with fallback to minimal version
- **`minimal_main.py`**: Lightweight fallback without heavy ML models
- **`test_startup.py`**: Test script to verify imports work

### 3. Configuration Files
- **`render.yaml`**: Render service configuration
- **`requirements-minimal.txt`**: Minimal dependencies for fallback

## Deployment Options

### Option A: Full App (Recommended)
Use this if you have enough memory/resources:
```bash
# Render Build Command:
cd backend && pip install -r requirements.txt

# Render Start Command:
cd backend && python start.py
```

### Option B: Minimal App (Fallback)
Use this if the full app fails due to memory/dependency issues:
```bash
# Render Build Command:
cd backend && pip install -r requirements-minimal.txt

# Render Start Command:
cd backend && python minimal_main.py
```

### Option C: Direct uvicorn (Alternative)
```bash
# Render Start Command:
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
```

## Environment Variables
Set these in Render if needed:
- `PYTHON_VERSION`: 3.11.0
- `PORT`: (automatically set by Render)

## Testing Locally
Before deploying, test locally:
```bash
cd backend
python test_startup.py
python start.py
```

## Debugging on Render
The app now includes better logging:
- Port information in health check: `/health`
- Startup logs show port and host info
- Fallback mechanism logs which app version is running

## Next Steps
1. Deploy using Option A first
2. If it fails, try Option B (minimal)
3. Check the Render logs for specific error messages
4. Use the `/health` endpoint to verify the app is running

## Health Check URLs
- Local: http://localhost:8000/health
- Render: https://your-app-name.onrender.com/health
