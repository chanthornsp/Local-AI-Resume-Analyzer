"""
Flask Application

Main application entry point for the CV Screening API.
Registers blueprints and initializes services.
"""
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from src.utils.config import Config
from src.database.db import init_db
from src.api import jobs_bp, candidates_bp, analysis_bp, export_bp


def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Initialize directories
    Config.init_app()
    
    # Initialize database
    init_db()
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(jobs_bp)
    app.register_blueprint(candidates_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(export_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        """Health check endpoint"""
        from src.services.ollama_client import OllamaClient
        
        ollama = OllamaClient()
        ollama_available = ollama.check_availability()
        
        return jsonify({
            'status': 'healthy',
            'services': {
                'api': 'running',
                'database': 'connected',
                'ollama': 'available' if ollama_available else 'unavailable'
            }
        }), 200
    
    # Status endpoint
    @app.route('/api/status', methods=['GET'])
    def status():
        """Get system status and statistics"""
        from src.services.job_service import JobService
        from src.services.ollama_client import OllamaClient
        
        jobs = JobService.get_all()
        ollama = OllamaClient()
        
        total_candidates = sum(job.get('total_candidates', 0) for job in jobs)
        total_analyzed = sum(job.get('excellent_count', 0) + 
                           job.get('good_count', 0) + 
                           job.get('average_count', 0) + 
                           job.get('below_average_count', 0) for job in jobs)
        
        return jsonify({
            'status': 'success',
            'data': {
                'total_jobs': len(jobs),
                'total_candidates': total_candidates,
                'total_analyzed': total_analyzed,
                'ollama': {
                    'available': ollama.check_availability(),
                    'host': ollama.host,
                    'model': ollama.model
                }
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """Handle HTTP exceptions"""
        return jsonify({
            'status': 'error',
            'message': e.description,
            'code': e.code
        }), e.code
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handle general exceptions"""
        app.logger.error(f"Unhandled exception: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An internal error occurred',
            'details': str(e) if app.debug else None
        }), 500
    
    return app


# Create app instance
app = create_app()


if __name__ == '__main__':
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
