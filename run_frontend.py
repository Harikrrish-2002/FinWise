#!/usr/bin/env python3
"""
FinWise Frontend Development Server Runner

This script starts the React development server for the FinWise application.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js is installed: {version}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js is not installed")
    print("Please install Node.js from https://nodejs.org/")
    return False

def check_npm():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ npm is installed: {version}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ npm is not installed")
    return False

def install_dependencies(frontend_dir):
    """Install npm dependencies if node_modules doesn't exist"""
    node_modules = frontend_dir / 'node_modules'
    
    if not node_modules.exists():
        print("📦 Installing npm dependencies...")
        try:
            subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing dependencies: {e}")
            return False
    else:
        print("✅ Dependencies already installed")
    
    return True

def main():
    print("🚀 Starting FinWise Frontend Development Server...")
    
    # Check Node.js and npm
    if not check_node() or not check_npm():
        sys.exit(1)
    
    # Change to frontend directory
    frontend_dir = Path(__file__).parent / 'frontend'
    
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        sys.exit(1)
    
    # Install dependencies if needed
    if not install_dependencies(frontend_dir):
        sys.exit(1)
    
    print("🌐 Starting React development server...")
    print("📱 Application will open at http://localhost:3000")
    print("🔄 Hot reload is enabled - changes will be reflected automatically")
    print("🛑 Press Ctrl+C to stop the server\n")
    
    # Start the React development server
    try:
        subprocess.run(['npm', 'start'], cwd=frontend_dir, check=True)
    except KeyboardInterrupt:
        print("\n👋 Development server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting development server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

