import os

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # Ollama settings
    OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://127.0.0.1:11434')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3')
    
    # Upload settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)) # 16MB default
    ALLOWED_EXTENSIONS = {'pdf'}
    
    # Screening settings
    MIN_SHORTLIST_SCORE = int(os.getenv('MIN_SHORTLIST_SCORE', 70))
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', 50))
