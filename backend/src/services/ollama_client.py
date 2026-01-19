import requests
import os
from typing import Optional

class OllamaClient:
    """Client for interacting with Ollama API"""

    def __init__(self, host: Optional[str] = None, model: Optional[str] = None):
        self.host = host or os.getenv('OLLAMA_HOST', 'http://localhost:11434')
        self.model = model or os.getenv('OLLAMA_MODEL', 'llama3')
        self.generate_url = f"{self.host}/api/generate"
        self.tags_url = f"{self.host}/api/tags"

    def generate(self, prompt: str, **kwargs) -> str:
        """Generate completion from Ollama"""
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

        try:
            response = requests.post(
                self.generate_url,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            return response.json().get('response', '')
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Failed to connect to Ollama: {str(e)}")

    def check_availability(self) -> bool:
        """Check if Ollama is available"""
        try:
            response = requests.get(self.tags_url, timeout=5)
            return response.status_code == 200
        except:
            return False
