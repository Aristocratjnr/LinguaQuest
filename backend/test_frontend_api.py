#!/usr/bin/env python3
"""
Test script to simulate frontend requests to backend
"""
import requests
import json

def test_frontend_api_calls():
    """Test the exact API calls the frontend makes"""
    # This should match the API_BASE_URL from frontend config
    base_url = "http://localhost:8000/api/v1"
    test_nickname = "TestUser123"
    
    print("🔗 Testing Frontend API Calls")
    print("=" * 50)
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        # Test exactly what the frontend SettingsPage calls
        print(f"\n1. Frontend Call: GET {base_url}/streak?nickname={test_nickname}")
        response = requests.get(f"{base_url}/streak", params={"nickname": test_nickname}, headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            print(f"   ✅ Streak value: {data.get('streak', 'missing')}")
        else:
            print(f"   ❌ Error: {response.text}")
        
        print(f"\n2. Frontend Call: GET {base_url}/level?nickname={test_nickname}")
        response = requests.get(f"{base_url}/level", params={"nickname": test_nickname}, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            print(f"   ✅ Level value: {data.get('level', 'missing')}")
        else:
            print(f"   ❌ Error: {response.text}")
        
        # Test the underlying stats endpoint
        print(f"\n3. Backend Stats: GET {base_url}/stats/{test_nickname}")
        response = requests.get(f"{base_url}/stats/{test_nickname}", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Current Streak: {data.get('current_streak', 'missing')}")
            print(f"   Total Score: {data.get('total_score', 'missing')}")
            print(f"   Calculated Level: {max(1, data.get('total_score', 0) // 100)}")
        else:
            print(f"   ❌ Error: {response.text}")
        
        # Test with different usernames to verify consistency
        test_users = ["Alice", "Bob", "Charlie"]
        print(f"\n4. Testing Multiple Users:")
        for username in test_users:
            response = requests.get(f"{base_url}/streak", params={"nickname": username}, headers=headers)
            if response.status_code == 200:
                streak_data = response.json()
                stats_response = requests.get(f"{base_url}/stats/{username}", headers=headers)
                if stats_response.status_code == 200:
                    stats_data = stats_response.json()
                    print(f"   {username}: Streak={streak_data.get('streak')}, Total Score={stats_data.get('total_score')}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server")
        print("   Make sure backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_frontend_api_calls()
