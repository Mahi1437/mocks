import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  ChevronLeft, ChevronRight, Check, X, RotateCcw, 
  Trophy, Clock, Flag, Trash2, Sun, Moon, BookOpen, Brain,
  Calculator, FlaskConical, Atom, Languages, Home, FileText,
  Award, Maximize, Minimize, AlertTriangle, Pause, Play,
  Eye, EyeOff, BarChart2, Download, Share2, CheckCircle,
  Circle, Square, Bookmark, RefreshCw, Volume2, VolumeX,
  Settings, HelpCircle, List, Grid, Timer, Target, Zap
} from "lucide-react";
import "./AdvancedMockTest.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock Tests Configuration
const MOCK_TESTS_CONFIG = {
  bitsat: {
    id: "bitsat",
    name: "BITSAT Mock Test",
    fullName: "BITSAT Mock Test 2025",
    institution: "Birla Institute of Technology and Science",
    description: "Birla Institute of Technology and Science Admission Test",
    questions: 130,
    duration: "3 hours",
    durationSeconds: 180 * 60,
    maxMarks: 390,
    color: "#2563eb",
    available: true,
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/1200px-BITS_Pilani-Logo.svg.png",
    markingScheme: { correct: 3, wrong: -1, unattempted: 0 },
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 30, timeLimit: 36 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 30, timeLimit: 36 },
      { id: "english", name: "English Proficiency", icon: "Languages", questions: 10, timeLimit: 12 },
      { id: "logical", name: "Logical Reasoning", icon: "Brain", questions: 20, timeLimit: 24 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 40, timeLimit: 72 }
    ]
  },
  viteee: {
    id: "viteee",
    name: "VITEEE Mock Test",
    fullName: "VITEEE Mock Test 2025",
    institution: "Vellore Institute of Technology",
    description: "VIT Engineering Entrance Examination",
    questions: 125,
    duration: "2.5 hours",
    durationSeconds: 150 * 60,
    maxMarks: 375,
    color: "#059669",
    available: true,
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Vellore_Institute_of_Technology_seal_2017.svg/1200px-Vellore_Institute_of_Technology_seal_2017.svg.png",
    markingScheme: { correct: 3, wrong: 0, unattempted: 0 },
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 35, timeLimit: 42 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 35, timeLimit: 42 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 40, timeLimit: 48 },
      { id: "aptitude", name: "Aptitude", icon: "Brain", questions: 15, timeLimit: 18 }
    ]
  },
  srmjeee: {
    id: "srmjeee",
    name: "SRMJEEE Mock Test",
    fullName: "SRMJEEE Mock Test 2025",
    institution: "SRM Institute of Science and Technology",
    description: "SRM Joint Engineering Entrance Examination",
    questions: 125,
    duration: "2.5 hours",
    durationSeconds: 150 * 60,
    maxMarks: 375,
    color: "#dc2626",
    available: true,
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/SRMSEAL.png/220px-SRMSEAL.png",
    markingScheme: { correct: 3, wrong: -1, unattempted: 0 },
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 35, timeLimit: 42 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 35, timeLimit: 42 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 35, timeLimit: 42 },
      { id: "english", name: "English", icon: "Languages", questions: 10, timeLimit: 12 },
      { id: "aptitude", name: "Aptitude", icon: "Brain", questions: 10, timeLimit: 12 }
    ]
  },
  aeee: {
    id: "aeee",
    name: "AEEE Mock Test",
    fullName: "AEEE Mock Test 2025",
    institution: "Amrita Vishwa Vidyapeetham",
    description: "Amrita Engineering Entrance Examination",
    questions: 100,
    duration: "2 hours",
    durationSeconds: 120 * 60,
    maxMarks: 300,
    color: "#7c3aed",
    available: true,
    logo: "https://upload.wikimedia.org/wikipedia/en/2/21/Amrita-vishwa-vidyapeetham-color-logo.png",
    markingScheme: { correct: 3, wrong: -1, unattempted: 0 },
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 30, timeLimit: 40 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 30, timeLimit: 40 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 40, timeLimit: 40 }
    ]
  }
};

