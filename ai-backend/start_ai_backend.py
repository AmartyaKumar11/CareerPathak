#!/usr/bin/env python3
"""
Startup script for CareerPathak AI Backend
Tests configuration and starts the server
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_environment():
    """Check if environment is properly configured"""
    print("🔍 Checking environment configuration...")
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        print("📝 Creating .env file with your Gemini API key...")
        
        env_content = """# AI Backend Environment Configuration

# Google Gemini API (Primary AI provider)
GOOGLE_API_KEY=AIzaSyAzYv5Kn-OORcNq3himP_SRMKDoJISwrJ4

# MongoDB Configuration
MONGODB_URI=mongodb+srv://Amartya:Amartya@main-cluster.qybneng.mongodb.net/

# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Gemini Model Configuration
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=300
"""
        
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ .env file created with Gemini API key")
    else:
        print("✅ .env file found")
    
    # Check Python packages
    required_packages = [
        "fastapi",
        "uvicorn", 
        "google-generativeai",
        "pydantic",
        "pymongo"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        subprocess.run([sys.executable, "-m", "pip", "install"] + missing_packages)
        print("✅ Packages installed")
    
    return True

def test_gemini_connection():
    """Test Gemini API connection"""
    print("\n🤖 Testing Gemini AI connection...")
    
    try:
        import google.generativeai as genai
        
        # Configure with API key
        api_key = "AIzaSyAzYv5Kn-OORcNq3himP_SRMKDoJISwrJ4"
        genai.configure(api_key=api_key)
        
        # Test with a simple prompt
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say 'Hello from Gemini!' in JSON format: {\"message\": \"...\"}")
        
        print("✅ Gemini AI connection successful!")
        print(f"📝 Test response: {response.text[:100]}...")
        return True
        
    except Exception as e:
        print(f"❌ Gemini connection failed: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting AI Backend server...")
    
    try:
        # Start uvicorn server
        os.system("python main.py")
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")

def test_endpoints():
    """Test API endpoints after server starts"""
    print("\n🧪 Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            health_data = response.json()
            print(f"   Primary AI Provider: {health_data.get('primary_provider')}")
            print(f"   Available Providers: {health_data.get('ai_providers_available')}")
        else:
            print("❌ Health check failed")
            
        # Test Gemini generation
        response = requests.post(f"{base_url}/test-gemini", timeout=10)
        if response.status_code == 200:
            test_data = response.json()
            if test_data.get("success"):
                print("✅ Gemini AI test passed")
                print(f"   Model: {test_data.get('model_used')}")
                print(f"   Sample question generated successfully")
            else:
                print("❌ Gemini AI test failed")
                print(f"   Error: {test_data.get('message')}")
        else:
            print("❌ Gemini test endpoint failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not connect to server: {e}")
        print("💡 Make sure the server is running on http://localhost:8000")

def main():
    """Main startup function"""
    print("🧠 CareerPathak AI Backend Startup")
    print("=" * 40)
    
    # Check environment
    if not check_environment():
        print("❌ Environment check failed")
        return
    
    # Test Gemini connection
    if not test_gemini_connection():
        print("❌ Gemini connection test failed")
        print("💡 Check your API key and internet connection")
        return
    
    print("\n✅ All checks passed! Starting server...")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🧪 Test Gemini: http://localhost:8000/test-gemini")
    print("\n⏹️  Press Ctrl+C to stop the server")
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()