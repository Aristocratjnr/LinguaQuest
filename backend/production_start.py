#!/usr/bin/env python3
"""
Production startup script for LinguaQuest API with auto-restart
This script ensures the server stays alive in production
"""
import os
import sys
import time
import subprocess
import signal
from datetime import datetime

def log_message(message):
    """Log with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def start_server():
    """Start the FastAPI server"""
    try:
        log_message("🚀 Starting LinguaQuest API server...")
        
        # Import and run the optimized main
        import optimized_main
        
        # This should not return unless there's an error
        return True
        
    except KeyboardInterrupt:
        log_message("📢 Received shutdown signal")
        return False
    except Exception as e:
        log_message(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
        return True  # Return True to attempt restart

def main():
    """Main function with restart logic"""
    restart_count = 0
    max_restarts = 10
    
    log_message("🌟 LinguaQuest Production Startup Script")
    log_message(f"📍 Working directory: {os.getcwd()}")
    log_message(f"🐍 Python version: {sys.version}")
    
    while restart_count < max_restarts:
        try:
            if restart_count > 0:
                log_message(f"🔄 Restart attempt {restart_count}/{max_restarts}")
                time.sleep(5)  # Wait before restart
            
            should_restart = start_server()
            
            if not should_restart:
                log_message("🛑 Server shutdown requested - exiting")
                break
                
            restart_count += 1
            log_message(f"⚠️ Server stopped unexpectedly (restart {restart_count})")
            
        except KeyboardInterrupt:
            log_message("📢 Manual shutdown requested")
            break
        except Exception as e:
            restart_count += 1
            log_message(f"❌ Critical error: {e}")
            if restart_count >= max_restarts:
                log_message(f"🚨 Max restarts ({max_restarts}) reached - giving up")
                break
    
    log_message("🔚 Production startup script ended")

if __name__ == "__main__":
    main()
