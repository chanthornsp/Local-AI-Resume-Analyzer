import json
from pathlib import Path
from src.utils.config import Config

class SettingsService:
    """Service for managing application settings"""
    
    SETTINGS_FILE = Config.DATABASE_PATH.parent / 'settings.json'
    
    DEFAULT_SETTINGS = {
        'ollama_model': Config.OLLAMA_MODEL,
        'system_prompt': "",  # Empty means use default hardcoded prompt
        'temperature': 0.2
    }
    
    @classmethod
    def get_settings(cls):
        """Get current settings with defaults"""
        if not cls.SETTINGS_FILE.exists():
            return cls.DEFAULT_SETTINGS.copy()
        
        try:
            with open(cls.SETTINGS_FILE, 'r') as f:
                saved = json.load(f)
                # Merge with defaults to handle new keys
                return {**cls.DEFAULT_SETTINGS, **saved}
        except Exception:
            return cls.DEFAULT_SETTINGS.copy()
            
    @classmethod
    def save_settings(cls, updates: dict):
        """Update and save settings"""
        current = cls.get_settings()
        new_settings = {**current, **updates}
        
        # Ensure storage directory exists
        cls.SETTINGS_FILE.parent.mkdir(exist_ok=True)
        
        with open(cls.SETTINGS_FILE, 'w') as f:
            json.dump(new_settings, f, indent=2)
            
        return new_settings
