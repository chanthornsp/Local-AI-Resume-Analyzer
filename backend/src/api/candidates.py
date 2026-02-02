"""
Candidates API Blueprint

Handles candidate-related endpoints:
- Upload CVs for a job
- Paste CV text for a job
- List candidates for a job
- Get candidate details
- Delete candidates
"""
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest
import os
import uuid
from pathlib import Path

from src.services.job_service import JobService
from src.services.candidate_service import CandidateService
from src.core.pdf_extractor import PDFExtractor
from src.utils.config import Config

bp = Blueprint('candidates', __name__, url_prefix='/api')


@bp.route('/jobs/<int:job_id>/candidates', methods=['GET'])
def list_candidates(job_id):
    """
    List all candidates for a job.
    
    Query params:
        category: Filter by category (excellent, good, average, below_average)
        status: Filter by status (pending, analyzed, error)
    
    Returns:
        JSON array of candidates
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        category = request.args.get('category')
        status = request.args.get('status')
        
        candidates = CandidateService.get_by_job(
            job_id=job_id,
            category=category,
            status=status
        )
        
        return jsonify({
            'status': 'success',
            'data': candidates,
            'count': len(candidates),
            'job': {
                'id': job['id'],
                'title': job['title'],
                'company': job['company']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/jobs/<int:job_id>/candidates/upload', methods=['POST'])
def upload_candidates(job_id):
    """
    Upload CV files for a job.
    
    Accepts multipart/form-data with files.
    Supports: PDF, PNG, JPG, JPEG
    
    Returns:
        JSON with upload results
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        # Check if files were uploaded
        if 'files' not in request.files:
            raise BadRequest('No files provided in request')
        
        files = request.files.getlist('files')
        
        if not files or len(files) == 0:
            raise BadRequest('No files selected')
        
        # Initialize extractor
        extractor = PDFExtractor(use_ocr=True)
        
        results = {
            'uploaded': 0,
            'failed': 0,
            'candidates': [],
            'errors': []
        }
        
        # Process each file
        for file in files:
            if file.filename == '':
                continue
            
            filename = secure_filename(file.filename)
            
            # Validate file extension
            file_ext = Path(filename).suffix.lower().lstrip('.')  # Remove leading dot
            if file_ext not in Config.ALLOWED_EXTENSIONS:
                results['errors'].append({
                    'filename': filename,
                    'error': f'Unsupported file type: .{file_ext}. Allowed: {", ".join(Config.ALLOWED_EXTENSIONS)}'
                })
                results['failed'] += 1
                continue
            
            try:
                # Save file PERMANENTLY with unique name
                file_ext = Path(filename).suffix
                unique_name = f"{uuid.uuid4().hex}{file_ext}"
                filepath = Config.UPLOAD_FOLDER / unique_name
                
                file.save(str(filepath))
                
                # Extract text
                cv_text = extractor.extract_text(str(filepath))
                
                # Create pending candidate
                candidate_id = CandidateService.create_pending(
                    job_id=job_id,
                    filename=filename,
                    cv_text=cv_text,
                    file_path=unique_name
                )
                
                results['uploaded'] += 1
                results['candidates'].append({
                    'id': candidate_id,
                    'filename': filename,
                    'status': 'pending'
                })
                
                # Do not delete file anymore!
                    
            except Exception as e:
                results['errors'].append({
                    'filename': filename,
                    'error': str(e)
                })
                results['failed'] += 1
                
                # Clean up temp file on error
                if filepath.exists():
                    filepath.unlink()
        
        status_code = 200 if results['uploaded'] > 0 else 400
        
        return jsonify({
            'status': 'success' if results['uploaded'] > 0 else 'error',
            'message': f"Uploaded {results['uploaded']} CVs, {results['failed']} failed",
            'data': results
        }), status_code
        
    except BadRequest as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/jobs/<int:job_id>/candidates/paste', methods=['POST'])
def paste_candidate_text(job_id):
    """
    Create a candidate from pasted CV text.
    
    Body (JSON):
        {
            "cv_text": "Full CV text..."
        }
    
    The candidate name will be extracted automatically by AI during analysis.
    
    Returns:
        JSON with created candidate
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('cv_text'):
            raise BadRequest('CV text is required')
        
        cv_text = data['cv_text'].strip()
        
        if len(cv_text) < 50:
            raise BadRequest('CV text too short (minimum 50 characters)')
        
        # Create pending candidate with pasted text
        # Use placeholder filename - will be updated after analysis
        filename = "pasted_cv.txt"
        
        candidate_id = CandidateService.create_pending(
            job_id=job_id,
            filename=filename,
            cv_text=cv_text
        )
        
        candidate = CandidateService.get_by_id(candidate_id)
        
        return jsonify({
            'status': 'success',
            'message': 'CV text added successfully. Analyze to extract candidate details.',
            'data': {
                'id': candidate_id,
                'filename': filename,
                'status': 'pending',
                'candidate': candidate
            }
        }), 201
        
    except BadRequest as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    """
    Get candidate details by ID.
    
    Returns:
        JSON with candidate details
    """
    try:
        candidate = CandidateService.get_by_id(candidate_id)
        
        if not candidate:
            return jsonify({
                'status': 'error',
                'message': f'Candidate {candidate_id} not found'
            }), 404
        
        # Get job info
        job = JobService.get_by_id(candidate['job_id'])
        
        return jsonify({
            'status': 'success',
            'data': {
                'candidate': candidate,
                'job': {
                    'id': job['id'],
                    'title': job['title'],
                    'company': job['company']
                } if job else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """
    Delete a candidate.
    
    Returns:
        JSON confirmation
    """
    try:
        # Check if candidate exists
        candidate = CandidateService.get_by_id(candidate_id)
        if not candidate:
            return jsonify({
                'status': 'error',
                'message': f'Candidate {candidate_id} not found'
            }), 404
        
        # Delete candidate
        CandidateService.delete(candidate_id)
        
        return jsonify({
            'status': 'success',
            'message': f'Candidate {candidate_id} deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/jobs/<int:job_id>/candidates/shortlist', methods=['GET'])
def get_shortlist(job_id):
    """
    Get shortlisted candidates for a job.
    
    Query params:
        min_score: Minimum score (default: 70)
    
    Returns:
        JSON with shortlisted candidates
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        min_score = request.args.get('min_score', 70, type=int)
        
        shortlist = CandidateService.get_shortlist(job_id, min_score=min_score)
        
        return jsonify({
            'status': 'success',
            'data': shortlist,
            'count': len(shortlist),
            'min_score': min_score,
            'job': {
                'id': job['id'],
                'title': job['title'],
                'company': job['company']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/candidates/<int:candidate_id>/cv', methods=['GET'])
def get_candidate_cv(candidate_id):
    """
    Get (view) the original PDF CV.
    """
    try:
        candidate = CandidateService.get_by_id(candidate_id)
        if not candidate or not candidate.get('file_path'):
            return jsonify({'status': 'error', 'message': 'CV file not found'}), 404
            
        path = Config.UPLOAD_FOLDER / candidate['file_path']
        if not path.exists():
            return jsonify({'status': 'error', 'message': 'File missing from storage'}), 404
            
        return send_file(
            path,
            mimetype='application/pdf',
            as_attachment=False, # View in browser
            download_name=candidate['original_filename']
        )
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
