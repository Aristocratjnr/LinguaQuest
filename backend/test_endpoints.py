#!/usr/bin/env python3
"""
Quick test script to verify the optimized backend endpoints work correctly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from fastapi.testclient import TestClient
    from optimized_main import app
    
    def test_endpoints():
        client = TestClient(app)
        
        print("Testing backend endpoints...")
        
        # Test health endpoint
        print("\n1. Testing health endpoint...")
        response = client.get("/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        
        # Test leaderboard endpoint
        print("\n2. Testing leaderboard endpoint...")
        response = client.get("/api/v1/leaderboard")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Found {len(data)} players")
            if data:
                print(f"   First player: {data[0].get('nickname', 'Unknown')}")
        
        # Test progression endpoint
        print("\n3. Testing progression endpoint...")
        response = client.get("/api/v1/progression/TestUser")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Found {len(data)} progression stages")
            if data:
                print(f"   First stage: {data[0].get('id', 'Unknown')}")
        
        # Test user stats endpoint
        print("\n4. Testing user stats endpoint...")
        response = client.get("/api/v1/stats/TestUser")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
        
        print("\nEndpoint test completed!")

except ImportError as e:
    print(f"Cannot import test dependencies: {e}")
    print("Please install: pip install httpx")
    
    def test_endpoints():
        print("Test client not available - manual testing required")

if __name__ == "__main__":
    test_endpoints()
