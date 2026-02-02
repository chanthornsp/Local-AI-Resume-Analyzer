"""
Ollama Client

Handles communication with Ollama LLM server.
Includes retry logic and error handling.
"""
import requests
import os
import time
from typing import Optional


class OllamaClient:
    """Client for interacting with Ollama API"""

    def __init__(self, host: Optional[str] = None, model: Optional[str] = None, timeout: Optional[int] = None):
        """
        Initialize Ollama client.
        
        Args:
            host: Ollama server URL (default: from env or localhost:11434)
            model: Model name (default: from settings -> env -> llama3)
            timeout: Request timeout in seconds (default: from env or 120)
        """
        # Try to load dynamic settings if model is not explicit
        settings_model = None
        try:
            from src.services.settings_service import SettingsService
            settings = SettingsService.get_settings()
            settings_model = settings.get('ollama_model')
        except Exception:
            pass # Fallback to env/default

        self.host = host or os.getenv('OLLAMA_HOST', 'http://localhost:11434')
        self.model = model or settings_model or os.getenv('OLLAMA_MODEL', 'llama3')
        self.timeout = timeout or int(os.getenv('OLLAMA_TIMEOUT', 120))
        self.generate_url = f"{self.host}/api/generate"
        self.tags_url = f"{self.host}/api/tags"
        self.max_retries = 3
        
        print(f"  🤖 OllamaClient initialized with model: {self.model}")

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate completion from Ollama with retry logic.
        
        Args:
            prompt: Input prompt text
            **kwargs: Additional options (temperature, top_p, num_predict)
        
        Returns:
            Generated text response
            
        Raises:
            ConnectionError: If unable to connect to Ollama
            TimeoutError: If request times out
        """
        payload = {
            'model': self.model,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': kwargs.get('temperature', 0.3),
                'top_p': kwargs.get('top_p', 0.9),
                'num_predict': kwargs.get('num_predict', 2000)
            }
        }

        last_error = None
        
        for attempt in range(1, self.max_retries + 1):
            try:
                response = requests.post(
                    self.generate_url,
                    json=payload,
                    timeout=self.timeout
                )
                response.raise_for_status()
                result = response.json().get('response', '')
                
                if not result:
                    raise ValueError("Empty response from Ollama")
                
                return result
                
            except requests.exceptions.Timeout as e:
                last_error = f"Request timed out after {self.timeout}s"
                if attempt < self.max_retries:
                    wait_time = attempt * 2
                    print(f"  ⏱️  Timeout, retrying in {wait_time}s... (attempt {attempt}/{self.max_retries})")
                    time.sleep(wait_time)
                    
            except requests.exceptions.ConnectionError as e:
                last_error = f"Cannot connect to Ollama at {self.host}"
                if attempt < self.max_retries:
                    wait_time = attempt * 2
                    print(f"  🔄 Connection failed, retrying in {wait_time}s... (attempt {attempt}/{self.max_retries})")
                    time.sleep(wait_time)
                    
            except requests.exceptions.RequestException as e:
                last_error = str(e)
                if attempt < self.max_retries:
                    wait_time = attempt
                    print(f"  ⚠️  Request failed, retrying in {wait_time}s... (attempt {attempt}/{self.max_retries})")
                    time.sleep(wait_time)
        
        # All retries failed
        raise ConnectionError(
            f"Failed to generate completion after {self.max_retries} attempts. "
            f"Last error: {last_error}. "
            f"Please ensure Ollama is running: ollama serve"
        )

    def check_availability(self) -> bool:
        """
        Check if Ollama server is available and responsive.
        
        Returns:
            bool: True if Ollama is available, False otherwise
        """
        try:
            response = requests.get(self.tags_url, timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_models(self) -> list:
        """
        Get list of available models.
        
        Returns:
            List of model names
        """
        try:
            response = requests.get(self.tags_url, timeout=5)
            response.raise_for_status()
            models_data = response.json().get('models', [])
            return [model.get('name') for model in models_data]
        except:
            return []
    
    def check_model_available(self, model_name: Optional[str] = None) -> bool:
        """
        Check if a specific model is available.
        
        Args:
            model_name: Model name to check (default: self.model)
            
        Returns:
            bool: True if model is available
        """
        model_to_check = model_name or self.model
        available_models = self.get_models()
        return model_to_check in available_models
