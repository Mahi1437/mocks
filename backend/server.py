from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Quiz Questions Data - Chemistry JEE Style
QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "Which one of the carbocations from the image is most stable?",
        "image": "https://www.gstatic.com/primer-edu/qdb/jee_licensed_edukriti_v5_992_prod.png",
        "options": {
            "A": "I",
            "B": "III",
            "C": "IV",
            "D": "II"
        },
        "correct_answer": "B",
        "hint": "Carbocation stability increases with resonance stabilization and hyperconjugation. Look for structures with electron-donating groups or resonance."
    },
    {
        "id": 2,
        "question": "Which of the following is the correct order of acidic strength?",
        "image": None,
        "options": {
            "A": "HClO₄ > HClO₃ > HClO₂ > HClO",
            "B": "HClO > HClO₂ > HClO₃ > HClO₄",
            "C": "HClO₂ > HClO₃ > HClO₄ > HClO",
            "D": "HClO₃ > HClO₄ > HClO > HClO₂"
        },
        "correct_answer": "A",
        "hint": "Acidic strength of oxyacids increases with the number of oxygen atoms attached to the central atom."
    },
    {
        "id": 3,
        "question": "The hybridization of carbon in CO₂ is:",
        "image": None,
        "options": {
            "A": "sp",
            "B": "sp²",
            "C": "sp³",
            "D": "sp³d"
        },
        "correct_answer": "A",
        "hint": "Count the number of sigma bonds and lone pairs around the central carbon atom. CO₂ has a linear geometry."
    },
    {
        "id": 4,
        "question": "Which of the following compounds shows optical isomerism?",
        "image": None,
        "options": {
            "A": "2-butanol",
            "B": "1-propanol",
            "C": "2-propanol",
            "D": "methanol"
        },
        "correct_answer": "A",
        "hint": "Optical isomerism requires a chiral center - a carbon with four different groups attached."
    },
    {
        "id": 5,
        "question": "The IUPAC name of CH₃-CH=CH-CHO is:",
        "image": None,
        "options": {
            "A": "But-2-enal",
            "B": "But-3-enal",
            "C": "Crotonaldehyde",
            "D": "Butanal"
        },
        "correct_answer": "A",
        "hint": "In IUPAC nomenclature, the aldehyde group gets priority in numbering. Name the double bond position relative to the aldehyde."
    },
    {
        "id": 6,
        "question": "Which quantum number determines the shape of an orbital?",
        "image": None,
        "options": {
            "A": "Principal quantum number (n)",
            "B": "Azimuthal quantum number (l)",
            "C": "Magnetic quantum number (m)",
            "D": "Spin quantum number (s)"
        },
        "correct_answer": "B",
        "hint": "The azimuthal quantum number (l) defines the subshell and the shape: l=0 (s, spherical), l=1 (p, dumbbell), l=2 (d, cloverleaf)."
    },
    {
        "id": 7,
        "question": "The bond angle in NH₃ is approximately:",
        "image": None,
        "options": {
            "A": "109.5°",
            "B": "107°",
            "C": "104.5°",
            "D": "120°"
        },
        "correct_answer": "B",
        "hint": "NH₃ has a pyramidal shape due to one lone pair. The lone pair-bond pair repulsion reduces the bond angle from the tetrahedral angle."
    },
    {
        "id": 8,
        "question": "Which of the following is an example of a Lewis acid?",
        "image": None,
        "options": {
            "A": "NH₃",
            "B": "BF₃",
            "C": "H₂O",
            "D": "OH⁻"
        },
        "correct_answer": "B",
        "hint": "A Lewis acid is an electron pair acceptor. Look for species with empty orbitals or incomplete octets."
    },
    {
        "id": 9,
        "question": "The number of sigma and pi bonds in acetylene (C₂H₂) are respectively:",
        "image": None,
        "options": {
            "A": "3 and 2",
            "B": "2 and 3",
            "C": "4 and 1",
            "D": "2 and 2"
        },
        "correct_answer": "A",
        "hint": "In acetylene, there is a triple bond between the two carbons. A triple bond consists of one sigma and two pi bonds."
    },
    {
        "id": 10,
        "question": "Which of the following reactions is an example of nucleophilic substitution?",
        "image": None,
        "options": {
            "A": "Friedel-Crafts alkylation",
            "B": "Wurtz reaction",
            "C": "Hydrolysis of alkyl halides",
            "D": "Nitration of benzene"
        },
        "correct_answer": "C",
        "hint": "Nucleophilic substitution involves a nucleophile attacking a carbon bearing a leaving group. Hydrolysis of alkyl halides uses OH⁻ as the nucleophile."
    }
]


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    image: Optional[str]
    options: dict
    hint: str

