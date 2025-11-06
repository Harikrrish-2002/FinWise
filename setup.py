#!/usr/bin/env python3
"""
FinWise Setup Script

This script helps set up the FinWise application by installing dependencies
and configuring the development environment.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_header():
    """Print setup header"""
    print("=" * 60)
    print("🏦 FinWise - Personal Finance Management System")
    print("=" * 60)
    print("Setting up your development environment...\n")

def check_python():
    """Check Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is supported")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not supported")
        print("Please install Python 3.8 or higher")
        return False

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

def check_mongodb():
    """Check if MongoDB is available"""
    try:
        result = subprocess.run(['mongod', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ MongoDB is installed")
            return True
    except FileNotFoundError:
        pass
    
    print("⚠️  MongoDB is not installed or not in PATH")
    print("Please install MongoDB from https://www.mongodb.com/try/download/community")
    return False

def setup_backend():
    """Set up backend dependencies"""
    print("\n📦 Setting up backend...")
    
    backend_dir = Path(__file__).parent / 'backend'
    
    # Create virtual environment
    venv_dir = backend_dir / 'venv'
    if not venv_dir.exists():
        print("Creating Python virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', str(venv_dir)], check=True)
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment already exists")
    
    # Determine activation script path
    if platform.system() == 'Windows':
        activate_script = venv_dir / 'Scripts' / 'activate.bat'
        pip_path = venv_dir / 'Scripts' / 'pip.exe'
    else:
        activate_script = venv_dir / 'bin' / 'activate'
        pip_path = venv_dir / 'bin' / 'pip'
    
    # Install requirements
    requirements_file = backend_dir / 'requirements.txt'
    if requirements_file.exists():
        print("Installing Python dependencies...")
        subprocess.run([str(pip_path), 'install', '-r', str(requirements_file)], check=True)
        print("✅ Backend dependencies installed")
    
    # Create uploads directory
    uploads_dir = backend_dir / 'uploads'
    uploads_dir.mkdir(exist_ok=True)
    print("✅ Uploads directory created")
    
    return str(activate_script)

def setup_frontend():
    """Set up frontend dependencies"""
    print("\n📦 Setting up frontend...")
    
    frontend_dir = Path(__file__).parent / 'frontend'
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install npm dependencies
    package_json = frontend_dir / 'package.json'
    if package_json.exists():
        print("Installing npm dependencies...")
        subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
        print("✅ Frontend dependencies installed")
    
    return True

def check_tesseract():
    """Check if Tesseract OCR is installed"""
    try:
        result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Tesseract OCR is installed")
            return True
    except FileNotFoundError:
        pass
    
    print("⚠️  Tesseract OCR is not installed")
    system = platform.system()
    
    if system == 'Windows':
        print("Install from: https://github.com/UB-Mannheim/tesseract/wiki")
    elif system == 'Darwin':  # macOS
        print("Install with: brew install tesseract")
    else:  # Linux
        print("Install with: sudo apt-get install tesseract-ocr")
    
    return False

def print_next_steps(activate_script):
    """Print next steps for the user"""
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    print("=" * 60)
    
    print("\n📋 Next steps:")
    print("1. Start MongoDB service")
    
    if platform.system() == 'Windows':
        print("2. Activate virtual environment:")
        print(f"   {activate_script}")
    else:
        print("2. Activate virtual environment:")
        print(f"   source {activate_script}")
    
    print("3. Start the backend server:")
    print("   python run_backend.py")
    
    print("4. In a new terminal, start the frontend:")
    print("   python run_frontend.py")
    
    print("\n🌐 Application URLs:")
    print("   Frontend: http://localhost:3000")
    print("   Backend:  http://localhost:5000")
    
    print("\n📚 Documentation:")
    print("   See README.md for detailed usage instructions")

def main():
    """Main setup function"""
    print_header()
    
    # Check prerequisites
    if not check_python():
        sys.exit(1)
    
    if not check_node():
        sys.exit(1)
    
    check_mongodb()  # Warning only
    check_tesseract()  # Warning only
    
    try:
        # Setup backend
        activate_script = setup_backend()
        
        # Setup frontend
        setup_frontend()
        
        # Print next steps
        print_next_steps(activate_script)
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)

if __name__ == '__main__':
    main()

