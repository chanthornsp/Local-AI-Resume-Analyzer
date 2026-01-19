#!/usr/bin/env python3
import argparse
import json
import glob
from src.services.batch_processor import BatchProcessor

def main():
    parser = argparse.ArgumentParser(
        description='Screen CVs for job positions using local AI'
    )
    parser.add_argument(
        '--cvs', required=True,
        help='Path pattern to CV files (e.g., ./cvs/*.pdf)'
    )
    parser.add_argument(
        '--job-title', required=True,
        help='Job title'
    )
    parser.add_argument(
        '--job-desc', required=True,
        help='Path to job description file'
    )
    parser.add_argument(
        '--requirements', required=True,
        help='Path to requirements file (one per line)'
    )
    parser.add_argument(
        '--company', required=True,
        help='Company name'
    )
    parser.add_argument(
        '--output',
        help='Output JSON file path'
    )
    parser.add_argument(
        '--min-score', type=int, default=70,
        help='Minimum score for shortlist (default: 70)'
    )

    args = parser.parse_args()

    # Get CV files
    files = glob.glob(args.cvs)
    if not files:
        print(f"No files found: {args.cvs}")
        return

    # Read job description
    with open(args.job_desc) as f:
        job_description = f.read()

    # Read requirements
    with open(args.requirements) as f:
        requirements = [line.strip() for line in f if line.strip()]

    print(f"🔍 Processing {len(files)} CVs...")
    print(f"📋 Job: {args.job_title} at {args.company}")
    print("-" * 50)

    processor = BatchProcessor()
    results = processor.process_batch(
        file_paths=files,
        job_title=args.job_title,
        job_description=job_description,
        job_requirements=requirements,
        company_name=args.company
    )

    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n✅ Results saved to {args.output}")

    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 SCREENING RESULTS")
    print("=" * 60)
    print(f"Job: {results['job_info']['title']} at {results['job_info']['company']}")
    print(f"Total Applicants: {results['job_info']['total_applicants']}")
    print()

    # Score distribution
    print("Score Distribution:")
    for group, data in results['score_groups'].items():
        emoji = {'excellent': '🟢', 'good': '🟡', 'average': '🟠', 'below_average': '🔴'}
        print(f"  {emoji.get(group, '⚪')} {group.replace('_', ' ').title()} ({data['range']}): {data['count']} candidates")

    # Top shortlist
    print("\n" + "-" * 60)
    print("TOP SHORTLIST:")
    for c in results['shortlist'][:10]:
        print(f"  {c['rank']}. {c['name']:<20} | Score: {c['score']:>3} | {c['recommendation']}")

    # Analytics
    analytics = results['analytics']
    print("\n" + "-" * 60)
    print("ANALYTICS:")
    print(f"  • Average Score: {analytics['average_score']:.1f}%")
    print(f"  • Processed: {analytics['processed']} | Errors: {analytics['errors']}")
    print(f"  • Time: {analytics['screening_time_seconds']}s")

if __name__ == '__main__':
    main()
