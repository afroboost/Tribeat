"""
Test Suite: Live Session API
Tests for /api/session/[id]/event endpoints

Note: These tests require a valid session cookie. 
The API endpoints are protected and require authentication.
"""

import pytest
import requests
import os
import subprocess

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')

def get_authenticated_session():
    """Get an authenticated session using curl-based login"""
    session = requests.Session()
    
    # Step 1: Get CSRF token
    csrf_response = session.get(f"{BASE_URL}/api/auth/csrf")
    if csrf_response.status_code != 200:
        return None, "Failed to get CSRF token"
    
    csrf_token = csrf_response.json().get('csrfToken')
    if not csrf_token:
        return None, "No CSRF token in response"
    
    # Step 2: Login with credentials
    login_response = session.post(
        f"{BASE_URL}/api/auth/callback/credentials",
        data={
            "email": "admin@tribeat.com",
            "password": "Admin123!",
            "csrfToken": csrf_token
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        allow_redirects=False
    )
    
    # Check if session cookie was set
    cookies = session.cookies.get_dict()
    session_cookie = None
    for key in cookies:
        if 'session-token' in key:
            session_cookie = cookies[key]
            break
    
    if session_cookie:
        return session, None
    else:
        return None, "No session cookie set after login"


class TestSessionEventAPI:
    """Tests for session event API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get authenticated session"""
        self.session, error = get_authenticated_session()
        if error:
            pytest.skip(f"Authentication failed: {error}")
    
    def test_get_session_state(self):
        """GET /api/session/[id]/event - Get session state"""
        response = self.session.get(f"{BASE_URL}/api/session/demo-session-1/event")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('success') == True
        assert 'state' in data
        
        state = data['state']
        assert state['sessionId'] == 'demo-session-1'
        assert state['status'] in ['LIVE', 'PAUSED', 'ENDED']
        assert 'isPlaying' in state
        assert 'currentTime' in state
        assert 'volume' in state
        assert 'mediaUrl' in state
        assert 'timestamp' in state
        print(f"Session state: {state}")
    
    def test_post_play_event(self):
        """POST /api/session/[id]/event - Play event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:play",
                "data": {"currentTime": 0}
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:play'
        assert 'channelName' in data
        print(f"Play event response: {data}")
    
    def test_post_pause_event(self):
        """POST /api/session/[id]/event - Pause event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:pause",
                "data": {"currentTime": 30}
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:pause'
        print(f"Pause event response: {data}")
    
    def test_post_seek_event(self):
        """POST /api/session/[id]/event - Seek event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:seek",
                "data": {"currentTime": 60}
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:seek'
        print(f"Seek event response: {data}")
    
    def test_post_volume_event(self):
        """POST /api/session/[id]/event - Volume event"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:volume",
                "data": {"volume": 75}
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('success') == True
        assert data.get('event') == 'session:volume'
        print(f"Volume event response: {data}")
    
    def test_invalid_event_type(self):
        """POST /api/session/[id]/event - Invalid event type returns 400"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "invalid:event",
                "data": {}
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'error' in data
        print(f"Invalid event response: {data}")
    
    def test_missing_event_data(self):
        """POST /api/session/[id]/event - Missing data returns 400"""
        response = self.session.post(
            f"{BASE_URL}/api/session/demo-session-1/event",
            json={
                "event": "session:play"
                # Missing 'data' field
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'error' in data
        print(f"Missing data response: {data}")
    
    def test_nonexistent_session(self):
        """GET /api/session/[id]/event - Nonexistent session returns 404"""
        response = self.session.get(f"{BASE_URL}/api/session/nonexistent-session/event")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'error' in data
        print(f"Nonexistent session response: {data}")


class TestSessionPageAccess:
    """Tests for session page access control"""
    
    def test_unauthenticated_redirects_to_login(self):
        """Unauthenticated user is redirected to login"""
        session = requests.Session()
        response = session.get(
            f"{BASE_URL}/session/demo-session-1",
            allow_redirects=False
        )
        
        # Should redirect to login
        assert response.status_code in [302, 307, 308], f"Expected redirect, got {response.status_code}"
        location = response.headers.get('Location', '')
        assert 'login' in location.lower() or 'auth' in location.lower(), f"Expected login redirect, got: {location}"
        print(f"Redirect location: {location}")
    
    def test_authenticated_user_can_access_session(self):
        """Authenticated user can access session page"""
        session, error = get_authenticated_session()
        if error:
            pytest.skip(f"Authentication failed: {error}")
        
        response = session.get(
            f"{BASE_URL}/session/demo-session-1",
            allow_redirects=True
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'Session de Démonstration' in response.text or 'session-page' in response.text
        print("Authenticated user can access session page")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-s"])
