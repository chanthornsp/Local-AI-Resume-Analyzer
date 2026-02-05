"""
Analysis API Blueprint

Handles CV analysis endpoints:
- Start/resume analysis for a job
- Get analysis progress/status
"""
from flask import Blueprint, request, jsonify
from src.services.job_service import JobService
from src.services.candidate_service import CandidateService
from src.services.cv_analyzer import CVAnalyzer

bp = Blueprint('analysis', __name__, url_prefix='/api')

# Track active analysis jobs in memory
# This prevents "stuck" in_progress states if the server restarts or requests fail
ACTIVE_ANALYSES = set()


@bp.route('/jobs/<int:job_id>/analyze', methods=['POST'])
def start_analysis(job_id):
    """
    Start or resume CV analysis for a job.
    
    print(f"⚡ Received request to analyze job {job_id}", flush=True)  # Added explicit log

    This will analyze all pending candidates for the job.
    
    Returns:
        JSON with analysis results
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        # Check if there are pending candidates
        pending = CandidateService.get_pending(job_id)
        if not pending:
            print(f"⚠️ Job {job_id} has no pending candidates to analyze", flush=True)  # Added log
            return jsonify({
                'status': 'success',
                'message': 'No pending candidates to analyze',
                'data': {
                    'job_id': job_id,
                    'pending': 0,
                    'analyzed': 0
                }
            }), 200
        
        # Initialize analyzer and start batch analysis
        analyzer = CVAnalyzer()
        
        try:
            # Mark job as active
            ACTIVE_ANALYSES.add(job_id)
            
            result = analyzer.analyze_batch(job_id)
            
            return jsonify({
                'status': 'success',
                'message': f"Analysis complete: {result['analyzed']} analyzed, {result['errors']} errors",
                'data': result
            }), 200
            
        except ConnectionError as e:
            # Ollama connection error
            return jsonify({
                'status': 'error',
                'message': 'Cannot connect to Ollama LLM service',
                'details': str(e),
                'hint': 'Please ensure Ollama is running: ollama serve'
            }), 503  # Service Unavailable
            
        finally:
            # Always remove from active set when done (success or error)
            ACTIVE_ANALYSES.discard(job_id)
            
    except Exception as e:
        ACTIVE_ANALYSES.discard(job_id)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/jobs/<int:job_id>/analyze/status', methods=['GET'])
def get_analysis_status(job_id):
    """
    Get analysis progress/status for a job.
    
    Returns:
        JSON with analysis statistics
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        # Get statistics
        stats = JobService.get_stats(job_id)
        
        # Calculate progress percentage
        total = stats.get('total_candidates', 0)
        analyzed = stats.get('analyzed', 0)
        pending = stats.get('pending', 0)
        errors = stats.get('errors', 0)
        
        progress_percentage = (analyzed / total * 100) if total > 0 else 0
        
        # Determine status - FIXED LOGIC WITH ACTIVE TRACKING:
        if total == 0:
            analysis_status = 'no_candidates'
        elif pending == 0:
            # All candidates processed
            analysis_status = 'complete'
        elif job_id in ACTIVE_ANALYSES:
            # Actively running in this server process
            analysis_status = 'in_progress'
        else:
            # Has pending items but NOT running (e.g. paused, crashed, or waiting)
            # This allows the UI to enable the "Analyze" button so user can resume
            analysis_status = 'pending'
        
        return jsonify({
            'status': 'success',
            'data': {
                'job_id': job_id,
                'job_title': job['title'],
                'analysis_status': analysis_status,
                'progress_percentage': round(progress_percentage, 1),
                'total_candidates': total,
                'analyzed': analyzed,
                'pending': pending,
                'errors': errors,
                'categories': {
                    'excellent': stats.get('excellent', 0),
                    'good': stats.get('good', 0),
                    'average': stats.get('average', 0),
                    'below_average': stats.get('below_average', 0)
                },
                'average_score': stats.get('avg_score')
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/jobs/<int:job_id>/analyze/retry', methods=['POST'])
def retry_failed_analysis(job_id):
    """
    Retry analysis for failed candidates.
    
    Body (JSON - optional):
        {
            "candidate_ids": [1, 2, 3]  // Specific candidates to retry
        }
    
    Returns:
        JSON with retry results
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        data = request.get_json() or {}
        candidate_ids = data.get('candidate_ids', [])
        
        # If specific candidates specified, reset their status
        if candidate_ids:
            for cid in candidate_ids:
                candidate = CandidateService.get_by_id(cid)
                if candidate and candidate['job_id'] == job_id and candidate['status'] == 'error':
                    # Reset to pending for retry
                    from src.database.db import get_db
                    with get_db() as conn:
                        conn.execute(
                            'UPDATE candidates SET status = ?, error_message = NULL WHERE id = ?',
                            ('pending', cid)
                        )
        
        # Now analyze pending (including retried ones)
        analyzer = CVAnalyzer()
        result = analyzer.analyze_batch(job_id)
        
        return jsonify({
            'status': 'success',
            'message': f"Retry complete: {result['analyzed']} analyzed, {result['errors']} errors",
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/candidates/<int:candidate_id>/analyze', methods=['POST'])
def analyze_single_candidate(candidate_id):
    """
    Force re-analysis of a single candidate.
    
    Returns:
        JSON with new analysis results
    """
    try:
        # Get candidate
        candidate = CandidateService.get_by_id(candidate_id)
        if not candidate:
            return jsonify({
                'status': 'error',
                'message': f'Candidate {candidate_id} not found'
            }), 404
            
        # Get job
        job = JobService.get_by_id(candidate['job_id'])
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {candidate["job_id"]} not found'
            }), 404
            
        # Initialize analyzer
        analyzer = CVAnalyzer()
        
        # Run analysis (this saves results to DB automatically)
        result = analyzer.analyze_candidate(
            candidate_id=candidate_id,
            cv_text=candidate['cv_text'],
            job=job
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Candidate re-analyzed successfully',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
