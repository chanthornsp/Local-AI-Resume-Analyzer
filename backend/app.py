from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv

from src.services.batch_processor import BatchProcessor
from src.services.cv_screener import CVScreener
from src.utils.config import Config

load_dotenv()

app = Flask(__name__)
# Allow both standard Vite and custom ports
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
app.config.from_object(Config)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@app.route('/api/status', methods=['GET'])
def status_check():
    """Check Ollama connection"""
    from src.services.ollama_client import OllamaClient
    client = OllamaClient()

    try:
        is_available = client.check_availability()
        return jsonify({
            'status': 'ok' if is_available else 'error',
            'ollama_available': is_available,
            'model': os.getenv('OLLAMA_MODEL', 'llama3')
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/screen', methods=['POST'])
def screen_candidates():
    """Screen batch of CVs against job requirements"""
    try:
        files = request.files.getlist('cv_files')
        job_title = request.form.get('job_title')
        job_description = request.form.get('job_description')
        # Handle multiple requirements via form data list
        job_requirements = request.form.getlist('job_requirements')
        # Fallback if passed as JSON string or single field
        if not job_requirements and request.form.get('job_requirements'):
             job_requirements = [request.form.get('job_requirements')]
             
        company_name = request.form.get('company_name')

        if not all([files, job_title, job_description, company_name]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Save files temporarily
        file_paths = []
        for file in files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            file_paths.append(filepath)

        try:
            # Process batch
            processor = BatchProcessor()
            results = processor.process_batch(
                file_paths=file_paths,
                job_title=job_title,
                job_description=job_description,
                job_requirements=job_requirements,
                company_name=company_name
            )

            return jsonify({
                'status': 'success',
                'data': results
            })
        finally:
            # Cleanup temp files
            for fp in file_paths:
                if os.path.exists(fp):
                    os.remove(fp)

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/applications/<job_id>', methods=['GET'])
def get_applications(job_id):
    """Get saved applications for a job"""
    # Implementation for retrieving stored results
    pass

@app.route('/api/export/<job_id>', methods=['GET'])
def export_results(job_id):
    """Export results as CSV/Excel"""
    format_type = request.args.get('format', 'csv')
    # Implementation for export
    pass

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
