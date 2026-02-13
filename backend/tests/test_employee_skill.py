"""
Backend API tests for Employee Skill Test system
Tests: Registration, Login, Admin Login, Quiz Submit, Admin Stats
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEmployeeSkillAPIs:
    """Employee Skill Test API tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
    
    def test_register_employee(self):
        """Test employee registration"""
        response = requests.post(f"{BASE_URL}/api/employee-skill/register", json={
            "name": "TEST_Employee1",
            "designation": "Test Engineer",
            "mobile": "9999999001",
            "email": "test1@example.com"
        })
        assert response.status_code == 200
        data = response.json()
        # Check if registration was successful (returns employee data)
        assert "name" in data or "success" in data
        if "name" in data:
            assert data["name"] == "TEST_Employee1"
    
    def test_register_duplicate_mobile(self):
        """Test duplicate mobile registration"""
        # First registration
        requests.post(f"{BASE_URL}/api/employee-skill/register", json={
            "name": "TEST_Employee2",
            "designation": "Developer",
            "mobile": "9999999002",
            "email": "test2@example.com"
        })
        # Second registration with same mobile
        response = requests.post(f"{BASE_URL}/api/employee-skill/register", json={
            "name": "TEST_Employee3",
            "designation": "Developer",
            "mobile": "9999999002",
            "email": "test3@example.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
        assert "already registered" in data.get("message", "").lower()
    
    def test_login_employee(self):
        """Test employee login with valid mobile"""
        # First register
        requests.post(f"{BASE_URL}/api/employee-skill/register", json={
            "name": "TEST_LoginUser",
            "designation": "Tester",
            "mobile": "9999999003",
            "email": "login@example.com"
        })
        # Then login
        response = requests.post(f"{BASE_URL}/api/employee-skill/login", json={
            "mobile": "9999999003"
        })
        assert response.status_code == 200
        data = response.json()
        # Should return employee data with name
        assert "name" in data or "_id" in data
        if "name" in data:
            assert data["name"] == "TEST_LoginUser"
    
    def test_login_invalid_mobile(self):
        """Test login with non-existent mobile"""
        response = requests.post(f"{BASE_URL}/api/employee-skill/login", json={
            "mobile": "0000000000"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
        assert "not found" in data.get("message", "").lower()
    
    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/employee-skill/admin/login", json={
            "username": "venureddy.josh",
            "password": "Josh@123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "admin_id" in data
    
    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/employee-skill/admin/login", json={
            "username": "wrong",
            "password": "wrong"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
    
    def test_get_questions(self):
        """Test fetching quiz questions"""
        response = requests.get(f"{BASE_URL}/api/employee-skill/questions")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) == 170  # 170 questions total
        
        # Check question structure
        question = data["questions"][0]
        assert "id" in question
        assert "question" in question
        assert "question_telugu" in question
        assert "options" in question
        assert "section" in question
        assert len(question["options"]) == 4  # 4 options per question
    
    def test_submit_quiz(self):
        """Test quiz submission"""
        # First register and get employee ID
        reg_response = requests.post(f"{BASE_URL}/api/employee-skill/register", json={
            "name": "TEST_QuizUser",
            "designation": "Student",
            "mobile": "9999999004",
            "email": "quiz@example.com"
        })
        employee_id = reg_response.json().get("_id")
        
        if not employee_id:
            # Try login to get ID
            login_response = requests.post(f"{BASE_URL}/api/employee-skill/login", json={
                "mobile": "9999999004"
            })
            employee_id = login_response.json().get("_id")
        
        assert employee_id is not None, "Failed to get employee ID"
        
        # Submit quiz with some answers
        response = requests.post(f"{BASE_URL}/api/employee-skill/submit", json={
            "employee_id": employee_id,
            "answers": [
                {"question_id": 1, "section": "parent_interaction", "selected_answer": 2},
                {"question_id": 2, "section": "parent_interaction", "selected_answer": 1},
                {"question_id": 3, "section": "parent_interaction", "selected_answer": 3}
            ],
            "time_taken": 120
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check result structure
        assert "sections" in data
        assert isinstance(data["sections"], list)
        assert len(data["sections"]) == 5  # 5 sections
        assert "total_questions" in data
        assert data["total_questions"] == 170
        assert "percentage" in data
    
    def test_admin_stats(self):
        """Test admin stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/employee-skill/admin/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_employees" in data
        assert "tests_completed" in data
        assert "average_score" in data
        assert "recent_results" in data
        assert "employees" in data
        
        assert isinstance(data["total_employees"], int)
        assert isinstance(data["tests_completed"], int)
    
    def test_admin_results(self):
        """Test admin results endpoint"""
        response = requests.get(f"{BASE_URL}/api/employee-skill/admin/results")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
    
    def test_admin_employees(self):
        """Test admin employees endpoint"""
        response = requests.get(f"{BASE_URL}/api/employee-skill/admin/employees")
        assert response.status_code == 200
        data = response.json()
        assert "employees" in data
        assert isinstance(data["employees"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
