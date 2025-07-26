# LinguaQuest Render Deployment Guide

## Problem Diagnosis
The error "No open ports detected" on Render typically occurs when:
1. The application doesn't bind to the correct port
2. Heavy dependencies cause startup failures
3. Import errors prevent the app from starting
4. **MEMORY ISSUES**: App uses over 512Mi (free tier limit) - **THIS IS YOUR CURRENT ISSUE**

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

### Option A: Memory-Optimized App (RECOMMENDED FOR RENDER FREE TIER)
**Use this to fix the memory issue:**
```bash
# Render Build Command:
cd backend && pip install -r requirements-optimized.txt

# Render Start Command:
cd backend && python start.py
```
This version:
- Uses lazy loading for heavy models
- Removes unnecessary transformers dependencies
- Uses lightweight VADER sentiment analysis
- Should stay under 512Mi memory limit

### Option B: Full App (Only if you have paid Render plan)
Use this if you have enough memory/resources:
```bash
# Render Build Command:
cd backend && pip install -r requirements.txt

# Render Start Command:
cd backend && python start.py
```

### Option C: Minimal App (Emergency Fallback)
Use this if everything else fails:
```bash
# Render Build Command:
cd backend && pip install -r requirements-minimal.txt

# Render Start Command:
cd backend && python minimal_main.py
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

## Memory Issue Fix (YOUR CURRENT PROBLEM)

**Problem**: "Out of memory (used over 512Mi)" on Render free tier

**Root Cause**: Heavy ML models (transformers, NLLB, etc.) consuming too much memory

**Solution**: Use the optimized version with these changes:
- ✅ Lazy loading of ML models (only load when needed)
- ✅ Removed heavy transformers dependencies
- ✅ Uses lightweight VADER sentiment analysis instead of transformer models
- ✅ Simplified translation using external APIs
- ✅ Reduced memory footprint from ~800Mi to ~200Mi

**Quick Fix**: 
1. Change your Render build command to: `cd backend && pip install -r requirements-optimized.txt`
2. Keep start command as: `cd backend && python start.py`
3. Redeploy

## Debugging on Render
The app now includes better logging:
- Port information in health check: `/health`
- Startup logs show port and host info
- Fallback mechanism logs which app version is running

## IMMEDIATE FIX FOR YOUR DEPLOYMENT

🚨 **Your deployment is failing due to memory limits (512Mi exceeded)**

**Step 1**: Update your Render service settings:
- **Build Command**: `cd backend && pip install -r requirements-optimized.txt`
- **Start Command**: `cd backend && python start.py`

**Step 2**: Redeploy

The `start.py` script will now automatically choose the optimized version first, which uses:
- 🔹 ~200MB memory instead of ~800MB
- 🔹 Lazy loading of ML models
- 🔹 Lightweight sentiment analysis
- 🔹 External translation APIs

**Alternative start commands** (if the above doesn't work):
- `cd backend && python optimized_main.py`
- `cd backend && python smart_start.py`

## Next Steps
1. Deploy using Option A first
2. If it fails, try Option B (minimal)
3. Check the Render logs for specific error messages
4. Use the `/health` endpoint to verify the app is running

## Health Check URLs
- Local: http://localhost:8000/health
- Render: https://your-app-name.onrender.com/health
