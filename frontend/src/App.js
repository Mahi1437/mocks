import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import "@/App.css";
import "./EmployeeSkillTest.css";
import axios from "axios";
import { 
  ChevronLeft, ChevronRight, Check, X, RotateCcw, 
  Trophy, Clock, Flag, Trash2, Sun, Moon, BookOpen, Brain,
  Calculator, FlaskConical, Atom, Languages, Home, FileText,
  Award, Users, Target, CheckCircle, Mail, Phone, MapPin,
  ArrowRight, Zap, Shield, TrendingUp
} from "lucide-react";
import EmployeeSkillTest from "./EmployeeSkillTest";
import AdvancedMockTest from "./components/AdvancedMockTest";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock Tests Configuration
const MOCK_TESTS_CONFIG = {
  skilltest: {
    id: "skilltest",
    name: "Employee Skill Test",
    fullName: "ఉద్యోగి నైపుణ్య మూల్యాంకనం",
    institution: "Edu9 Career Guidance",
    description: "Bilingual Employee Skill Assessment (Telugu/English)",
    questions: 170,
    duration: "170 minutes",
    durationSeconds: 170 * 60,
    maxMarks: 170,
    color: "#0077b6",
    available: true,
    logo: "https://customer-assets.emergentagent.com/job_gemini-link-1/artifacts/mvpyai8y_channels4_profile.jpg",
    sections: [
      { id: "parent_interaction", name: "Parent Interaction", icon: "Users", questions: 34 },
      { id: "counseling", name: "Counseling", icon: "Brain", questions: 34 },
      { id: "ethics", name: "Ethics", icon: "Shield", questions: 34 },
      { id: "data_privacy", name: "Data Privacy", icon: "Languages", questions: 34 },
      { id: "communication", name: "Communication", icon: "Calculator", questions: 34 }
    ]
  },
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
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 30 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 30 },
      { id: "english", name: "English Proficiency", icon: "Languages", questions: 10 },
      { id: "logical", name: "Logical Reasoning", icon: "Brain", questions: 20 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 40 }
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
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 35 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 35 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 40 },
      { id: "aptitude", name: "Aptitude", icon: "Brain", questions: 15 }
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
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 35 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 35 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 35 },
      { id: "english", name: "English", icon: "Languages", questions: 10 },
      { id: "aptitude", name: "Aptitude", icon: "Brain", questions: 10 }
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
    sections: [
      { id: "physics", name: "Physics", icon: "Atom", questions: 30 },
      { id: "chemistry", name: "Chemistry", icon: "FlaskConical", questions: 30 },
      { id: "mathematics", name: "Mathematics", icon: "Calculator", questions: 40 }
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

const BENEFITS = [
  {
    icon: Target,
    title: "Exam-Like Experience",
    description: "Practice with real exam patterns and difficulty levels"
  },
  {
    icon: TrendingUp,
    title: "Detailed Analytics",
    description: "Track your progress with section-wise performance reports"
  },
  {
    icon: Shield,
    title: "Expert-Curated Questions",
    description: "Questions designed by top educators and exam experts"
  }
];

// ==================== HOMEPAGE COMPONENT ====================
function HomePage({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`} data-testid="homepage">
      {/* Navigation Header */}
      <header className="home-header">
        <div className="header-container">
          <div className="logo-section">
            <img src="https://customer-assets.emergentagent.com/job_gemini-link-1/artifacts/mvpyai8y_channels4_profile.jpg" alt="Edu9" className="main-logo" />
            <span className="brand-name">Edu9 Career Guidance</span>
          </div>
          <nav className="main-nav">
            <Link to="/" className="nav-link active" data-testid="nav-home">
              <Home size={18} />
              Home
            </Link>
            <a href="#mock-tests" className="nav-link" data-testid="nav-tests">
              <FileText size={18} />
              Mock Tests
            </a>
            <a href="#benefits" className="nav-link">
              <Award size={18} />
              Benefits
            </a>
            <a href="#contact" className="nav-link">
              <Phone size={18} />
              Contact
            </a>
          </nav>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🎯 #1 Engineering Entrance Preparation</div>
          <h1 className="hero-title">
            Ace Your Engineering<br />
            <span className="gradient-text">Entrance Exams</span>
          </h1>
          <p className="hero-subtitle">
            Practice with India's most comprehensive mock tests for BITSAT, VITEEE, SRMJEEE & more. 
            Get real exam experience and boost your confidence.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate('/bitsat')} data-testid="start-free-test">
              Start Free Test
              <ArrowRight size={20} />
            </button>
            <a href="#mock-tests" className="secondary-btn">
              View All Tests
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Questions</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <Atom size={24} />
            <span>Physics</span>
          </div>
          <div className="floating-card card-2">
            <FlaskConical size={24} />
            <span>Chemistry</span>
          </div>
          <div className="floating-card card-3">
            <Calculator size={24} />
            <span>Mathematics</span>
          </div>
          <div className="floating-card card-4">
            <Brain size={24} />
            <span>Reasoning</span>
          </div>
        </div>
      </section>

      {/* Mock Tests Section */}
      <section className="mock-tests-section" id="mock-tests">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Available Mock Tests</h2>
            <p className="section-subtitle">Choose from our comprehensive collection of entrance exam mock tests</p>
          </div>
          <div className="tests-grid">
            {Object.values(MOCK_TESTS_CONFIG).map(test => (
              <div key={test.id} className={`test-card ${!test.available ? 'coming-soon' : ''}`} style={{'--card-color': test.color}}>
                <div className="test-card-header">
                  <div className="test-icon" style={{background: test.color}}>
                    <FileText size={24} />
                  </div>
                  {!test.available && <span className="coming-soon-badge">Coming Soon</span>}
                </div>
                <h3 className="test-name">{test.name}</h3>
                <p className="test-description">{test.description}</p>
                <div className="test-meta">
                  <div className="meta-item">
                    <FileText size={16} />
                    <span>{test.questions} Questions</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{test.duration}</span>
                  </div>
                </div>
                <button 
                  className="take-test-btn" 
                  onClick={() => test.available ? navigate(`/${test.id}`) : alert('Coming Soon!')}
                  disabled={!test.available}
                  data-testid={`take-test-${test.id}`}
                  style={{background: test.available ? test.color : undefined}}
                >
                  {test.available ? 'Take Test' : 'Coming Soon'}
                  {test.available && <ArrowRight size={18} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section" id="benefits">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Edu9?</h2>
            <p className="section-subtitle">Experience the best preparation platform for engineering entrances</p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  <benefit.icon size={28} />
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Preparation?</h2>
          <p>Join thousands of students who are already preparing with Edu9</p>
          <button className="cta-btn" onClick={() => navigate('/bitsat')}>
            Start BITSAT Mock Test
            <Zap size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer" id="contact">
        <div className="footer-container">
          <div className="footer-brand">
            <img src="https://customer-assets.emergentagent.com/job_gemini-link-1/artifacts/mvpyai8y_channels4_profile.jpg" alt="Edu9" className="footer-logo" />
            <p className="footer-tagline">Your trusted partner for engineering entrance exam preparation</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <a href="#mock-tests">Mock Tests</a>
              <a href="#benefits">Benefits</a>
            </div>
            <div className="footer-column">
              <h4>Mock Tests</h4>
              <Link to="/bitsat">BITSAT</Link>
              <Link to="/viteee">VITEEE</Link>
              <Link to="/srmjeee">SRMJEEE</Link>
              <Link to="/aeee">AEEE</Link>
            </div>
            <div className="footer-column">
              <h4>Contact Us</h4>
              <a href="tel:9133311450">
                <Phone size={14} /> 9133311450
              </a>
              <a href="mailto:info@edu9.in">
                <Mail size={14} /> info@edu9.in
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Edu9 Career Guidance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ==================== MOCK TEST PAGE COMPONENT ====================
function MockTestPage({ darkMode, setDarkMode }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const testConfig = MOCK_TESTS_CONFIG[testId];
  
  // Quiz states
  const [currentPage, setCurrentPage] = useState("start"); // start, quiz, results
  const [allQuestions, setAllQuestions] = useState({});
  const [currentSection, setCurrentSection] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(testConfig?.durationSeconds || 180 * 60);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Initialize first section
  useEffect(() => {
    if (testConfig?.sections?.length > 0) {
      setCurrentSection(testConfig.sections[0].id);
    }
  }, [testConfig]);

  // Fetch questions
  const fetchQuestions = async () => {
    if (testId === 'bitsat') {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/quiz/all-questions`);
        setAllQuestions(response.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching questions:", e);
        setLoading(false);
      }
    } else if (testId === 'skilltest') {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/skilltest/all-questions`);
        setAllQuestions(response.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching questions:", e);
        setLoading(false);
      }
    }
  };

  // Timer
  useEffect(() => {
    if (currentPage !== "quiz" || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPage, quizCompleted]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBeginQuiz = async () => {
    await fetchQuestions();
    setCurrentPage("quiz");
    setTimeRemaining(testConfig?.durationSeconds || 180 * 60);
  };

  const handleAnswerSelect = (option) => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    setSelectedAnswers({ ...selectedAnswers, [key]: option });
  };

  const handleClearResponse = () => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[key];
    setSelectedAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    setMarkedForReview({ ...markedForReview, [key]: !markedForReview[key] });
  };

  const handleNext = () => {
    const questions = allQuestions[currentSection] || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
    setCurrentQuestion(0);
  };

  const handleSubmitQuiz = async () => {
    try {
      const answers = Object.entries(selectedAnswers).map(([key, answer]) => {
        const [section, qId] = key.split('-');
        return { question_id: parseInt(qId), section: section, selected_answer: answer };
      });

      const timeTaken = (testConfig?.durationSeconds || 180 * 60) - timeRemaining;
      
      // Use correct endpoint based on test type
      const endpoint = testId === 'skilltest' ? `${API}/skilltest/submit` : `${API}/quiz/submit`;
      const response = await axios.post(endpoint, { answers, time_taken: timeTaken });
      
      setQuizResult(response.data);
      setQuizCompleted(true);
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
    setQuizCompleted(false);
    setQuizResult(null);
    setTimeRemaining(testConfig?.durationSeconds || 180 * 60);
    setShowConfirmSubmit(false);
    setCurrentPage("start");
  };

  const getQuestionStatus = (sectionId, qIndex) => {
    const key = `${sectionId}-${qIndex + 1}`;
    const isAnswered = selectedAnswers[key] !== undefined;
    const isMarked = markedForReview[key];
    if (isMarked && isAnswered) return "answered-marked";
    if (isMarked) return "marked";
    if (isAnswered) return "answered";
    return "not-visited";
  };

  const getSectionStats = (sectionId) => {
    const questions = allQuestions[sectionId] || [];
    let answered = 0, marked = 0;
    questions.forEach((_, index) => {
      const key = `${sectionId}-${index + 1}`;
      if (selectedAnswers[key]) answered++;
      if (markedForReview[key]) marked++;
    });
    return { total: questions.length, answered, marked };
  };

  const getTotalStats = () => {
    let totalAnswered = 0, totalMarked = 0, totalQuestions = 0;
    testConfig?.sections?.forEach(section => {
      const stats = getSectionStats(section.id);
      totalAnswered += stats.answered;
      totalMarked += stats.marked;
      totalQuestions += stats.total;
    });
    return { totalQuestions, totalAnswered, totalMarked };
  };

  // If test not found or not available
  if (!testConfig) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="not-found-page">
          <h1>Test Not Found</h1>
          <p>The mock test you're looking for doesn't exist.</p>
          <button className="primary-btn" onClick={() => navigate('/')}>
            <Home size={20} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!testConfig.available) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="coming-soon-page">
          <div className="coming-soon-content">
            <img src={testConfig.logo} alt={testConfig.name} className="test-logo-large" />
            <h1>{testConfig.fullName}</h1>
            <p className="institution">{testConfig.institution}</p>
            <div className="coming-soon-badge-large">Coming Soon</div>
            <p className="coming-soon-text">
              We're working hard to bring you the best {testConfig.name}. 
              Stay tuned for updates!
            </p>
            <div className="test-info-preview">
              <div className="info-item">
                <FileText size={20} />
                <span>{testConfig.questions} Questions</span>
              </div>
              <div className="info-item">
                <Clock size={20} />
                <span>{testConfig.duration}</span>
              </div>
              <div className="info-item">
                <Trophy size={20} />
                <span>{testConfig.maxMarks} Marks</span>
              </div>
            </div>
            <button className="primary-btn" onClick={() => navigate('/')}>
              <Home size={20} /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // START SCREEN
  if (currentPage === "start") {
    return (
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`} data-testid="start-screen">
        <div className="start-screen">
          <div className="start-header">
            <img src={testConfig.logo} alt={testConfig.name} className="logo bits-logo" />
            <img src="https://customer-assets.emergentagent.com/job_gemini-link-1/artifacts/mvpyai8y_channels4_profile.jpg" alt="Edu9 Career Guidance" className="logo edu9-logo" />
          </div>
          
          <div className="start-content">
            <h1>{testConfig.fullName}</h1>
            <p className="subtitle">{testConfig.institution} - {testConfig.description}</p>
            
            <div className="test-info">
              <div className="info-card">
                <Clock size={24} />
                <span>Duration: {testConfig.duration}</span>
              </div>
              <div className="info-card">
                <BookOpen size={24} />
                <span>Total Questions: {testConfig.questions}</span>
              </div>
              <div className="info-card">
                <Trophy size={24} />
                <span>Maximum Marks: {testConfig.maxMarks}</span>
              </div>
            </div>

            <div className="sections-preview">
              <h3>Sections</h3>
              <div className="section-list">
                {testConfig.sections.map(section => {
                  const IconComponent = ICON_MAP[section.icon];
                  return (
                    <div key={section.id} className="section-item">
                      {IconComponent && <IconComponent size={20} />}
                      <span>{section.name}</span>
                      <span className="q-count">{section.questions} Q</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="marking-scheme">
              <h3>Marking Scheme</h3>
              <div className="scheme-items">
                <div className="scheme-item correct">
                  <Check size={18} />
                  <span>Correct Answer: +3 marks</span>
                </div>
                <div className="scheme-item wrong">
                  <X size={18} />
                  <span>Wrong Answer: -1 mark</span>
                </div>
                <div className="scheme-item neutral">
                  <span>Unattempted: 0 marks</span>
                </div>
              </div>
            </div>

            <div className="start-buttons">
              <button className="back-btn" onClick={() => navigate('/')}>
                <ChevronLeft size={20} />
                Back to Home
              </button>
              <button className="start-btn" onClick={handleBeginQuiz} data-testid="start-test-btn" style={{background: `linear-gradient(135deg, ${testConfig.color} 0%, #8b5cf6 100%)`}}>
                Start Test
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="promo-banner">
            <p>🎓 Need guidance for {testConfig.institution} admissions? Contact <strong>Edu9 Career Guidance</strong> for expert counseling.</p>
            <p>📞 Call: <a href="tel:9133311450">9133311450</a> | 📧 Email: <a href="mailto:info@edu9.in">info@edu9.in</a></p>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (currentPage === "results" && quizResult) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`} data-testid="results-screen">
        <div className="results-container">
          <div className="results-header-bar">
            <img src={testConfig.logo} alt={testConfig.name} className="logo-small" />
            <h2>{testConfig.name} Results</h2>
            <img src="https://customer-assets.emergentagent.com/job_gemini-link-1/artifacts/mvpyai8y_channels4_profile.jpg" alt="Edu9" className="logo-small" />
          </div>

          <div className="results-content">
            <div className="score-overview-card">
              <div className="score-main">
                <div className="score-circle-container">
                  <div className="score-circle large" style={{borderColor: testConfig.color}}>
                    <span className="score-value" style={{color: testConfig.color}}>{quizResult.total_marks}</span>
                    <span className="score-max">/ {quizResult.max_marks}</span>
                  </div>
                  <p className="percentage">{quizResult.percentage.toFixed(2)}%</p>
                </div>
                <div className="score-details">
                  <div className="detail-row">
                    <span className="detail-label">Total Questions</span>
                    <span className="detail-value">{testConfig.questions}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Attempted</span>
                    <span className="detail-value">{quizResult.sections.reduce((sum, s) => sum + s.attempted, 0)}</span>
                  </div>
                  <div className="detail-row correct">
                    <span className="detail-label">Correct Answers</span>
                    <span className="detail-value">{quizResult.sections.reduce((sum, s) => sum + s.correct, 0)}</span>
                  </div>
                  <div className="detail-row wrong">
                    <span className="detail-label">Wrong Answers</span>
                    <span className="detail-value">{quizResult.sections.reduce((sum, s) => sum + s.wrong, 0)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time Taken</span>
                    <span className="detail-value">{formatTime(quizResult.time_taken)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-table-container">
              <h3>Section-wise Performance</h3>
              <div className="section-table">
                <div className="table-header">
                  <div className="table-cell">Section</div>
                  <div className="table-cell">Questions</div>
                  <div className="table-cell">Attempted</div>
                  <div className="table-cell">Correct</div>
                  <div className="table-cell">Wrong</div>
                  <div className="table-cell">Marks</div>
                </div>
                {quizResult.sections.map((section, index) => (
                  <div key={index} className="table-row">
                    <div className="table-cell section-name">{section.section_name}</div>
                    <div className="table-cell">{section.total_questions}</div>
                    <div className="table-cell">{section.attempted}</div>
                    <div className="table-cell correct">{section.correct}</div>
                    <div className="table-cell wrong">{section.wrong}</div>
                    <div className="table-cell marks">{section.marks}</div>
                  </div>
                ))}
                <div className="table-row total-row">
                  <div className="table-cell section-name">Total</div>
                  <div className="table-cell">{testConfig.questions}</div>
                  <div className="table-cell">{quizResult.sections.reduce((sum, s) => sum + s.attempted, 0)}</div>
                  <div className="table-cell correct">{quizResult.sections.reduce((sum, s) => sum + s.correct, 0)}</div>
                  <div className="table-cell wrong">{quizResult.sections.reduce((sum, s) => sum + s.wrong, 0)}</div>
                  <div className="table-cell marks">{quizResult.total_marks}</div>
                </div>
              </div>
            </div>

            <div className="results-actions">
              <button className="home-btn" onClick={() => navigate('/')}>
                <Home size={18} /> Back to Home
              </button>
              <button className="restart-btn" onClick={handleRestart} style={{background: `linear-gradient(135deg, ${testConfig.color} 0%, #8b5cf6 100%)`}}>
                <RotateCcw size={18} /> Take Test Again
              </button>
            </div>
          </div>

          <div className="promo-banner">
            <p>🎓 Need guidance for admissions? Contact <strong>Edu9 Career Guidance</strong> for expert counseling.</p>
            <p>📞 Call: <a href="tel:9133311450">9133311450</a> | 📧 Email: <a href="mailto:info@edu9.in">info@edu9.in</a></p>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  const questions = allQuestions[currentSection] || [];
  const question = questions[currentQuestion];
  const currentKey = `${currentSection}-${currentQuestion + 1}`;
  const selectedAnswer = selectedAnswers[currentKey];
  const isMarked = markedForReview[currentKey];
  const totalStats = getTotalStats();

  if (loading || questions.length === 0) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading {testConfig.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`} data-testid="quiz-screen">
      <header className="quiz-header">
        <div className="header-left">
          <img src={testConfig.logo} alt={testConfig.name} className="logo-small" />
          <span className="test-title">{testConfig.name}</span>
        </div>
        
        <div className="header-center">
          <div className={`timer ${timeRemaining < 600 ? 'warning' : ''}`} data-testid="timer">
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <img src="https://customer-assets.emergentagent.com/job_gemini-link-1/artifacts/mvpyai8y_channels4_profile.jpg" alt="Edu9" className="logo-small" />
        </div>
      </header>

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
              {IconComponent && <IconComponent size={18} />}
              <span className="section-name">{section.name}</span>
              <span className="section-progress">{stats.answered}/{stats.total}</span>
            </button>
          );
        })}
      </div>

      <div className="quiz-body">
        <div className="question-panel">
          <div className="question-header">
            <span className="question-number">Question {currentQuestion + 1} of {questions.length}</span>
            <div className="question-actions">
              <button className={`action-btn mark-btn ${isMarked ? 'marked' : ''}`} onClick={handleMarkForReview}>
                <Flag size={16} />
                {isMarked ? 'Marked' : 'Mark for Review'}
              </button>
              <button className="action-btn clear-btn" onClick={handleClearResponse} disabled={!selectedAnswer}>
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>

          <div className="question-content">
            <p className="question-text" style={{color: darkMode ? '#f1f5f9' : '#1e293b'}}>{question?.question}</p>
            <div className="options-grid">
              {question && Object.entries(question.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`option-btn ${selectedAnswer === key ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(key)}
                  data-testid={`option-${key}`}
                >
                  <span className="option-key">{key}</span>
                  <span className="option-value" style={{color: darkMode ? '#f1f5f9' : '#1e293b'}}>{value}</span>
                  {selectedAnswer === key && <Check className="check-icon" size={18} />}
                </button>
              ))}
            </div>
          </div>

          <div className="navigation-buttons">
            <button className="nav-btn prev-btn" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ChevronLeft size={20} /> Previous
            </button>
            <button className="nav-btn next-btn" onClick={handleNext} disabled={currentQuestion === questions.length - 1}>
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="question-palette">
          <div className="palette-header">
            <h3>Question Palette</h3>
            <div className="palette-stats">Answered: {totalStats.totalAnswered}/{totalStats.totalQuestions}</div>
          </div>

          <div className="palette-legend">
            <div className="legend-item"><span className="dot answered"></span> Answered</div>
            <div className="legend-item"><span className="dot not-visited"></span> Not Answered</div>
            <div className="legend-item"><span className="dot marked"></span> Marked</div>
            <div className="legend-item"><span className="dot answered-marked"></span> Answered & Marked</div>
          </div>

          <div className="palette-section">
            <h4>{testConfig.sections.find(s => s.id === currentSection)?.name}</h4>
            <div className="question-grid">
              {questions.map((_, index) => {
                const status = getQuestionStatus(currentSection, index);
                return (
                  <button
                    key={index}
                    className={`q-btn ${status} ${currentQuestion === index ? 'current' : ''}`}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="submit-test-btn" onClick={() => setShowConfirmSubmit(true)}>
            Submit Test
          </button>
        </div>
      </div>

      <footer className="promo-footer">
        <p>🎓 <strong>Edu9 Career Guidance</strong> | 📞 <a href="tel:9133311450">9133311450</a> | 📧 <a href="mailto:info@edu9.in">info@edu9.in</a></p>
      </footer>

      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit Test?</h3>
            <div className="modal-stats">
              <p>Total Questions: {totalStats.totalQuestions}</p>
              <p>Answered: {totalStats.totalAnswered}</p>
              <p>Unanswered: {totalStats.totalQuestions - totalStats.totalAnswered}</p>
              <p>Marked for Review: {totalStats.totalMarked}</p>
            </div>
            <p className="warning-text">Are you sure you want to submit?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowConfirmSubmit(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleSubmitQuiz}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Routes>
      <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
      <Route path="/skilltest" element={<EmployeeSkillTest />} />
      <Route path="/:testId" element={<MockTestPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
    </Routes>
  );
}

export default App;
