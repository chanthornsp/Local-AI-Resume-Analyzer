import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent

# Load .env file from backend directory
load_dotenv(BASE_DIR / '.env')

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # Server settings
    HOST = '0.0.0.0'
    PORT = int(os.getenv('PORT', 5000))
    
    # Database settings
    DATABASE_PATH = BASE_DIR / 'storage' / 'app.db'
    
    # File upload settings
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_FILE_SIZE', 50 * 1024 * 1024))  # 50MB default
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}  # Added image formats
    
    # Ollama settings
    OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3')
    OLLAMA_TIMEOUT = int(os.getenv('OLLAMA_TIMEOUT', 120))  # seconds
    
    # Analysis settings
    CATEGORY_THRESHOLDS = {
        'excellent': 85,
        'good': 70,
        'average': 50,
        'below_average': 0
    }
    
    @staticmethod
    def init_app():
        """Initialize application directories"""
        Config.UPLOAD_FOLDER.mkdir(exist_ok=True)
        Config.DATABASE_PATH.parent.mkdir(exist_ok=True)
