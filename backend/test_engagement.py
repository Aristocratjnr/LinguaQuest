#!/usr/bin/env python3
"""
Test script to verify engagement endpoints are working
"""
import requests
import json

def test_engagement_endpoints():
    """Test the engagement endpoints"""
    base_url = "http://localhost:8000/api/v1"
    test_nickname = "TestUser"
    
    print("🧪 Testing Engagement Endpoints")
    print("=" * 50)
    
    try:
        # Test streak endpoint
        print(f"\n1. Testing GET /streak?nickname={test_nickname}")
        response = requests.get(f"{base_url}/streak", params={"nickname": test_nickname})
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   Error: {response.text}")
        
        # Test level endpoint
        print(f"\n2. Testing GET /level?nickname={test_nickname}")
        response = requests.get(f"{base_url}/level", params={"nickname": test_nickname})
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   Error: {response.text}")
        
        # Test user stats endpoint (which feeds the streak/level data)
        print(f"\n3. Testing GET /stats/{test_nickname}")
        response = requests.get(f"{base_url}/stats/{test_nickname}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            print(f"   Current Streak: {data.get('current_streak', 'N/A')}")
            print(f"   Total Score: {data.get('total_score', 'N/A')}")
        else:
            print(f"   Error: {response.text}")
        
        # Test streak increment
        print(f"\n4. Testing POST /streak/increment?nickname={test_nickname}")
        response = requests.post(f"{base_url}/streak/increment", params={"nickname": test_nickname})
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   Error: {response.text}")
        
        # Test streak reset
        print(f"\n5. Testing POST /streak/reset?nickname={test_nickname}")
        response = requests.post(f"{base_url}/streak/reset", params={"nickname": test_nickname})
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server at http://localhost:8000")
        print("   Please make sure the backend server is running")
    except Exception as e:
        print(f"❌ Error during testing: {e}")

if __name__ == "__main__":
    test_engagement_endpoints()
