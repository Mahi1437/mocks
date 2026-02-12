import requests
import sys
import json
from datetime import datetime

class BITSATMockTestAPITester:
    def __init__(self, base_url="https://gemini-link-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.all_questions = {}
        self.sections = ["physics", "chemistry", "english", "logical", "mathematics"]

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

    def test_get_sections(self):
        """Test getting quiz sections"""
        success, response = self.run_test(
            "Get Quiz Sections",
            "GET",
            "quiz/sections",
            200
        )
        
        if success:
            expected_fields = ['sections', 'total_questions', 'max_marks', 'duration_minutes']
            if all(field in response for field in expected_fields):
                if (response['total_questions'] == 130 and 
                    response['max_marks'] == 390 and 
                    response['duration_minutes'] == 180):
                    print("✅ Quiz sections configuration is correct")
                    
                    # Check sections structure
                    sections = response['sections']
                    if len(sections) == 5:
                        expected_sections = [
                            {"id": "physics", "questions": 30},
                            {"id": "chemistry", "questions": 30},
                            {"id": "english", "questions": 10},
                            {"id": "logical", "questions": 20},
                            {"id": "mathematics", "questions": 40}
                        ]
                        
                        for expected in expected_sections:
                            section = next((s for s in sections if s['id'] == expected['id']), None)
                            if section and section['questions'] == expected['questions']:
                                print(f"✅ {expected['id'].title()} section: {expected['questions']} questions")
                            else:
                                print(f"❌ {expected['id'].title()} section configuration incorrect")
                                return False
                    else:
                        print(f"❌ Expected 5 sections, got {len(sections)}")
                        return False
                else:
                    print(f"❌ Quiz configuration incorrect: {response}")
                    return False
            else:
                print(f"❌ Missing required fields in sections response")
                return False
                
        return success

    def test_get_all_questions(self):
        """Test getting all quiz questions"""
        success, response = self.run_test(
            "Get All Quiz Questions",
            "GET",
            "quiz/all-questions",
            200
        )
        
        if success and isinstance(response, dict):
            self.all_questions = response
            total_questions = 0
            
            # Check each section
            expected_counts = {
                "physics": 30,
                "chemistry": 30,
                "english": 10,
                "logical": 20,
                "mathematics": 40
            }
            
            for section, expected_count in expected_counts.items():
                if section in response:
                    questions = response[section]
                    if len(questions) == expected_count:
                        print(f"✅ {section.title()}: {len(questions)} questions")
                        total_questions += len(questions)
                        
                        # Check first question structure
                        if questions:
                            first_q = questions[0]
                            required_fields = ['id', 'question', 'options', 'hint']
                            missing_fields = [field for field in required_fields if field not in first_q]
                            
                            if not missing_fields:
                                # Check options structure
                                if isinstance(first_q['options'], dict) and all(key in first_q['options'] for key in ['A', 'B', 'C', 'D']):
                                    # Check if correct_answer is NOT included (security)
                                    if 'correct_answer' not in first_q:
                                        continue  # All good for this section
                                    else:
                                        print(f"❌ Security issue in {section}: correct answers are exposed")
                                        return False
                                else:
                                    print(f"❌ Options structure incorrect in {section}")
                                    return False
                            else:
                                print(f"❌ Missing required fields in {section}: {missing_fields}")
                                return False
                    else:
                        print(f"❌ {section.title()}: Expected {expected_count} questions, got {len(questions)}")
                        return False
                else:
                    print(f"❌ Missing section: {section}")
                    return False
            
            if total_questions == 130:
                print(f"✅ Total questions correct: {total_questions}")
            else:
                print(f"❌ Total questions incorrect: {total_questions}, expected 130")
                return False
                
        return success

    def test_get_section_questions(self):
        """Test getting questions for each section"""
        for section in self.sections:
            success, response = self.run_test(
                f"Get {section.title()} Questions",
                "GET",
                f"quiz/questions/{section}",
                200
            )
            
            if not success:
                return False
                
            if isinstance(response, list):
                expected_counts = {
                    "physics": 30, "chemistry": 30, "english": 10, 
                    "logical": 20, "mathematics": 40
                }
                
                if len(response) == expected_counts[section]:
                    print(f"✅ {section.title()}: {len(response)} questions")
                else:
                    print(f"❌ {section.title()}: Expected {expected_counts[section]}, got {len(response)}")
                    return False
            else:
                print(f"❌ {section.title()}: Invalid response format")
                return False
                
        return True

    def test_invalid_section(self):
        """Test handling of invalid section"""
        success, response = self.run_test(
            "Invalid Section (invalid_section)",
            "GET",
            "quiz/questions/invalid_section",
            200
        )
        
        if success and 'error' in response:
            print("✅ Invalid section handled correctly")
        
        return success

    def test_submit_quiz(self):
        """Test submitting a complete quiz"""
        # Create sample answers for all sections
        sample_answers = []
        
        # Physics (30 questions) - mix of correct and incorrect
        for i in range(1, 31):
            sample_answers.append({
                "question_id": i,
                "section": "physics",
                "selected_answer": "A" if i <= 20 else "B"  # 20 correct, 10 wrong
            })
        
        # Chemistry (30 questions) - mix of correct and incorrect  
        for i in range(1, 31):
            sample_answers.append({
                "question_id": i,
                "section": "chemistry", 
                "selected_answer": "A" if i <= 15 else "C"  # 15 correct, 15 wrong
            })
        
        # English (10 questions) - mostly correct
        for i in range(1, 11):
            sample_answers.append({
                "question_id": i,
                "section": "english",
                "selected_answer": "B" if i <= 8 else "D"  # 8 correct, 2 wrong
            })
        
        # Logical Reasoning (20 questions) - half correct
        for i in range(1, 21):
            sample_answers.append({
                "question_id": i,
                "section": "logical",
                "selected_answer": "A" if i <= 10 else "D"  # 10 correct, 10 wrong
            })
        
        # Mathematics (40 questions) - mostly correct
        for i in range(1, 41):
            sample_answers.append({
                "question_id": i,
                "section": "mathematics",
                "selected_answer": "A" if i <= 30 else "C"  # 30 correct, 10 wrong
            })
        
        success, response = self.run_test(
            "Submit Complete BITSAT Quiz",
            "POST",
            "quiz/submit",
            200,
            data={
                "answers": sample_answers,
                "time_taken": 7200  # 2 hours
            }
        )
        
        if success:
            required_fields = ['id', 'sections', 'total_marks', 'max_marks', 'percentage', 'time_taken']
            if all(field in response for field in required_fields):
                if (response['max_marks'] == 390 and 
                    len(response['sections']) == 5):
                    print("✅ Quiz submission works correctly")
                    print(f"   Total marks: {response['total_marks']}/{response['max_marks']}")
                    print(f"   Percentage: {response['percentage']:.2f}%")
                    print(f"   Time taken: {response['time_taken']} seconds")
                    
                    # Check section results
                    for section in response['sections']:
                        print(f"   {section['section_name']}: {section['correct']}/{section['total_questions']} correct, {section['marks']} marks")
                        
                else:
                    print(f"❌ Quiz result structure issue: {response}")
                    return False
            else:
                print(f"❌ Missing fields in quiz result: {response}")
                return False
                
        return success

    def test_get_correct_answers(self):
        """Test getting correct answers (for results review)"""
        success, response = self.run_test(
            "Get Correct Answers",
            "GET",
            "quiz/correct-answers",
            200
        )
        
        if success and isinstance(response, dict):
            # Check all sections are present
            for section in self.sections:
                if section in response:
                    answers = response[section]
                    expected_counts = {
                        "physics": 30, "chemistry": 30, "english": 10,
                        "logical": 20, "mathematics": 40
                    }
                    
                    if len(answers) == expected_counts[section]:
                        print(f"✅ {section.title()}: {len(answers)} correct answers")
                    else:
                        print(f"❌ {section.title()}: Expected {expected_counts[section]} answers, got {len(answers)}")
                        return False
                else:
                    print(f"❌ Missing correct answers for {section}")
                    return False
        
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
    print("🧪 Starting BITSAT Mock Test API Tests")
    print("=" * 50)
    
    tester = BITSATMockTestAPITester()
    
    # Run all tests
    test_results = []
    
    test_results.append(tester.test_root_endpoint())
    test_results.append(tester.test_get_sections())
    test_results.append(tester.test_get_all_questions())
    test_results.append(tester.test_get_section_questions())
    test_results.append(tester.test_submit_quiz())
    test_results.append(tester.test_get_correct_answers())
    
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