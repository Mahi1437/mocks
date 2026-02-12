import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { ChevronLeft, ChevronRight, Lightbulb, Check, X, RotateCcw, Trophy } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/quiz/questions`);
      setQuestions(response.data);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching questions:", e);
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (option) => {
    if (correctAnswers[currentQuestion + 1] !== undefined) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion + 1]: option
    });

    try {
      const response = await axios.post(`${API}/quiz/check-answer`, {
        question_id: currentQuestion + 1,
        selected_answer: option
      });
      
      setCorrectAnswers({
        ...correctAnswers,
        [currentQuestion + 1]: response.data.correct_answer
      });

      if (response.data.is_correct) {
        setScore(score + 1);
      }
    } catch (e) {
      console.error("Error checking answer:", e);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const answers = Object.entries(selectedAnswers).map(([qId, answer]) => ({
        question_id: parseInt(qId),
        selected_answer: answer
      }));

      const response = await axios.post(`${API}/quiz/submit`, { answers });
      setQuizResult(response.data);
      setQuizCompleted(true);
    } catch (e) {
      console.error("Error submitting quiz:", e);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowHint(false);
    setScore(0);
    setCorrectAnswers({});
    setQuizCompleted(false);
    setQuizResult(null);
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowHint(false);
  };

  if (loading) {
    return (
      <div className="quiz-container" data-testid="loading-screen">
        <div className="loading-spinner">Loading questions...</div>
      </div>
    );
  }

  if (quizCompleted && quizResult) {
    return (
      <div className="quiz-container" data-testid="results-screen">
        <div className="results-card">
          <div className="results-header">
            <Trophy className="trophy-icon" />
            <h1>Quiz Completed!</h1>
          </div>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number" data-testid="final-score">{quizResult.correct_answers}</span>
              <span className="score-total">/ {quizResult.total_questions}</span>
            </div>
            <p className="score-percentage" data-testid="score-percentage">{quizResult.score_percentage.toFixed(1)}%</p>
          </div>
          <div className="results-summary">
            <h3>Answer Summary</h3>
            <div className="answer-list">
              {quizResult.answers.map((answer, index) => (
                <div key={index} className={`answer-item ${answer.is_correct ? 'correct' : 'incorrect'}`}>
                  <span className="question-num">Q{answer.question_id}</span>
                  <span className="answer-status">
                    {answer.is_correct ? <Check size={16} /> : <X size={16} />}
                  </span>
                  <span className="your-answer">Your: {answer.selected_answer}</span>
                  {!answer.is_correct && (
                    <span className="correct-answer">Correct: {answer.correct_answer}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button className="restart-btn" onClick={handleRestart} data-testid="restart-btn">
            <RotateCcw size={18} />
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion + 1];
  const correctAnswer = correctAnswers[currentQuestion + 1];
  const isAnswered = correctAnswer !== undefined;
  const allAnswered = Object.keys(correctAnswers).length === questions.length;

  return (
    <div className="quiz-container" data-testid="quiz-container">
      {/* Sidebar Navigation */}
      <div className="sidebar" data-testid="question-sidebar">
        <div className="sidebar-header">
          <h3>Questions</h3>
        </div>
        <div className="question-nav">
          {questions.map((q, index) => {
            const qCorrect = correctAnswers[index + 1];
            const qSelected = selectedAnswers[index + 1];
            let statusClass = '';
            if (qCorrect !== undefined) {
              statusClass = qCorrect === qSelected ? 'answered-correct' : 'answered-incorrect';
            } else if (qSelected) {
              statusClass = 'selected';
            }
            
            return (
              <button
                key={index}
                className={`nav-item ${currentQuestion === index ? 'active' : ''} ${statusClass}`}
                onClick={() => goToQuestion(index)}
                data-testid={`nav-question-${index + 1}`}
              >
                <span className="nav-number">{String(index + 1).padStart(2, '0')}.</span>
                <span className="nav-label">Question {index + 1}</span>
                {qCorrect !== undefined && (
                  <span className="nav-status">
                    {qCorrect === qSelected ? <Check size={14} /> : <X size={14} />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="main-content">
        {/* Header */}
        <div className="quiz-header">
          <div className="progress-info">
            <span className="progress-text" data-testid="progress-indicator">{currentQuestion + 1} / {questions.length}</span>
          </div>
          <div className="score-display-header">
            <span className="score-label">Score:</span>
            <span className="score-value" data-testid="current-score">{score}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card" data-testid="question-card">
          <div className="question-number">
            <span>{currentQuestion + 1}.</span>
          </div>
          <div className="question-text" data-testid="question-text">
            {question?.question}
          </div>

          {/* Question Image */}
          {question?.image && (
            <div className="question-image">
              <img src={question.image} alt="Question illustration" data-testid="question-image" />
            </div>
          )}

          {/* Options */}
          <div className="options-container">
            {question && Object.entries(question.options).map(([key, value]) => {
              let optionClass = 'option-btn';
              if (isAnswered) {
                if (key === correctAnswer) {
                  optionClass += ' correct';
                } else if (key === selectedAnswer && key !== correctAnswer) {
                  optionClass += ' incorrect';
                }
              } else if (key === selectedAnswer) {
                optionClass += ' selected';
              }

              return (
                <button
                  key={key}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={isAnswered}
                  data-testid={`option-${key}`}
                >
                  <span className="option-letter">{key}.</span>
                  <span className="option-text">{value}</span>
                  {isAnswered && key === correctAnswer && <Check className="option-icon correct" />}
                  {isAnswered && key === selectedAnswer && key !== correctAnswer && <X className="option-icon incorrect" />}
                </button>
              );
            })}
          </div>

          {/* Hint Section */}
          <div className="hint-section">
            <button 
              className="hint-btn" 
              onClick={() => setShowHint(!showHint)}
              data-testid="show-hint-btn"
            >
              <Lightbulb size={18} />
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            {showHint && (
              <div className="hint-content" data-testid="hint-content">
                <Lightbulb className="hint-icon" />
                <p>{question?.hint}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          <button 
            className="nav-btn prev-btn" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            data-testid="prev-btn"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button 
              className="nav-btn submit-btn" 
              onClick={handleSubmitQuiz}
              disabled={!allAnswered}
              data-testid="submit-btn"
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              className="nav-btn next-btn" 
              onClick={handleNext}
              data-testid="next-btn"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
