from flask import Blueprint, request, jsonify
from src.services.settings_service import SettingsService
from src.services.ollama_client import OllamaClient

bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@bp.route('', methods=['GET'])
def get_settings():
    """Get current settings and available models"""
    try:
        settings = SettingsService.get_settings()
        
        # Get available models from Ollama
        client = OllamaClient()
        available_models = client.get_models()
        
        return jsonify({
            'status': 'success',
            'data': {
                'settings': settings,
                'available_models': available_models,
                'ollama_connected': client.check_availability()
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@bp.route('', methods=['POST'])
def update_settings():
    """Update settings"""
    try:
        data = request.json
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
            
        updated = SettingsService.save_settings(data)
        
        return jsonify({
            'status': 'success',
            'message': 'Settings updated',
            'data': updated
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
