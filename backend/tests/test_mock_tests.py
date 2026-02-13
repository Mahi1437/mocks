"""
Backend API Tests for Advanced Mock Test System
Tests all endpoints for BITSAT, VITEEE, SRMJEEE, AEEE mock tests
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://testportal-16.preview.emergentagent.com')

class TestRootEndpoint:
    """Test root API endpoint"""
    
    def test_root_endpoint(self):
        """Test that root endpoint returns correct message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "BITSAT Mock Test API" in data["message"]


class TestQuizSections:
    """Test quiz sections endpoint"""
    
    def test_get_sections(self):
        """Test that sections endpoint returns all 5 sections"""
        response = requests.get(f"{BASE_URL}/api/quiz/sections")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "sections" in data
        assert "total_questions" in data
        assert "max_marks" in data
        assert "duration_minutes" in data
        
        # Verify values
        assert data["total_questions"] == 130
        assert data["max_marks"] == 390
        assert data["duration_minutes"] == 180
        
        # Verify all 5 sections present
        sections = data["sections"]
        assert len(sections) == 5
        
        section_ids = [s["id"] for s in sections]
        assert "physics" in section_ids
        assert "chemistry" in section_ids
        assert "english" in section_ids
        assert "logical" in section_ids
        assert "mathematics" in section_ids
    
    def test_section_question_counts(self):
        """Test that each section has correct question count"""
        response = requests.get(f"{BASE_URL}/api/quiz/sections")
        data = response.json()
        
        expected_counts = {
            "physics": 30,
            "chemistry": 30,
            "english": 10,
            "logical": 20,
            "mathematics": 40
        }
        
        for section in data["sections"]:
            assert section["questions"] == expected_counts[section["id"]]
            assert section["marks_per_question"] == 3
            assert section["negative_marking"] == -1


class TestAllQuestions:
    """Test all questions endpoint"""
    
    def test_get_all_questions(self):
        """Test that all questions endpoint returns questions for all sections"""
        response = requests.get(f"{BASE_URL}/api/quiz/all-questions")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all sections present
        assert "physics" in data
        assert "chemistry" in data
        assert "english" in data
        assert "logical" in data
        assert "mathematics" in data
        
        # Verify question counts
        assert len(data["physics"]) == 30
        assert len(data["chemistry"]) == 30
        assert len(data["english"]) == 10
        assert len(data["logical"]) == 20
        assert len(data["mathematics"]) == 40
    
    def test_question_structure(self):
        """Test that questions have correct structure"""
        response = requests.get(f"{BASE_URL}/api/quiz/all-questions")
        data = response.json()
        
        # Check first physics question structure
        physics_q = data["physics"][0]
        assert "id" in physics_q
        assert "question" in physics_q
        assert "options" in physics_q
        assert "hint" in physics_q
        
        # Verify options structure
        options = physics_q["options"]
        assert "A" in options
        assert "B" in options
        assert "C" in options
        assert "D" in options


class TestSectionQuestions:
    """Test individual section questions endpoints"""
    
    def test_physics_questions(self):
        """Test physics section questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/physics")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 30
    
    def test_chemistry_questions(self):
        """Test chemistry section questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/chemistry")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 30
    
    def test_english_questions(self):
        """Test english section questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/english")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 10
    
    def test_logical_questions(self):
        """Test logical reasoning section questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/logical")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 20
    
    def test_mathematics_questions(self):
        """Test mathematics section questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/mathematics")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 40
    
    def test_invalid_section(self):
        """Test that invalid section returns error"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/invalid_section")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data


class TestQuizSubmission:
    """Test quiz submission endpoint"""
    
    def test_submit_empty_quiz(self):
        """Test submitting quiz with no answers"""
        payload = {
            "answers": [],
            "time_taken": 100
        }
        response = requests.post(f"{BASE_URL}/api/quiz/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify result structure
        assert "sections" in data
        assert "total_marks" in data
        assert "max_marks" in data
        assert "percentage" in data
        assert "time_taken" in data
        
        # Verify values for empty submission
        assert data["total_marks"] == 0
        assert data["max_marks"] == 390
        assert data["percentage"] == 0
    
    def test_submit_with_correct_answers(self):
        """Test submitting quiz with some correct answers"""
        # Get correct answers first
        correct_response = requests.get(f"{BASE_URL}/api/quiz/correct-answers")
        correct_answers = correct_response.json()
        
        # Submit first 3 physics questions with correct answers
        answers = []
        for i in range(1, 4):
            answers.append({
                "question_id": i,
                "section": "physics",
                "selected_answer": correct_answers["physics"][str(i)]
            })
        
        payload = {
            "answers": answers,
            "time_taken": 300
        }
        response = requests.post(f"{BASE_URL}/api/quiz/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify correct scoring (3 correct * 3 marks = 9)
        assert data["total_marks"] == 9
        
        # Verify physics section stats
        physics_section = next(s for s in data["sections"] if s["section_name"] == "Physics")
        assert physics_section["attempted"] == 3
        assert physics_section["correct"] == 3
        assert physics_section["wrong"] == 0
        assert physics_section["marks"] == 9
    
    def test_submit_with_wrong_answers(self):
        """Test submitting quiz with wrong answers (negative marking)"""
        # Submit with intentionally wrong answers
        answers = [
            {"question_id": 1, "section": "physics", "selected_answer": "Z"},  # Invalid option
            {"question_id": 2, "section": "physics", "selected_answer": "Z"},
        ]
        
        payload = {
            "answers": answers,
            "time_taken": 100
        }
        response = requests.post(f"{BASE_URL}/api/quiz/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify negative marking applied (2 wrong * -1 = -2)
        physics_section = next(s for s in data["sections"] if s["section_name"] == "Physics")
        assert physics_section["wrong"] == 2
        assert physics_section["marks"] == -2


class TestCorrectAnswers:
    """Test correct answers endpoint"""
    
    def test_get_correct_answers(self):
        """Test that correct answers endpoint returns all answers"""
        response = requests.get(f"{BASE_URL}/api/quiz/correct-answers")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all sections present
        assert "physics" in data
        assert "chemistry" in data
        assert "english" in data
        assert "logical" in data
        assert "mathematics" in data
        
        # Verify answer counts
        assert len(data["physics"]) == 30
        assert len(data["chemistry"]) == 30
        assert len(data["english"]) == 10
        assert len(data["logical"]) == 20
        assert len(data["mathematics"]) == 40
    
    def test_answer_format(self):
        """Test that answers are in correct format (A, B, C, or D)"""
        response = requests.get(f"{BASE_URL}/api/quiz/correct-answers")
        data = response.json()
        
        valid_options = {"A", "B", "C", "D"}
        
        for section, answers in data.items():
            for q_id, answer in answers.items():
                assert answer in valid_options, f"Invalid answer {answer} for {section} question {q_id}"


class TestEmployeeSkillEndpoints:
    """Test Employee Skill Assessment endpoints (separate feature)"""
    
    def test_employee_skill_root(self):
        """Test employee skill root endpoint"""
        response = requests.get(f"{BASE_URL}/api/employee-skill/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_employee_skill_sections(self):
        """Test employee skill sections endpoint"""
        response = requests.get(f"{BASE_URL}/api/employee-skill/sections")
        assert response.status_code == 200
        data = response.json()
        assert "sections" in data
        assert "total_questions" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
