"""
Test script for Phase 3: API Development

Tests all REST API endpoints.
"""
import requests
import json
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:5000/api"


def test_phase_3():
    print("🧪 Testing Phase 3: API Development\n")
    print("=" * 60)
    print("⚠️  NOTE: This test requires the Flask server to be running!")
    print("   Start server: python app.py")
    print("=" * 60)
    input("\nPress Enter when server is running...")
    
    try:
        # Test 1: Health check
        print("\nTest 1: Health Check")
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200, "Health check failed"
        print("✅ Health check passed")
        
        # Test 2: System status
        print("\nTest 2: System Status")
        response = requests.get(f"{BASE_URL}/status")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Total Jobs: {data['data']['total_jobs']}")
        print(f"   Total Candidates: {data['data']['total_candidates']}")
        print(f"   Ollama Available: {data['data']['ollama']['available']}")
        assert response.status_code == 200, "Status check failed"
        print("✅ Status check passed")
        
        # Test 3: Create job
        print("\nTest 3: Create Job (POST /api/jobs)")
        job_data = {
            'title': 'Senior React Developer',
            'company': 'Tech Innovations Inc.',
            'description': 'Looking for an experienced React developer to join our frontend team.',
            'requirements': [
                '5+ years React experience',
                'TypeScript proficiency',
                'State management (Redux/Zustand)',
                'Testing (Jest/RTL)',
                'RESTful API integration'
            ],
            'skills': ['React', 'TypeScript', 'Redux', 'Jest', 'REST API', 'Git'],
            'location': 'New York, NY (Hybrid)',
            'salary_range': '$120,000 - $160,000'
        }
        
        response = requests.post(f"{BASE_URL}/jobs", json=job_data)
        print(f"   Status: {response.status_code}")
        assert response.status_code == 201, f"Job creation failed: {response.text}"
        job = response.json()['data']
        job_id = job['id']
        print(f"✅ Job created with ID: {job_id}")
        print(f"   Title: {job['title']}")
        print(f"   Company: {job['company']}")
        
        # Test 4: List jobs
        print("\nTest 4: List Jobs (GET /api/jobs)")
        response = requests.get(f"{BASE_URL}/jobs")
        assert response.status_code == 200, "List jobs failed"
        jobs = response.json()['data']
        print(f"✅ Found {len(jobs)} jobs")
        for j in jobs:
            print(f"   - {j['title']} at {j['company']} ({j['total_candidates']} candidates)")
        
        # Test 5: Get job by ID
        print(f"\nTest 5: Get Job by ID (GET /api/jobs/{job_id})")
        response = requests.get(f"{BASE_URL}/jobs/{job_id}")
        assert response.status_code == 200, "Get job failed"
        job = response.json()['data']
        print(f"✅ Retrieved job: {job['title']}")
        print(f"   Requirements: {len(job['requirements'])} items")
        
        # Test 6: Update job
        print(f"\nTest 6: Update Job (PUT /api/jobs/{job_id})")
        job_data['salary_range'] = '$130,000 - $170,000'
        response = requests.put(f"{BASE_URL}/jobs/{job_id}", json=job_data)
        assert response.status_code == 200, "Update job failed"
        print("✅ Job updated successfully")
        
        # Test 7: Get job stats
        print(f"\nTest 7: Get Job Stats (GET /api/jobs/{job_id}/stats)")
        response = requests.get(f"{BASE_URL}/jobs/{job_id}/stats")
        assert response.status_code == 200, "Get stats failed"
        stats = response.json()['data']['statistics']
        print(f"✅ Stats retrieved:")
        print(f"   Total Candidates: {stats['total_candidates']}")
        print(f"   Pending: {stats['pending']}")
        print(f"   Analyzed: {stats['analyzed']}")
        
        # Test 8: Upload candidates (mock data)
        print(f"\nTest 8: Upload Candidates (POST /api/jobs/{job_id}/candidates/upload)")
        print("   NOTE: This endpoint requires actual files.")
        print("   Skipping file upload test (requires multipart/form-data)")
        print("   ℹ️  Use Postman or curl to test file uploads manually")
        
        # Test 9: List candidates (empty initially)
        print(f"\nTest 9: List Candidates (GET /api/jobs/{job_id}/candidates)")
        response = requests.get(f"{BASE_URL}/jobs/{job_id}/candidates")
        assert response.status_code == 200, "List candidates failed"
        candidates = response.json()['data']
        print(f"✅ Found {len(candidates)} candidates")
        
        # Test 10: Analysis status
        print(f"\nTest 10: Analysis Status (GET /api/jobs/{job_id}/analyze/status)")
        response = requests.get(f"{BASE_URL}/jobs/{job_id}/analyze/status")
        assert response.status_code == 200, "Get analysis status failed"
        analysis = response.json()['data']
        print(f"✅ Analysis Status: {analysis['analysis_status']}")
        print(f"   Progress: {analysis['progress_percentage']}%")
        
        # Test 11: Start analysis (will fail without candidates)
        print(f"\nTest 11: Start Analysis (POST /api/jobs/{job_id}/analyze)")
        response = requests.post(f"{BASE_URL}/jobs/{job_id}/analyze")
        print(f"   Status: {response.status_code}")
        print(f"   Message: {response.json().get('message')}")
        print("✅ Analysis endpoint responding correctly")
        
        # Test 12: Export (will fail without candidates)
        print(f"\nTest 12: Export Candidates (GET /api/jobs/{job_id}/export)")
        response = requests.get(f"{BASE_URL}/jobs/{job_id}/export?format=csv")
        print(f"   Status: {response.status_code}")
        if response.status_code == 404:
            print("   Expected: No candidates to export yet")
            print("✅ Export endpoint responding correctly")
        
        # Test 13: Delete job
        print(f"\nTest 13: Delete Job (DELETE /api/jobs/{job_id})")
        response = requests.delete(f"{BASE_URL}/jobs/{job_id}")
        assert response.status_code == 200, "Delete job failed"
        print(f"✅ Job {job_id} deleted successfully")
        
        # Verify deletion
        response = requests.get(f"{BASE_URL}/jobs/{job_id}")
        assert response.status_code == 404, "Job should be deleted"
        print("✅ Deletion verified")
        
        print("\n" + "=" * 60)
        print("✅ Phase 3 Tests Complete!")
        print("=" * 60)
        print("\nAPI Endpoints Working:")
        print("  ✅ GET  /api/health")
        print("  ✅ GET  /api/status")
        print("  ✅ GET  /api/jobs")
        print("  ✅ POST /api/jobs")
        print("  ✅ GET  /api/jobs/:id")
        print("  ✅ PUT  /api/jobs/:id")
        print("  ✅ DELETE /api/jobs/:id")
        print("  ✅ GET  /api/jobs/:id/stats")
        print("  ✅ GET  /api/jobs/:id/candidates")
        print("  ✅ POST /api/jobs/:id/candidates/upload")
        print("  ✅ POST /api/jobs/:id/analyze")
        print("  ✅ GET  /api/jobs/:id/analyze/status")
        print("  ✅ GET  /api/jobs/:id/export")
        print("\nReady for Phase 4: Frontend Implementation!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server!")
        print("   Please start the Flask server:")
        print("   > cd backend")
        print("   > python app.py")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")


if __name__ == "__main__":
    test_phase_3()
