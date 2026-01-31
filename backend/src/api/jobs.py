"""
Jobs API Blueprint

Handles all job-related endpoints:
- List, create, update, delete jobs
- Get job statistics
"""
from flask import Blueprint, request, jsonify
from src.services.job_service import JobService
from werkzeug.exceptions import BadRequest

bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')


@bp.route('', methods=['GET'])
def list_jobs():
    """
    List all jobs with candidate statistics.
    
    Query params:
        status: Filter by status (active, closed, draft)
    
    Returns:
        JSON array of jobs with statistics
    """
    try:
        status = request.args.get('status')
        jobs = JobService.get_all(status=status)
        
        return jsonify({
            'status': 'success',
            'data': jobs,
            'count': len(jobs)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('', methods=['POST'])
def create_job():
    """
    Create a new job listing.
    
    Body (JSON):
        {
            "title": "Job Title",
            "company": "Company Name",
            "description": "Job description...",
            "requirements": ["req1", "req2"],
            "skills": ["skill1", "skill2"],
            "location": "Location (optional)",
            "salary_range": "Salary (optional)"
        }
    
    Returns:
        JSON with created job ID
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'company', 'description']
        for field in required_fields:
            if not data.get(field):
                raise BadRequest(f"Missing required field: {field}")
        
        # Create job
        job_id = JobService.create(data)
        job = JobService.get_by_id(job_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Job created successfully',
            'data': job
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


@bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """
    Get job details by ID.
    
    Returns:
        JSON with job details
    """
    try:
        job = JobService.get_by_id(job_id)
        
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': job
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """
    Update job details.
    
    Body (JSON): Same as create_job
    
    Returns:
        JSON with updated job
    """
    try:
        # Check if job exists
        existing_job = JobService.get_by_id(job_id)
        if not existing_job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'company', 'description']
        for field in required_fields:
            if not data.get(field):
                raise BadRequest(f"Missing required field: {field}")
        
        # Update job
        JobService.update(job_id, data)
        updated_job = JobService.get_by_id(job_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Job updated successfully',
            'data': updated_job
        }), 200
        
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


@bp.route('/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    """
    Delete job and all associated candidates.
    
    Returns:
        JSON confirmation
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        # Delete job (CASCADE will delete candidates)
        JobService.delete(job_id)
        
        return jsonify({
            'status': 'success',
            'message': f'Job {job_id} deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@bp.route('/<int:job_id>/stats', methods=['GET'])
def get_job_stats(job_id):
    """
    Get detailed statistics for a job.
    
    Returns:
        JSON with candidate statistics
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        stats = JobService.get_stats(job_id)
        
        return jsonify({
            'status': 'success',
            'data': {
                'job_id': job_id,
                'job_title': job['title'],
                'statistics': stats
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