class QuizAnswer(BaseModel):
    question_id: int
    selected_answer: str

class QuizResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    total_questions: int
    correct_answers: int
    score_percentage: float
    answers: List[dict]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubmitQuizRequest(BaseModel):
    answers: List[QuizAnswer]


# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Chemistry Quiz API"}

@api_router.get("/quiz/questions", response_model=List[QuizQuestion])
async def get_quiz_questions():
    """Get all quiz questions without correct answers"""
    questions = []
    for q in QUIZ_QUESTIONS:
        questions.append(QuizQuestion(
            id=q["id"],
            question=q["question"],
            image=q["image"],
            options=q["options"],
            hint=q["hint"]
        ))
    return questions

@api_router.get("/quiz/question/{question_id}", response_model=QuizQuestion)
async def get_single_question(question_id: int):
    """Get a single question by ID"""
    for q in QUIZ_QUESTIONS:
        if q["id"] == question_id:
            return QuizQuestion(
                id=q["id"],
                question=q["question"],
                image=q["image"],
                options=q["options"],
                hint=q["hint"]
            )
    return {"error": "Question not found"}

@api_router.post("/quiz/check-answer")
async def check_answer(answer: QuizAnswer):
    """Check if a single answer is correct"""
    for q in QUIZ_QUESTIONS:
        if q["id"] == answer.question_id:
            is_correct = q["correct_answer"] == answer.selected_answer
            return {
                "question_id": answer.question_id,
                "selected_answer": answer.selected_answer,
                "correct_answer": q["correct_answer"],
                "is_correct": is_correct
            }
    return {"error": "Question not found"}

@api_router.post("/quiz/submit", response_model=QuizResult)
async def submit_quiz(request: SubmitQuizRequest):
    """Submit all quiz answers and get final score"""
    correct_count = 0
    answer_details = []
    
    for answer in request.answers:
        for q in QUIZ_QUESTIONS:
            if q["id"] == answer.question_id:
                is_correct = q["correct_answer"] == answer.selected_answer
                if is_correct:
                    correct_count += 1
                answer_details.append({
                    "question_id": answer.question_id,
                    "question": q["question"],
                    "selected_answer": answer.selected_answer,
                    "correct_answer": q["correct_answer"],
                    "is_correct": is_correct
                })
                break
    
    total = len(QUIZ_QUESTIONS)
    score_percentage = (correct_count / total) * 100 if total > 0 else 0
    
    result = QuizResult(
        total_questions=total,
        correct_answers=correct_count,
        score_percentage=score_percentage,
        answers=answer_details
    )
    
    # Save result to database
    result_dict = result.model_dump()
    result_dict['timestamp'] = result_dict['timestamp'].isoformat()
    await db.quiz_results.insert_one(result_dict)
    
    return result

@api_router.get("/quiz/results", response_model=List[QuizResult])
async def get_quiz_results():
    """Get all quiz results"""
    results = await db.quiz_results.find({}, {"_id": 0}).to_list(100)
    for result in results:
        if isinstance(result['timestamp'], str):
            result['timestamp'] = datetime.fromisoformat(result['timestamp'])
    return results


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
