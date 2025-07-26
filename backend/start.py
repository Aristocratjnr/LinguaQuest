#!/usr/bin/env python3
"""
Startup script for LinguaQuest FastAPI application on Render
"""
import os
import sys
import uvicorn

def start_app():
    """Start the LinguaQuest API"""
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting LinguaQuest API on port {port}")
    print(f"📍 Host: 0.0.0.0")
    print(f"🐍 Python version: {sys.version}")
    print(f"📦 Working directory: {os.getcwd()}")
    
    try:
        # Try to import the main app first
        from main import app
        print("✅ Main app imported successfully")
        
        # Run the application
        uvicorn.run(
            app,  # Use the app instance directly
            host="0.0.0.0",
            port=port,
            workers=1,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"❌ Failed to start main app: {e}")
        print("🔄 Trying minimal fallback...")
        
        try:
            from minimal_main import app as minimal_app
            print("✅ Minimal app imported successfully")
            
            uvicorn.run(
                minimal_app,
                host="0.0.0.0",
                port=port,
                workers=1,
                log_level="info",
                access_log=True
            )
        except Exception as e2:
            print(f"❌ Failed to start minimal app: {e2}")
            sys.exit(1)

if __name__ == "__main__":
    start_app()