const ICON_MAP = {
  Atom: Atom,
  FlaskConical: FlaskConical,
  Calculator: Calculator,
  Brain: Brain,
  Languages: Languages
};

// Question Status Types
const QUESTION_STATUS = {
  NOT_VISITED: 'not_visited',
  NOT_ANSWERED: 'not_answered',
  ANSWERED: 'answered',
  MARKED: 'marked',
  ANSWERED_MARKED: 'answered_marked'
};

// ==================== ADVANCED MOCK TEST COMPONENT ====================
export default function AdvancedMockTest({ darkMode, setDarkMode, testId: propTestId }) {
  const { testId: paramTestId } = useParams();
  const testId = propTestId || paramTestId;
  const navigate = useNavigate();
  const testConfig = MOCK_TESTS_CONFIG[testId];
  
  // Core Quiz States
  const [currentPage, setCurrentPage] = useState("instructions"); // instructions, quiz, results
  const [allQuestions, setAllQuestions] = useState({});
  const [currentSection, setCurrentSection] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [questionTimings, setQuestionTimings] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Timer States
  const [timeRemaining, setTimeRemaining] = useState(testConfig?.durationSeconds || 180 * 60);
  const [sectionTimes, setSectionTimes] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // UI States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // single, all
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Refs
  const questionStartTime = useRef(Date.now());
  const timerRef = useRef(null);

  // Initialize
  useEffect(() => {
    if (testConfig?.sections?.length > 0) {
      setCurrentSection(testConfig.sections[0].id);
      // Initialize section times
      const times = {};
      testConfig.sections.forEach(s => {
        times[s.id] = s.timeLimit * 60;
      });
      setSectionTimes(times);
    }
  }, [testConfig]);

  // Mark current question as visited
  useEffect(() => {
    if (currentPage === 'quiz' && currentSection) {
      const key = `${currentSection}-${currentQuestion + 1}`;
      if (!visitedQuestions[key]) {
        setVisitedQuestions(prev => ({ ...prev, [key]: true }));
      }
      questionStartTime.current = Date.now();
    }
  }, [currentSection, currentQuestion, currentPage]);

  // Timer
  useEffect(() => {
    if (currentPage !== "quiz" || isPaused) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitQuiz();
          return 0;
        }
        // Warning at 10 minutes and 5 minutes
        if (prev === 600 || prev === 300) {
          setShowWarning(true);
          if (soundEnabled) playWarningSound();
          setTimeout(() => setShowWarning(false), 5000);
        }
        return prev - 1;
      });
      
      // Update section time
      setSectionTimes(prev => ({
        ...prev,
        [currentSection]: Math.max(0, (prev[currentSection] || 0) - 1)
      }));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentPage, isPaused, currentSection, soundEnabled]);

  // Fullscreen handlers
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  // Sound effect
  const playWarningSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+Onp+XjHdqa3eGlaGfkoBwZmx4iJqpqZ6MdGNkb4CUpayjk31qYWl2iJuqq6KPe2hjaHaHmKioo5F9a2RpdoeYp6iikX1rZGl2h5inqKKRfWtkaXaHmKeoopF9a2RpdoeYp6iikX1rZGl2h5inqKKRfWtkaXaHmKeoopF9a2RpdoeYp6iikX0=');
    audio.play().catch(() => {});
  };

  // Fetch questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/quiz/all-questions`);
      setAllQuestions(response.data);
      setLoading(false);
      return true;
    } catch (e) {
      console.error("Error fetching questions:", e);
      setLoading(false);
      return false;
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBeginQuiz = async () => {
    const success = await fetchQuestions();
    if (success) {
      setCurrentPage("quiz");
      setTimeRemaining(testConfig?.durationSeconds || 180 * 60);
    }
  };

  // Record time spent on current question before moving
  const recordQuestionTime = () => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    setQuestionTimings(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + timeSpent
    }));
    questionStartTime.current = Date.now();
  };

  const handleAnswerSelect = (option) => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    setSelectedAnswers(prev => ({ ...prev, [key]: option }));
  };

  const handleClearResponse = () => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[key];
      return newAnswers;
    });
  };

  const handleMarkForReview = () => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    setMarkedForReview(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAndNext = () => {
    recordQuestionTime();
    const questions = allQuestions[currentSection] || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to next section
      const currentIndex = testConfig.sections.findIndex(s => s.id === currentSection);
      if (currentIndex < testConfig.sections.length - 1) {
        setCurrentSection(testConfig.sections[currentIndex + 1].id);
        setCurrentQuestion(0);
      }
    }
  };

  const handleMarkAndNext = () => {
    handleMarkForReview();
    handleSaveAndNext();
  };

  const handlePrevious = () => {
    recordQuestionTime();
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (sectionId, index) => {
    recordQuestionTime();
    if (sectionId !== currentSection) {
      setCurrentSection(sectionId);
    }
    setCurrentQuestion(index);
  };

  const handleSectionChange = (sectionId) => {
    recordQuestionTime();
    setCurrentSection(sectionId);
    setCurrentQuestion(0);
  };

  const handleSubmitQuiz = async () => {
    recordQuestionTime();
    
    try {
      const answers = Object.entries(selectedAnswers).map(([key, answer]) => {
        const [section, qId] = key.split('-');
        return { question_id: parseInt(qId), section: section, selected_answer: answer };
      });

      const timeTaken = (testConfig?.durationSeconds || 180 * 60) - timeRemaining;
      
      const response = await axios.post(`${API}/quiz/submit`, { answers, time_taken: timeTaken });
      
      // Enhance result with additional analytics
      const enhancedResult = {
        ...response.data,
        questionTimings,
        totalTimeTaken: timeTaken,
        attemptedQuestions: Object.keys(selectedAnswers).length,
        markedQuestions: Object.keys(markedForReview).filter(k => markedForReview[k]).length,
        accuracy: response.data.sections.reduce((sum, s) => sum + s.correct, 0) / 
                  Math.max(1, response.data.sections.reduce((sum, s) => sum + s.attempted, 0)) * 100
      };
      
      setQuizResult(enhancedResult);
      setCurrentPage("results");
      setShowConfirmSubmit(false);
    } catch (e) {
      console.error("Error submitting quiz:", e);
    }
  };

  const handleRestart = () => {
    setCurrentSection(testConfig?.sections?.[0]?.id || "physics");
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setVisitedQuestions({});
    setQuestionTimings({});
    setQuizResult(null);
    setTimeRemaining(testConfig?.durationSeconds || 180 * 60);
    setShowConfirmSubmit(false);
    setCurrentPage("instructions");
  };

  const getQuestionStatus = (sectionId, qIndex) => {
    const key = `${sectionId}-${qIndex + 1}`;
    const isAnswered = selectedAnswers[key] !== undefined;
    const isMarked = markedForReview[key];
    const isVisited = visitedQuestions[key];
    
    if (isMarked && isAnswered) return QUESTION_STATUS.ANSWERED_MARKED;
    if (isMarked) return QUESTION_STATUS.MARKED;
    if (isAnswered) return QUESTION_STATUS.ANSWERED;
    if (isVisited) return QUESTION_STATUS.NOT_ANSWERED;
    return QUESTION_STATUS.NOT_VISITED;
  };

  const getSectionStats = (sectionId) => {
    const questions = allQuestions[sectionId] || [];
    let answered = 0, marked = 0, notAnswered = 0, notVisited = 0;
    
    questions.forEach((_, index) => {
      const status = getQuestionStatus(sectionId, index);
      if (status === QUESTION_STATUS.ANSWERED || status === QUESTION_STATUS.ANSWERED_MARKED) answered++;
      if (status === QUESTION_STATUS.MARKED || status === QUESTION_STATUS.ANSWERED_MARKED) marked++;
      if (status === QUESTION_STATUS.NOT_ANSWERED) notAnswered++;
      if (status === QUESTION_STATUS.NOT_VISITED) notVisited++;
    });
    
    return { total: questions.length, answered, marked, notAnswered, notVisited };
  };

  const getTotalStats = () => {
    let totalAnswered = 0, totalMarked = 0, totalNotAnswered = 0, totalNotVisited = 0, totalQuestions = 0;
    
    testConfig?.sections?.forEach(section => {
      const stats = getSectionStats(section.id);
      totalAnswered += stats.answered;
      totalMarked += stats.marked;
      totalNotAnswered += stats.notAnswered;
      totalNotVisited += stats.notVisited;
      totalQuestions += stats.total;
    });
    
    return { totalQuestions, totalAnswered, totalMarked, totalNotAnswered, totalNotVisited };
  };

  // If test not found
  if (!testConfig) {
    return (
      <div className={`advanced-test-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="not-found-page">
          <AlertTriangle size={64} />
          <h1>Test Not Found</h1>
          <p>The mock test you're looking for doesn't exist.</p>
          <button className="primary-btn" onClick={() => navigate('/')}>
            <Home size={20} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ==================== INSTRUCTIONS PAGE ====================
  if (currentPage === "instructions") {
    return (
      <div className={`advanced-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="instructions-screen">
        <div className="instructions-screen">
          <header className="instructions-header">
            <div className="header-left">
              <img src={testConfig.logo} alt={testConfig.name} className="test-logo" />
              <div>
                <h1>{testConfig.fullName}</h1>
                <p>{testConfig.institution}</p>
              </div>
            </div>
            <div className="header-right">
              <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          <div className="instructions-content">
            <div className="test-overview">
              <h2>Test Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <Clock size={28} />
                  <div>
                    <span className="value">{testConfig.duration}</span>
                    <span className="label">Duration</span>
                  </div>
                </div>
                <div className="overview-card">
                  <FileText size={28} />
                  <div>
                    <span className="value">{testConfig.questions}</span>
                    <span className="label">Questions</span>
                  </div>
                </div>
                <div className="overview-card">
                  <Trophy size={28} />
                  <div>
                    <span className="value">{testConfig.maxMarks}</span>
                    <span className="label">Max Marks</span>
                  </div>
                </div>
                <div className="overview-card">
                  <Target size={28} />
                  <div>
                    <span className="value">{testConfig.sections.length}</span>
                    <span className="label">Sections</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sections-breakdown">
              <h2>Sections Breakdown</h2>
              <div className="sections-table">
                <div className="table-header-row">
                  <span>Section</span>
                  <span>Questions</span>
                  <span>Time (approx)</span>
                </div>
                {testConfig.sections.map((section, index) => {
                  const IconComponent = ICON_MAP[section.icon];
                  return (
                    <div key={section.id} className="table-row">
                      <span className="section-name">
                        {IconComponent && <IconComponent size={18} />}
                        {section.name}
                      </span>
                      <span>{section.questions}</span>
                      <span>{section.timeLimit} min</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="marking-scheme">
              <h2>Marking Scheme</h2>
              <div className="scheme-grid">
                <div className="scheme-item correct">
                  <Check size={24} />
                  <span>Correct Answer: +{testConfig.markingScheme.correct}</span>
                </div>
                <div className="scheme-item wrong">
                  <X size={24} />
                  <span>Wrong Answer: {testConfig.markingScheme.wrong}</span>
                </div>
                <div className="scheme-item neutral">
                  <Circle size={24} />
                  <span>Unattempted: {testConfig.markingScheme.unattempted}</span>
                </div>
              </div>
            </div>

            <div className="instructions-list">
              <h2>Important Instructions</h2>
              <ul>
                <li>The test contains <strong>{testConfig.questions} questions</strong> divided into <strong>{testConfig.sections.length} sections</strong>.</li>
                <li>Total duration is <strong>{testConfig.duration}</strong>. Timer starts when you begin the test.</li>
                <li>You can navigate between sections and questions freely during the test.</li>
                <li>Use the <strong>"Mark for Review"</strong> feature to flag questions you want to revisit.</li>
                <li>Your progress is saved automatically. You can submit anytime or wait for the timer to end.</li>
                <li>Each correct answer awards <strong>+{testConfig.markingScheme.correct} marks</strong>.</li>
                {testConfig.markingScheme.wrong < 0 && (
                  <li>Each incorrect answer deducts <strong>{Math.abs(testConfig.markingScheme.wrong)} mark</strong> (negative marking).</li>
                )}
                <li>Click on <strong>"Submit Test"</strong> to finish and view your results.</li>
              </ul>
            </div>

            <div className="legend-preview">
              <h2>Question Palette Legend</h2>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-dot not-visited"></span>
                  <span>Not Visited</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot not-answered"></span>
                  <span>Not Answered</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot answered"></span>
                  <span>Answered</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot marked"></span>
                  <span>Marked for Review</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot answered-marked"></span>
                  <span>Answered & Marked</span>
                </div>
              </div>
            </div>

            <div className="instructions-actions">
              <button className="back-btn" onClick={() => navigate('/')}>
                <ChevronLeft size={20} /> Back to Home
              </button>
              <button 
                className="start-btn" 
                onClick={handleBeginQuiz}
                data-testid="begin-test-btn"
                style={{background: `linear-gradient(135deg, ${testConfig.color} 0%, #8b5cf6 100%)`}}
              >
                Begin Test <Zap size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULTS PAGE ====================
  if (currentPage === "results" && quizResult) {
    const avgTimePerQuestion = quizResult.totalTimeTaken / Math.max(1, quizResult.attemptedQuestions);
    
    return (
      <div className={`advanced-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="results-screen">
        <div className="results-screen">
          <header className="results-header">
            <div className="header-left">
              <img src={testConfig.logo} alt={testConfig.name} className="test-logo-small" />
              <h2>{testConfig.name} - Results</h2>
            </div>
            <div className="header-right">
              <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          <div className="results-content">
            {/* Score Overview */}
            <div className="score-overview">
              <div className="score-main-card">
                <div className="score-circle" style={{borderColor: testConfig.color}}>
                  <span className="score-number" style={{color: testConfig.color}}>{quizResult.total_marks}</span>
                  <span className="score-max">/ {quizResult.max_marks}</span>
                </div>
                <div className="score-percentage">
                  <span className="percentage-value">{quizResult.percentage.toFixed(1)}%</span>
                  <span className="percentage-label">Score</span>
                </div>
              </div>

              <div className="score-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon correct"><CheckCircle size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{quizResult.sections.reduce((sum, s) => sum + s.correct, 0)}</span>
                    <span className="stat-label">Correct</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon wrong"><X size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{quizResult.sections.reduce((sum, s) => sum + s.wrong, 0)}</span>
                    <span className="stat-label">Incorrect</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon skipped"><Circle size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{testConfig.questions - quizResult.attemptedQuestions}</span>
                    <span className="stat-label">Skipped</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon time"><Clock size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{formatTime(quizResult.totalTimeTaken)}</span>
                    <span className="stat-label">Time Taken</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="performance-analysis">
              <h3><BarChart2 size={20} /> Performance Analysis</h3>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <span className="analysis-label">Accuracy</span>
                  <div className="analysis-bar">
                    <div className="bar-fill" style={{width: `${quizResult.accuracy.toFixed(0)}%`, background: testConfig.color}}></div>
                  </div>
                  <span className="analysis-value">{quizResult.accuracy.toFixed(1)}%</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Attempt Rate</span>
                  <div className="analysis-bar">
                    <div className="bar-fill" style={{width: `${(quizResult.attemptedQuestions / testConfig.questions * 100).toFixed(0)}%`, background: '#10b981'}}></div>
                  </div>
                  <span className="analysis-value">{(quizResult.attemptedQuestions / testConfig.questions * 100).toFixed(1)}%</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Avg Time/Question</span>
                  <span className="analysis-value single">{avgTimePerQuestion.toFixed(0)}s</span>
                </div>
              </div>
            </div>

            {/* Section-wise Results */}
            <div className="section-results">
              <h3><Target size={20} /> Section-wise Performance</h3>
              <div className="section-results-table">
                <div className="table-header">
                  <span>Section</span>
                  <span>Questions</span>
                  <span>Attempted</span>
                  <span>Correct</span>
                  <span>Wrong</span>
                  <span>Marks</span>
                  <span>Accuracy</span>
                </div>
                {quizResult.sections.map((section, index) => {
                  const sectionAccuracy = section.attempted > 0 ? (section.correct / section.attempted * 100) : 0;
                  return (
                    <div key={index} className="table-row">
                      <span className="section-name">{section.section_name}</span>
                      <span>{section.total_questions}</span>
                      <span>{section.attempted}</span>
                      <span className="correct">{section.correct}</span>
                      <span className="wrong">{section.wrong}</span>
                      <span className="marks">{section.marks}</span>
                      <span className={`accuracy ${sectionAccuracy >= 70 ? 'good' : sectionAccuracy >= 40 ? 'avg' : 'poor'}`}>
                        {sectionAccuracy.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
                <div className="table-row total">
                  <span>Total</span>
                  <span>{testConfig.questions}</span>
                  <span>{quizResult.attemptedQuestions}</span>
                  <span className="correct">{quizResult.sections.reduce((sum, s) => sum + s.correct, 0)}</span>
                  <span className="wrong">{quizResult.sections.reduce((sum, s) => sum + s.wrong, 0)}</span>
                  <span className="marks">{quizResult.total_marks}</span>
                  <span>{quizResult.accuracy.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="results-actions">
              <button className="action-btn secondary" onClick={() => navigate('/')}>
                <Home size={18} /> Back to Home
              </button>
              <button 
                className="action-btn primary" 
                onClick={handleRestart}
                style={{background: `linear-gradient(135deg, ${testConfig.color} 0%, #8b5cf6 100%)`}}
              >
                <RotateCcw size={18} /> Retake Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== QUIZ PAGE ====================
  const questions = allQuestions[currentSection] || [];
  const question = questions[currentQuestion];
  const currentKey = `${currentSection}-${currentQuestion + 1}`;
  const selectedAnswer = selectedAnswers[currentKey];
  const isMarked = markedForReview[currentKey];
  const totalStats = getTotalStats();

  if (loading || questions.length === 0) {
    return (
      <div className={`advanced-test-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading {testConfig.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`advanced-test-container ${darkMode ? 'dark' : 'light'} ${isFullScreen ? 'fullscreen' : ''}`} data-testid="quiz-screen">
      {/* Warning Toast */}
      {showWarning && (
        <div className="warning-toast">
          <AlertTriangle size={24} />
          <span>
            {timeRemaining === 600 ? '10 minutes remaining!' : 
             timeRemaining === 300 ? '5 minutes remaining!' : 
             'Time is running out!'}
          </span>
        </div>
      )}

      {/* Header */}
      <header className="quiz-header">
        <div className="header-left">
          <img src={testConfig.logo} alt={testConfig.name} className="test-logo-small" />
          <span className="test-name">{testConfig.name}</span>
        </div>
        
        <div className="header-center">
          <div className={`main-timer ${timeRemaining < 600 ? 'warning' : ''}`} data-testid="main-timer">
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-btn" onClick={() => setSoundEnabled(!soundEnabled)} title="Toggle Sound">
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="icon-btn" onClick={toggleFullScreen} title="Toggle Fullscreen">
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn" onClick={() => setShowQuestionPalette(!showQuestionPalette)} title="Toggle Palette">
            {showQuestionPalette ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="section-tabs-container">
        <div className="section-tabs">
          {testConfig.sections.map(section => {
            const stats = getSectionStats(section.id);
            const IconComponent = ICON_MAP[section.icon];
            return (
              <button
                key={section.id}
                className={`section-tab ${currentSection === section.id ? 'active' : ''}`}
                onClick={() => handleSectionChange(section.id)}
                data-testid={`section-tab-${section.id}`}
              >
                {IconComponent && <IconComponent size={16} />}
                <span className="tab-name">{section.name}</span>
                <span className="tab-progress">{stats.answered}/{stats.total}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Body */}
      <div className="quiz-body">
        {/* Question Panel */}
        <div className="question-panel">
          {/* Question Header */}
          <div className="question-header">
            <div className="question-info">
              <span className="question-number">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="section-badge" style={{background: testConfig.color}}>
                {testConfig.sections.find(s => s.id === currentSection)?.name}
              </span>
            </div>
            <div className="question-actions">
              <button 
                className={`action-btn ${isMarked ? 'marked' : ''}`} 
                onClick={handleMarkForReview}
                title="Mark for Review"
              >
                <Flag size={16} />
                {isMarked ? 'Marked' : 'Mark'}
              </button>
              <button 
                className="action-btn clear" 
                onClick={handleClearResponse}
                disabled={!selectedAnswer}
                title="Clear Response"
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <p className="question-text">{question?.question}</p>
            
            <div className="options-container">
              {question && Object.entries(question.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`option-btn ${selectedAnswer === key ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(key)}
                  data-testid={`option-${key}`}
                >
                  <span className="option-key">{key}</span>
                  <span className="option-text">{value}</span>
                  {selectedAnswer === key && <Check className="check-icon" size={18} />}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="question-navigation">
            <button 
              className="nav-btn prev" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft size={20} /> Previous
            </button>
            
            <div className="nav-center">
              <button 
                className="nav-btn mark-next"
                onClick={handleMarkAndNext}
              >
                <Flag size={18} /> Mark & Next
              </button>
            </div>
            
            <button 
              className="nav-btn next"
              onClick={handleSaveAndNext}
              style={{background: testConfig.color}}
            >
              Save & Next <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Question Palette */}
        {showQuestionPalette && (
          <div className="question-palette">
            <div className="palette-header">
              <h3>Question Palette</h3>
              <span className="answered-count">
                {totalStats.totalAnswered}/{totalStats.totalQuestions} Answered
              </span>
            </div>

            {/* Legend */}
            <div className="palette-legend">
              <div className="legend-row">
                <span className="legend-item"><span className="dot not-visited"></span> Not Visited</span>
                <span className="legend-item"><span className="dot not-answered"></span> Not Answered</span>
              </div>
              <div className="legend-row">
                <span className="legend-item"><span className="dot answered"></span> Answered</span>
                <span className="legend-item"><span className="dot marked"></span> Marked</span>
              </div>
              <div className="legend-row">
                <span className="legend-item"><span className="dot answered-marked"></span> Answered & Marked</span>
              </div>
            </div>

            {/* Section Questions */}
            <div className="palette-sections">
              {testConfig.sections.map(section => {
                const sectionQuestions = allQuestions[section.id] || [];
                const stats = getSectionStats(section.id);
                return (
                  <div key={section.id} className={`palette-section ${currentSection === section.id ? 'active' : ''}`}>
                    <div className="section-header" onClick={() => handleSectionChange(section.id)}>
                      <span>{section.name}</span>
                      <span className="section-stats">{stats.answered}/{stats.total}</span>
                    </div>
                    {currentSection === section.id && (
                      <div className="question-grid">
                        {sectionQuestions.map((_, index) => {
                          const status = getQuestionStatus(section.id, index);
                          return (
                            <button
                              key={index}
                              className={`q-btn ${status} ${currentQuestion === index && currentSection === section.id ? 'current' : ''}`}
                              onClick={() => goToQuestion(section.id, index)}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <button 
              className="submit-btn"
              onClick={() => setShowConfirmSubmit(true)}
              data-testid="submit-test-btn"
            >
              Submit Test
            </button>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <AlertTriangle size={32} className="warning-icon" />
              <h3>Submit Test?</h3>
            </div>
            
            <div className="modal-stats">
              <div className="stat-row">
                <span>Total Questions</span>
                <span className="value">{totalStats.totalQuestions}</span>
              </div>
              <div className="stat-row answered">
                <span>Answered</span>
                <span className="value">{totalStats.totalAnswered}</span>
              </div>
              <div className="stat-row">
                <span>Not Answered</span>
                <span className="value">{totalStats.totalNotAnswered}</span>
              </div>
              <div className="stat-row">
                <span>Not Visited</span>
                <span className="value">{totalStats.totalNotVisited}</span>
              </div>
              <div className="stat-row marked">
                <span>Marked for Review</span>
                <span className="value">{totalStats.totalMarked}</span>
              </div>
            </div>

            {totalStats.totalNotAnswered + totalStats.totalNotVisited > 0 && (
              <p className="warning-text">
                You have {totalStats.totalNotAnswered + totalStats.totalNotVisited} unanswered questions. 
                Are you sure you want to submit?
              </p>
            )}

            <div className="modal-actions">
              <button className="btn cancel" onClick={() => setShowConfirmSubmit(false)}>
                Cancel
              </button>
              <button className="btn confirm" onClick={handleSubmitQuiz}>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
