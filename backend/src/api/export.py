"""
Export API

Handles data export functionality (CSV/Excel).
"""
from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
import csv
import json
from datetime import datetime

from src.services.job_service import JobService
from src.services.candidate_service import CandidateService

bp = Blueprint('export', __name__, url_prefix='/api')


@bp.route('/jobs/<int:job_id>/export', methods=['GET'])
def export_candidates(job_id):
    """
    Export candidates for a job as CSV or Excel.
    
    Query params:
        format: 'csv' or 'excel' (default: csv)
        category: Filter by category (optional)
        min_score: Minimum score threshold (optional)
    
    Returns:
        File download
    """
    try:
        # Check if job exists
        job = JobService.get_by_id(job_id)
        if not job:
            return jsonify({
                'status': 'error',
                'message': f'Job {job_id} not found'
            }), 404
        
        # Get parameters
        export_format = request.args.get('format', 'csv').lower()
        category = request.args.get('category')
        min_score = request.args.get('min_score', type=int)
        
        # Get candidates
        candidates = CandidateService.get_by_job(job_id, category=category, status='analyzed')
        
        # Filter by min_score if provided
        if min_score is not None:
            candidates = [c for c in candidates if c['score'] >= min_score]
        
        if not candidates:
            return jsonify({
                'status': 'error',
                'message': 'No candidates found matching criteria'
            }), 404
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{job['company']}_{job['title']}_candidates_{timestamp}"
        
        if export_format == 'excel':
            return _export_excel(candidates, job, filename)
        else:
            return _export_csv(candidates, job, filename)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


def _export_csv(candidates, job, filename):
    """
    Export candidates as CSV.
    
    Args:
        candidates: List of candidate dictionaries
        job: Job dictionary
        filename: Base filename
    
    Returns:
        CSV file response
    """
    # Create CSV in memory
    output = BytesIO()
    # Use BytesIO with text wrapper for CSV
    import io
    text_output = io.TextIOWrapper(output, encoding='utf-8', newline='')
    
    writer = csv.writer(text_output)
    
    # Write header
    writer.writerow([
        'Rank',
        'Name',
        'Email',
        'Phone',
        'Score',
        'Category',
        'Recommendation',
        'Experience (Years)',
        'Education',
        'Matched Skills',
        'Missing Skills',
        'Strengths',
        'Concerns',
        'Summary',
        'File'
    ])
    
    # Write data rows
    for i, candidate in enumerate(candidates, 1):
        writer.writerow([
            i,
            candidate.get('name', ''),
            candidate.get('email', ''),
            candidate.get('phone', ''),
            candidate.get('score', 0),
            candidate.get('category', ''),
            candidate.get('recommendation', ''),
            candidate.get('experience_years', 0),
            candidate.get('education', {}).get('summary', ''),
            ', '.join(candidate.get('matched_skills', [])),
            ', '.join(candidate.get('missing_skills', [])),
            ' | '.join(candidate.get('strengths', [])),
            ' | '.join(candidate.get('concerns', [])),
            candidate.get('summary', ''),
            candidate.get('original_filename', '')
        ])
    
    # Prepare file for download
    text_output.flush()
    output.seek(0)
    
    return send_file(
        output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'{filename}.csv'
    )


def _export_excel(candidates, job, filename):
    """
    Export candidates as Excel.
    
    Args:
        candidates: List of candidate dictionaries
        job: Job dictionary
        filename: Base filename
    
    Returns:
        Excel file response
    """
    try:
        import pandas as pd
        from openpyxl.styles import Font, PatternFill
        
        # Prepare data for DataFrame
        data = []
        for i, candidate in enumerate(candidates, 1):
            data.append({
                'Rank': i,
                'Name': candidate.get('name', ''),
                'Email': candidate.get('email', ''),
                'Phone': candidate.get('phone', ''),
                'Score': candidate.get('score', 0),
                'Category': candidate.get('category', ''),
                'Recommendation': candidate.get('recommendation', ''),
                'Experience (Years)': candidate.get('experience_years', 0),
                'Education': candidate.get('education', {}).get('summary', ''),
                'Matched Skills': ', '.join(candidate.get('matched_skills', [])),
                'Missing Skills': ', '.join(candidate.get('missing_skills', [])),
                'Strengths': ' | '.join(candidate.get('strengths', [])),
                'Concerns': ' | '.join(candidate.get('concerns', [])),
                'Summary': candidate.get('summary', ''),
                'File': candidate.get('original_filename', '')
            })
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Create Excel file in memory
        output = BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Candidates', index=False)
            
            # Get workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Candidates']
            
            # Style header row
            header_fill = PatternFill(start_color='366092', end_color='366092', fill_type='solid')
            header_font = Font(bold=True, color='FFFFFF')
            
            for cell in worksheet[1]:
                cell.fill = header_fill
                cell.font = header_font
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)  # Cap at 50
                worksheet.column_dimensions[column_letter].width = adjusted_width
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'{filename}.xlsx'
        )
        
    except ImportError:
        return jsonify({
            'status': 'error',
            'message': 'Excel export requires pandas and openpyxl. Please install them.'
        }), 500
