#!/usr/bin/env python3
"""
Setup script for CareerPathak AI Backend
Installs dependencies and configures the environment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    # Upgrade pip first
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip")
    
    # Install requirements
    if os.path.exists("requirements.txt"):
        run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing requirements")
    else:
        print("❌ requirements.txt not found")
        return False
    
    return True

def setup_environment():
    """Set up environment configuration"""
    env_example = Path(".env.example")
    env_file = Path(".env")
    
    if env_example.exists() and not env_file.exists():
        print("📝 Creating .env file from template...")
        with open(env_example, 'r') as src, open(env_file, 'w') as dst:
            content = src.read()
            dst.write(content)
        print("✅ .env file created. Please update it with your API keys.")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("⚠️  No .env.example found, creating basic .env file...")
        with open(env_file, 'w') as f:
            f.write("OPENAI_API_KEY=your_openai_api_key_here\n")
            f.write("MONGODB_URI=mongodb+srv://Amartya:Amartya@main-cluster.qybneng.mongodb.net/\n")
            f.write("DEBUG=True\n")

def test_imports():
    """Test if all required packages can be imported"""
    print("🧪 Testing package imports...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'sklearn',
        'numpy',
        'pymongo',
        'openai'
    ]
    
    failed_imports = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"❌ Failed to import: {', '.join(failed_imports)}")
        return False
    
    print("✅ All packages imported successfully")
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        "logs",
        "data",
        "models",
        "temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"📁 Created directory: {directory}")

def main():
    """Main setup function"""
    print("🚀 Setting up CareerPathak AI Backend...")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Test imports
    if not test_imports():
        print("❌ Package import test failed")
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    # Create directories
    create_directories()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update .env file with your API keys")
    print("2. Run: python main.py")
    print("3. Test the API at: http://localhost:8000/docs")
    print("\n🔑 Required API Keys:")
    print("- OpenAI API Key: https://platform.openai.com/api-keys")
    print("- MongoDB URI: Already configured for development")

if __name__ == "__main__":
    main()