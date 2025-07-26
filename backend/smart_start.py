#!/usr/bin/env python3
"""
Smart deployment script for Render - automatically chooses the best option
"""
import os
import sys
import uvicorn

# Try to import psutil for memory monitoring (optional)
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

def get_available_memory():
    """Get available memory in MB"""
    if HAS_PSUTIL:
        try:
            return psutil.virtual_memory().available / (1024 * 1024)
        except:
            pass
    
    # Fallback: assume Render free tier if PORT is set by Render
    if os.environ.get("PORT"):
        return 400  # Assume free tier with limited memory
    return 1000  # Local development assumption

def choose_app_version():
    """Choose the best app version based on available memory"""
    available_memory = get_available_memory()
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🔍 Available memory: ~{available_memory:.0f}MB")
    print(f"🚀 Starting on port {port}")
    
    # If we're on Render free tier (512MB limit) or low memory, use optimized
    if available_memory < 600:
        print("💾 Low memory detected - using optimized version")
        try:
            from optimized_main import app
            print("✅ Optimized app loaded")
            return app, "optimized"
        except Exception as e:
            print(f"❌ Optimized app failed: {e}")
    
    # Try full version if memory allows
    if available_memory >= 600:
        print("🧠 Sufficient memory - trying full version")
        try:
            from main import app
            print("✅ Full app loaded")
            return app, "full"
        except Exception as e:
            print(f"❌ Full app failed: {e}")
            print("🔄 Falling back to optimized...")
            try:
                from optimized_main import app
                print("✅ Optimized fallback loaded")
                return app, "optimized"
            except Exception as e2:
                print(f"❌ Optimized fallback failed: {e2}")
    
    # Last resort - minimal
    print("🆘 Using minimal fallback")
    try:
        from minimal_main import app
        print("✅ Minimal app loaded")
        return app, "minimal"
    except Exception as e:
        print(f"❌ All versions failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    app, version = choose_app_version()
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🎯 Running {version} version on port {port}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        workers=1,
        log_level="info"
    )
