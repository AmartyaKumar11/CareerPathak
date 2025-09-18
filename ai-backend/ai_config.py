"""
AI Configuration for Psychometric Question Generation
Manages different AI providers and their settings
"""

import os
from enum import Enum
from typing import Optional, Dict, Any

class AIProvider(Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    LOCAL = "local"
    FALLBACK = "fallback"

class AIConfig:
    """Configuration class for AI providers"""
    
    def __init__(self):
        self.providers = {
            AIProvider.OPENAI: {
                "enabled": bool(os.getenv("OPENAI_API_KEY")),
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": "gpt-3.5-turbo",
                "max_tokens": 400,
                "temperature": 0.7,
                "cost_per_1k_tokens": 0.002,  # USD
                "priority": 2  # Make OpenAI secondary
            },
            AIProvider.GEMINI: {
                "enabled": bool(os.getenv("GOOGLE_API_KEY")),
                "api_key": os.getenv("GOOGLE_API_KEY"),
                "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),  # Lightweight model
                "max_tokens": int(os.getenv("GEMINI_MAX_TOKENS", "300")),
                "temperature": float(os.getenv("GEMINI_TEMPERATURE", "0.7")),
                "cost_per_1k_tokens": 0.0,  # Free tier for students
                "priority": 1,  # Make Gemini primary
                "response_time": "fast"  # Flash model is optimized for speed
            },
            AIProvider.LOCAL: {
                "enabled": False,  # Not implemented yet
                "model": "llama2",
                "priority": 3
            },
            AIProvider.FALLBACK: {
                "enabled": True,
                "priority": 4
            }
        }
        
        # Sort providers by priority
        self.enabled_providers = [
            provider for provider, config in self.providers.items()
            if config["enabled"]
        ]
        self.enabled_providers.sort(key=lambda p: self.providers[p]["priority"])
    
    def get_provider_config(self, provider: AIProvider) -> Dict[str, Any]:
        """Get configuration for a specific provider"""
        return self.providers.get(provider, {})
    
    def is_provider_enabled(self, provider: AIProvider) -> bool:
        """Check if a provider is enabled"""
        return self.providers.get(provider, {}).get("enabled", False)
    
    def get_primary_provider(self) -> AIProvider:
        """Get the primary (highest priority) enabled provider"""
        return self.enabled_providers[0] if self.enabled_providers else AIProvider.FALLBACK
    
    def get_fallback_provider(self) -> AIProvider:
        """Get the fallback provider"""
        return AIProvider.FALLBACK
    
    def estimate_cost(self, provider: AIProvider, num_questions: int) -> float:
        """Estimate cost for generating questions"""
        config = self.get_provider_config(provider)
        if not config:
            return 0.0
        
        # Rough estimate: ~200 tokens per question
        tokens_per_question = 200
        total_tokens = num_questions * tokens_per_question
        cost_per_1k = config.get("cost_per_1k_tokens", 0.0)
        
        return (total_tokens / 1000) * cost_per_1k
    
    def get_status_report(self) -> Dict[str, Any]:
        """Get status report of all providers"""
        report = {
            "primary_provider": self.get_primary_provider().value,
            "enabled_providers": [p.value for p in self.enabled_providers],
            "provider_status": {}
        }
        
        for provider, config in self.providers.items():
            status = {
                "enabled": config["enabled"],
                "priority": config["priority"]
            }
            
            if provider == AIProvider.OPENAI:
                status["api_key_configured"] = bool(config["api_key"])
                status["model"] = config["model"]
            elif provider == AIProvider.GEMINI:
                status["api_key_configured"] = bool(config["api_key"])
                status["model"] = config["model"]
            elif provider == AIProvider.LOCAL:
                status["implementation"] = "Not implemented"
            
            report["provider_status"][provider.value] = status
        
        return report

# Global configuration instance
ai_config = AIConfig()

# Utility functions
def get_ai_config() -> AIConfig:
    """Get the global AI configuration"""
    return ai_config

def is_ai_available() -> bool:
    """Check if any AI provider is available"""
    return len(ai_config.enabled_providers) > 0

def get_recommended_setup() -> Dict[str, str]:
    """Get recommended setup instructions"""
    setup = {}
    
    if not ai_config.is_provider_enabled(AIProvider.OPENAI):
        setup["openai"] = (
            "Get OpenAI API key from https://platform.openai.com/api-keys\n"
            "Set environment variable: OPENAI_API_KEY=your_key_here"
        )
    
    if not ai_config.is_provider_enabled(AIProvider.GEMINI):
        setup["gemini"] = (
            "Get Google API key from https://makersuite.google.com/app/apikey\n"
            "Set environment variable: GOOGLE_API_KEY=your_key_here"
        )
    
    if not setup:
        setup["status"] = "All available AI providers are configured!"
    
    return setup