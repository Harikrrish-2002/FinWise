#!/usr/bin/env python3
"""
FinWise Backend Server Runner

This script starts the Flask backend server for the FinWise application.
Make sure MongoDB is running before starting the server.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_mongodb():
    """Check if MongoDB is running"""
    try:
        import pymongo
        client = pymongo.MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
        client.server_info()
        print("✅ MongoDB is running")
        return True
    except Exception as e:
        print(f"❌ MongoDB is not running: {e}")
        print("Please start MongoDB before running the backend server")
        return False

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import flask
        import pymongo
        import jwt
        import werkzeug
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r backend/requirements.txt")
        return False

def main():
    print("🚀 Starting FinWise Backend Server...")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check MongoDB
    if not check_mongodb():
        sys.exit(1)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / 'backend'
    os.chdir(backend_dir)
    
    # Create uploads directory if it doesn't exist
    uploads_dir = backend_dir / 'uploads'
    uploads_dir.mkdir(exist_ok=True)
    
    print("📁 Created uploads directory")
    print("🌐 Starting Flask server on http://localhost:5000")
    print("📊 API documentation available at http://localhost:5000/api")
    print("🛑 Press Ctrl+C to stop the server\n")
    
    # Start the Flask server
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
