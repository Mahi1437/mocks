# Mock Test Platform PRD

## Original Problem Statement
Create a comprehensive Mock Test Application platform with multiple entrance exams including BITSAT, Skill Test, VITEEE, SRMJEEE, and AEEE. Each test should have proper sections, question palette, timer, and results tracking.

## Architecture
- **Backend**: FastAPI Python server with quiz questions data
- **Frontend**: React application with professional exam interface
- **Database**: MongoDB (for storing quiz results)
- **Routing**: React Router DOM for multi-test navigation

## Platform Overview
A multi-test platform with homepage listing all available mock tests:
- BITSAT Mock Test (130 questions, 3 hours) - ✅ LIVE
- Skill Test (50 questions, 1 hour) - ✅ LIVE
- VITEEE Mock Test (125 questions, 2.5 hours) - Coming Soon
- SRMJEEE Mock Test (125 questions, 2.5 hours) - Coming Soon
- AEEE Mock Test (100 questions, 2 hours) - Coming Soon

---

## BITSAT Mock Test
- 5 Sections: Physics(30), Chemistry(30), English(10), Logical Reasoning(20), Mathematics(40)
- Total: 130 Questions | Maximum Marks: 390
- Marking: +3 correct, -1 wrong, 0 unattempted
- Duration: 3 hours (180 minutes)

## Skill Test (NEW - Feb 2025)
- 3 Sections: Aptitude(20), Reasoning(15), Verbal Ability(15)
- Total: 50 Questions | Maximum Marks: 150
- Marking: +3 correct, -1 wrong, 0 unattempted
- Duration: 1 hour (60 minutes)
- URL: /skilltest

---

## Core Features (All Tests)
- [x] Start screen with test info and instructions
- [x] Countdown timer with warning at 10 mins
- [x] Section tabs with progress tracking
- [x] Question display with 4 options (A, B, C, D)
- [x] Mark for Review functionality
- [x] Clear Response option
- [x] Previous/Next navigation
- [x] Question palette with status colors
- [x] Dark/Light theme toggle
- [x] Submit confirmation modal
- [x] Results page with section-wise breakdown
- [x] MongoDB result storage

## API Endpoints
### BITSAT APIs
- GET /api/quiz/sections - Section configuration
- GET /api/quiz/all-questions - All 130 questions
- POST /api/quiz/submit - Submit and calculate results

### Skill Test APIs  
- GET /api/skilltest/sections - Section configuration
- GET /api/skilltest/all-questions - All 50 questions
- POST /api/skilltest/submit - Submit and calculate results

## Testing Status (Feb 2025)
- Skill Test: ✅ Fully functional with database storage
- BITSAT: ✅ Fully functional
- Homepage: ✅ Shows all tests with proper routing

## Files Modified/Created
- `/app/frontend/src/App.js` - Added skilltest config and routing
- `/app/backend/server.py` - Added 50 skill test questions and APIs

## Next Tasks / Backlog
- P0: Implement bilingual test (Telugu/English) from Gemini links
- P1: Implement VITEEE, SRMJEEE, AEEE mock tests
- P1: College Predictor platform
- P2: User authentication for progress tracking
- P2: Leaderboard functionality
- P3: Question images support
