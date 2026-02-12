import requests
import sys
import json
from datetime import datetime

class ChemistryQuizAPITester:
    def __init__(self, base_url="https://gemini-link-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.questions = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_get_all_questions(self):
        """Test getting all quiz questions"""
        success, response = self.run_test(
            "Get All Quiz Questions",
            "GET",
            "quiz/questions",
            200
        )
        
        if success and isinstance(response, list):
            self.questions = response
            print(f"   Found {len(response)} questions")
            
            # Validate question structure
            if len(response) == 10:
                print("✅ Correct number of questions (10)")
                
                # Check first question structure
                first_q = response[0]
                required_fields = ['id', 'question', 'options', 'hint']
                missing_fields = [field for field in required_fields if field not in first_q]
                
                if not missing_fields:
                    print("✅ Question structure is correct")
                    
                    # Check options structure
                    if isinstance(first_q['options'], dict) and all(key in first_q['options'] for key in ['A', 'B', 'C', 'D']):
                        print("✅ Options structure is correct (A, B, C, D)")
                    else:
                        print("❌ Options structure is incorrect")
                        return False
                        
                    # Check if correct_answer is NOT included (security)
                    if 'correct_answer' not in first_q:
                        print("✅ Correct answers are properly hidden")
                    else:
                        print("❌ Security issue: correct answers are exposed")
                        return False
                        
                else:
                    print(f"❌ Missing required fields: {missing_fields}")
                    return False
            else:
                print(f"❌ Expected 10 questions, got {len(response)}")
                return False
                
        return success

    def test_get_single_question(self):
        """Test getting a single question by ID"""
        success, response = self.run_test(
            "Get Single Question (ID=1)",
            "GET",
            "quiz/question/1",
            200
        )
        
        if success:
            # Validate single question structure
            required_fields = ['id', 'question', 'options', 'hint']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields and response['id'] == 1:
                print("✅ Single question retrieval works correctly")
            else:
                print(f"❌ Single question structure issue: {missing_fields}")
                return False
                
        return success

    def test_check_answer_correct(self):
        """Test checking a correct answer"""
        # Using question 1 with correct answer 'B'
        success, response = self.run_test(
            "Check Correct Answer (Q1, Answer B)",
            "POST",
            "quiz/check-answer",
            200,
            data={
                "question_id": 1,
                "selected_answer": "B"
            }
        )
        
        if success:
            expected_fields = ['question_id', 'selected_answer', 'correct_answer', 'is_correct']
            if all(field in response for field in expected_fields):
                if response['is_correct'] == True and response['correct_answer'] == 'B':
                    print("✅ Correct answer validation works")
                else:
                    print(f"❌ Answer validation failed: {response}")
                    return False
            else:
                print(f"❌ Missing fields in response: {response}")
                return False
                
        return success

    def test_check_answer_incorrect(self):
        """Test checking an incorrect answer"""
        success, response = self.run_test(
            "Check Incorrect Answer (Q1, Answer A)",
            "POST",
            "quiz/check-answer",
            200,
            data={
                "question_id": 1,
                "selected_answer": "A"
            }
        )
        
        if success:
            if response['is_correct'] == False and response['correct_answer'] == 'B':
                print("✅ Incorrect answer validation works")
            else:
                print(f"❌ Incorrect answer validation failed: {response}")
                return False
                
        return success

    def test_submit_quiz(self):
        """Test submitting a complete quiz"""
        # Create sample answers for all 10 questions
        sample_answers = [
            {"question_id": 1, "selected_answer": "B"},  # Correct
            {"question_id": 2, "selected_answer": "A"},  # Correct
            {"question_id": 3, "selected_answer": "A"},  # Correct
            {"question_id": 4, "selected_answer": "A"},  # Correct
            {"question_id": 5, "selected_answer": "A"},  # Correct
            {"question_id": 6, "selected_answer": "B"},  # Correct
            {"question_id": 7, "selected_answer": "B"},  # Correct
            {"question_id": 8, "selected_answer": "B"},  # Correct
            {"question_id": 9, "selected_answer": "A"},  # Correct
            {"question_id": 10, "selected_answer": "C"}, # Correct
        ]
        
        success, response = self.run_test(
            "Submit Complete Quiz",
            "POST",
            "quiz/submit",
            200,
            data={"answers": sample_answers}
        )
        
        if success:
            required_fields = ['id', 'total_questions', 'correct_answers', 'score_percentage', 'answers']
            if all(field in response for field in required_fields):
                if (response['total_questions'] == 10 and 
                    response['correct_answers'] == 10 and 
                    response['score_percentage'] == 100.0):
                    print("✅ Quiz submission works correctly (perfect score)")
                else:
                    print(f"❌ Quiz scoring issue: {response['correct_answers']}/10, {response['score_percentage']}%")
                    return False
            else:
                print(f"❌ Missing fields in quiz result: {response}")
                return False
                
        return success

    def test_get_quiz_results(self):
        """Test getting quiz results"""
        success, response = self.run_test(
            "Get Quiz Results",
            "GET",
            "quiz/results",
            200
        )
        
        if success and isinstance(response, list):
            print(f"✅ Quiz results retrieved successfully ({len(response)} results)")
        
        return success

    def test_invalid_question_id(self):
        """Test handling of invalid question ID"""
        success, response = self.run_test(
            "Invalid Question ID (999)",
            "GET",
            "quiz/question/999",
            200  # API returns 200 with error message
        )
        
        if success and 'error' in response:
            print("✅ Invalid question ID handled correctly")
        
        return success

    def test_status_endpoint(self):
        """Test status check endpoint"""
        success, response = self.run_test(
            "Create Status Check",
            "POST",
            "status",
            200,
            data={"client_name": "test_client"}
        )
        
        if success:
            print("✅ Status endpoint works")
        
        return success

def main():
    print("🧪 Starting Chemistry Quiz API Tests")
    print("=" * 50)
    
    tester = ChemistryQuizAPITester()
    
    # Run all tests
    test_results = []
    
    test_results.append(tester.test_root_endpoint())
    test_results.append(tester.test_get_all_questions())
    test_results.append(tester.test_get_single_question())
    test_results.append(tester.test_check_answer_correct())
    test_results.append(tester.test_check_answer_incorrect())
    test_results.append(tester.test_submit_quiz())
    test_results.append(tester.test_get_quiz_results())
    test_results.append(tester.test_invalid_question_id())
    test_results.append(tester.test_status_endpoint())
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend API tests passed!")
        return 0
    else:
        print("❌ Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())