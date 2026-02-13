import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ChevronLeft, ChevronRight, Check, X, RotateCcw, 
  Trophy, Clock, Flag, Trash2, Sun, Moon, BookOpen, Brain,
  Home, FileText, Award, Maximize, Minimize, AlertTriangle,
  Eye, EyeOff, BarChart2, CheckCircle, Circle, Volume2, VolumeX,
  Globe, User, UserPlus, LogIn, LogOut, Users, Target, Zap,
  MessageSquare, Shield, Lock, Phone, Settings
} from "lucide-react";
import "./AdvancedSkillTest.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Test Configuration
const TEST_CONFIG = {
  id: "skilltest",
  name: "Employee Skill Assessment",
  fullName: "ఉద్యోగి నైపుణ్య మూల్యాంకన పరీక్ష",
  institution: "Edu9 Career Guidance",
  description: "Comprehensive skill assessment for employees",
  questions: 170,
  duration: "2 hours 50 minutes",
  durationSeconds: 170 * 60,
  maxMarks: 170,
  color: "#1e3a5f",
  markingScheme: { correct: 1, wrong: 0, unattempted: 0 },
  sections: [
    { id: "parent_interaction", name: "Parent Interaction", teluguName: "తల్లిదండ్రుల పరస్పర చర్య", icon: "Users", questions: 34, timeLimit: 34 },
    { id: "counseling", name: "Counseling", teluguName: "కౌన్సెలింగ్", icon: "MessageSquare", questions: 34, timeLimit: 34 },
    { id: "ethics", name: "Ethics", teluguName: "నీతి శాస్త్రం", icon: "Shield", questions: 34, timeLimit: 34 },
    { id: "data_privacy", name: "Data Privacy", teluguName: "డేటా గోప్యత", icon: "Lock", questions: 34, timeLimit: 34 },
    { id: "communication", name: "Communication", teluguName: "కమ్యూనికేషన్", icon: "Phone", questions: 34, timeLimit: 34 }
  ]
};

const ICON_MAP = {
  Users: Users,
  MessageSquare: MessageSquare,
  Shield: Shield,
  Lock: Lock,
  Phone: Phone
};

// Question Status Types
const QUESTION_STATUS = {
  NOT_VISITED: 'not_visited',
  NOT_ANSWERED: 'not_answered',
  ANSWERED: 'answered',
  MARKED: 'marked',
  ANSWERED_MARKED: 'answered_marked'
};

// ==================== MAIN COMPONENT ====================
export default function AdvancedSkillTest() {
  const navigate = useNavigate();
  
  // Language & Theme
  const [language, setLanguage] = useState("telugu");
  const [darkMode, setDarkMode] = useState(false);
  
  // Page States
  const [currentPage, setCurrentPage] = useState("landing"); // landing, register, login, admin-login, instructions, quiz, results, admin
  
  // User States
  const [employee, setEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: "", designation: "", mobile: "", email: "" });
  const [loginMobile, setLoginMobile] = useState("");
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  
  // Quiz States
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
  const [timeRemaining, setTimeRemaining] = useState(TEST_CONFIG.durationSeconds);
  const [showWarning, setShowWarning] = useState(false);
  
  // UI States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  
  // Admin States
  const [adminStats, setAdminStats] = useState(null);
  const [adminTab, setAdminTab] = useState("overview");
  
  // Refs
  const questionStartTime = useRef(Date.now());
  const timerRef = useRef(null);

  // Labels based on language
  const labels = {
    telugu: {
      title: "ఉద్యోగి నైపుణ్య మూల్యాంకనం",
      subtitle: "మీ వృత్తిపరమైన నైపుణ్యాలను అంచనా వేయండి",
      register: "నమోదు చేయండి",
      login: "లాగిన్",
      adminLogin: "అడ్మిన్ లాగిన్",
      startTest: "పరీక్ష ప్రారంభించండి",
      beginTest: "పరీక్ష ప్రారంభించు",
      submitTest: "పరీక్ష సమర్పించండి",
      next: "తదుపరి",
      previous: "మునుపటి",
      saveNext: "సేవ్ & తదుపరి",
      markNext: "మార్క్ & తదుపరి",
      clear: "క్లియర్",
      mark: "మార్క్",
      marked: "మార్క్ చేయబడింది",
      name: "పేరు",
      designation: "హోదా",
      mobile: "మొబైల్ నంబర్",
      email: "ఇమెయిల్",
      username: "యూజర్‌నేమ్",
      password: "పాస్‌వర్డ్",
      alreadyAccount: "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి",
      newUser: "కొత్త వినియోగదారు? నమోదు చేయండి",
      results: "ఫలితాలు",
      score: "స్కోరు",
      correct: "సరైనవి",
      wrong: "తప్పులు",
      skipped: "వదిలివేసినవి",
      accuracy: "ఖచ్చితత్వం",
      timeTaken: "తీసుకున్న సమయం",
      backHome: "హోమ్‌కి తిరిగి వెళ్ళు",
      retake: "మళ్ళీ పరీక్ష వ్రాయండి",
      overview: "అవలోకనం",
      employees: "ఉద్యోగులు",
      analytics: "విశ్లేషణలు",
      logout: "లాగ్ అవుట్",
      totalQuestions: "మొత్తం ప్రశ్నలు",
      answered: "సమాధానం ఇచ్చారు",
      notAnswered: "సమాధానం లేదు",
      notVisited: "సందర్శించలేదు",
      markedReview: "మార్క్ చేసినవి",
      warning: "హెచ్చరిక",
      confirmSubmit: "మీరు పరీక్షను సమర్పించాలనుకుంటున్నారా?",
      cancel: "రద్దు చేయి",
      confirm: "నిర్ధారించు"
    },
    english: {
      title: "Employee Skill Assessment",
      subtitle: "Evaluate your professional skills",
      register: "Register",
      login: "Login",
      adminLogin: "Admin Login",
      startTest: "Start Test",
      beginTest: "Begin Test",
      submitTest: "Submit Test",
      next: "Next",
      previous: "Previous",
      saveNext: "Save & Next",
      markNext: "Mark & Next",
      clear: "Clear",
      mark: "Mark",
      marked: "Marked",
      name: "Name",
      designation: "Designation",
      mobile: "Mobile Number",
      email: "Email",
      username: "Username",
      password: "Password",
      alreadyAccount: "Already have an account? Login",
      newUser: "New user? Register",
      results: "Results",
      score: "Score",
      correct: "Correct",
      wrong: "Wrong",
      skipped: "Skipped",
      accuracy: "Accuracy",
      timeTaken: "Time Taken",
      backHome: "Back to Home",
      retake: "Retake Test",
      overview: "Overview",
      employees: "Employees",
      analytics: "Analytics",
      logout: "Logout",
      totalQuestions: "Total Questions",
      answered: "Answered",
      notAnswered: "Not Answered",
      notVisited: "Not Visited",
      markedReview: "Marked for Review",
      warning: "Warning",
      confirmSubmit: "Are you sure you want to submit the test?",
      cancel: "Cancel",
      confirm: "Confirm"
    }
  };
  
  const t = labels[language];

  // Initialize section
  useEffect(() => {
    if (TEST_CONFIG.sections.length > 0 && !currentSection) {
      setCurrentSection(TEST_CONFIG.sections[0].id);
    }
  }, [currentSection]);

  // Mark current question as visited
  useEffect(() => {
    if (currentPage === 'quiz' && currentSection) {
      const key = `${currentSection}-${currentQuestion + 1}`;
      if (!visitedQuestions[key]) {
        setVisitedQuestions(prev => ({ ...prev, [key]: true }));
      }
      questionStartTime.current = Date.now();
    }
  }, [currentSection, currentQuestion, currentPage, visitedQuestions]);

  // Timer
  useEffect(() => {
    if (currentPage !== "quiz") return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitQuiz();
          return 0;
        }
        if (prev === 600 || prev === 300) {
          setShowWarning(true);
          if (soundEnabled) playWarningSound();
          setTimeout(() => setShowWarning(false), 5000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentPage, soundEnabled]);

  // Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  // Sound
  const playWarningSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+Onp+XjHdqa3eGlaGfkoBwZmx4iJqpqZ6MdGNkb4CUpayjk31qYWl2iJuqq6KPe2hjaHaHmKioo5F9a2RpdoeYp6iikX1rZGl2h5inqKKRfWtkaXaHmKeoopF9a2RpdoeYp6iikX1rZGl2h5inqKKRfWtkaXaHmKeoopF9a2RpdoeYp6iikX0=');
    audio.play().catch(() => {});
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

  // Fetch questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/employee-skill/questions`);
      // Handle the API response format - questions come in a "questions" array
      const questionsData = response.data.questions || response.data;
      
      // Organize questions by section
      const questionsBySection = {};
      questionsData.forEach(q => {
        if (!questionsBySection[q.section]) {
          questionsBySection[q.section] = [];
        }
        questionsBySection[q.section].push(q);
      });
      setAllQuestions(questionsBySection);
      setLoading(false);
      
      // Load saved progress if employee exists
      if (employee?._id) {
        try {
          const progressRes = await axios.get(`${API}/employee-skill/progress/${employee._id}`);
          if (progressRes.data && progressRes.data.answers) {
            setSelectedAnswers(progressRes.data.answers);
          }
        } catch (e) {
          console.log("No saved progress found");
        }
      }
      
      return true;
    } catch (e) {
      console.error("Error fetching questions:", e);
      setLoading(false);
      return false;
    }
  };

  // Register employee
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/employee-skill/register`, formData);
      setEmployee(response.data);
      setCurrentPage("instructions");
    } catch (e) {
      setError(e.response?.data?.detail || "Registration failed");
    }
    setLoading(false);
  };

  // Login employee
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/employee-skill/login`, { mobile: loginMobile });
      setEmployee(response.data);
      setCurrentPage("instructions");
    } catch (e) {
      setError(e.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/employee-skill/admin/login`, adminCredentials);
      if (response.data.success) {
        setIsAdmin(true);
        setCurrentPage("admin");
        fetchAdminStats();
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Invalid credentials");
    }
    setLoading(false);
  };

  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      const response = await axios.get(`${API}/employee-skill/admin/stats`);
      setAdminStats(response.data);
    } catch (e) {
      console.error("Error fetching admin stats:", e);
    }
  };

  // Begin quiz
  const handleBeginQuiz = async () => {
    const success = await fetchQuestions();
    if (success) {
      setCurrentPage("quiz");
      setTimeRemaining(TEST_CONFIG.durationSeconds);
    }
  };

  // Record time spent on current question
  const recordQuestionTime = () => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    setQuestionTimings(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + timeSpent
    }));
    questionStartTime.current = Date.now();
  };

  // Auto-save answer
  const autoSaveAnswer = async (key, answer) => {
    if (!employee?._id) return;
    
    setSaveStatus("saving");
    try {
      await axios.post(`${API}/employee-skill/progress`, {
        employee_id: employee._id,
        question_key: key,
        answer: answer
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const key = `${currentSection}-${currentQuestion + 1}`;
    setSelectedAnswers(prev => ({ ...prev, [key]: optionIndex }));
    autoSaveAnswer(key, optionIndex);
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
      const currentIndex = TEST_CONFIG.sections.findIndex(s => s.id === currentSection);
      if (currentIndex < TEST_CONFIG.sections.length - 1) {
        setCurrentSection(TEST_CONFIG.sections[currentIndex + 1].id);
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
        return { question_id: parseInt(qId), section, selected_answer: answer };
      });

      const timeTaken = TEST_CONFIG.durationSeconds - timeRemaining;
      
      const response = await axios.post(`${API}/employee-skill/submit`, {
        employee_id: employee?._id,
        answers,
        time_taken: timeTaken
      });
      
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
    setCurrentSection(TEST_CONFIG.sections[0].id);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setVisitedQuestions({});
    setQuestionTimings({});
    setQuizResult(null);
    setTimeRemaining(TEST_CONFIG.durationSeconds);
    setShowConfirmSubmit(false);
    setCurrentPage("instructions");
  };

  const handleLogout = () => {
    setEmployee(null);
    setIsAdmin(false);
    setAdminStats(null);
    setCurrentPage("landing");
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
    
    TEST_CONFIG.sections.forEach(section => {
      const stats = getSectionStats(section.id);
      totalAnswered += stats.answered;
      totalMarked += stats.marked;
      totalNotAnswered += stats.notAnswered;
      totalNotVisited += stats.notVisited;
      totalQuestions += stats.total;
    });
    
    return { totalQuestions, totalAnswered, totalMarked, totalNotAnswered, totalNotVisited };
  };

  // ==================== LANDING PAGE ====================
  if (currentPage === "landing") {
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="landing-page">
        <header className="skill-header">
          <div className="header-left">
            <BookOpen size={28} className="logo-icon" />
            <span className="brand">{language === 'telugu' ? 'Edu9 కెరీర్ గైడెన్స్' : 'Edu9 Career Guidance'}</span>
          </div>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="landing-content">
          <div className="landing-hero">
            <div className="hero-badge">
              <Award size={16} />
              {language === 'telugu' ? 'వృత్తిపరమైన మూల్యాంకనం' : 'Professional Assessment'}
            </div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
            
            <div className="landing-stats">
              <div className="stat">
                <span className="stat-number">170</span>
                <span className="stat-label">{language === 'telugu' ? 'ప్రశ్నలు' : 'Questions'}</span>
              </div>
              <div className="stat">
                <span className="stat-number">5</span>
                <span className="stat-label">{language === 'telugu' ? 'విభాగాలు' : 'Sections'}</span>
              </div>
              <div className="stat">
                <span className="stat-number">170</span>
                <span className="stat-label">{language === 'telugu' ? 'నిమిషాలు' : 'Minutes'}</span>
              </div>
            </div>

            <div className="landing-buttons">
              <button className="primary-btn" onClick={() => setCurrentPage("register")} data-testid="register-btn">
                <UserPlus size={20} />
                {t.register}
              </button>
              <button className="secondary-btn" onClick={() => setCurrentPage("login")} data-testid="login-btn">
                <LogIn size={20} />
                {t.login}
              </button>
            </div>
            
            <button className="admin-link" onClick={() => setCurrentPage("admin-login")}>
              <Settings size={16} />
              {t.adminLogin}
            </button>
          </div>

          <div className="landing-sections">
            <h3>{language === 'telugu' ? 'పరీక్ష విభాగాలు' : 'Test Sections'}</h3>
            <div className="sections-preview">
              {TEST_CONFIG.sections.map((section, index) => {
                const IconComponent = ICON_MAP[section.icon];
                return (
                  <div key={section.id} className="section-preview-card">
                    <div className="section-icon">
                      {IconComponent && <IconComponent size={24} />}
                    </div>
                    <div className="section-info">
                      <span className="section-name">{language === 'telugu' ? section.teluguName : section.name}</span>
                      <span className="section-questions">{section.questions} {language === 'telugu' ? 'ప్రశ్నలు' : 'Questions'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== REGISTER PAGE ====================
  if (currentPage === "register") {
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="register-page">
        <header className="skill-header">
          <button className="back-btn" onClick={() => setCurrentPage("landing")}>
            <ChevronLeft size={20} />
            {language === 'telugu' ? 'వెనుకకు' : 'Back'}
          </button>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
          </div>
        </header>

        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-icon">
              <UserPlus size={32} />
            </div>
            <h2>{t.register}</h2>
            <p>{language === 'telugu' ? 'పరీక్షకు నమోదు చేయండి' : 'Register for the test'}</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>{t.name} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={language === 'telugu' ? 'మీ పేరు' : 'Your name'}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.designation} *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  placeholder={language === 'telugu' ? 'మీ హోదా' : 'Your designation'}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.mobile} *</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (language === 'telugu' ? 'నమోదు అవుతోంది...' : 'Registering...') : t.register}
              </button>
            </form>

            <button className="switch-auth-btn" onClick={() => setCurrentPage("login")}>
              {t.alreadyAccount}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== LOGIN PAGE ====================
  if (currentPage === "login") {
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="login-page">
        <header className="skill-header">
          <button className="back-btn" onClick={() => setCurrentPage("landing")}>
            <ChevronLeft size={20} />
            {language === 'telugu' ? 'వెనుకకు' : 'Back'}
          </button>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
          </div>
        </header>

        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-icon">
              <LogIn size={32} />
            </div>
            <h2>{t.login}</h2>
            <p>{language === 'telugu' ? 'మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి' : 'Login with your mobile number'}</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>{t.mobile} *</label>
                <input
                  type="tel"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (language === 'telugu' ? 'లాగిన్ అవుతోంది...' : 'Logging in...') : t.login}
              </button>
            </form>

            <button className="switch-auth-btn" onClick={() => setCurrentPage("register")}>
              {t.newUser}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ADMIN LOGIN PAGE ====================
  if (currentPage === "admin-login") {
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="admin-login-page">
        <header className="skill-header">
          <button className="back-btn" onClick={() => setCurrentPage("landing")}>
            <ChevronLeft size={20} />
            {language === 'telugu' ? 'వెనుకకు' : 'Back'}
          </button>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
          </div>
        </header>

        <div className="auth-container">
          <div className="auth-card admin">
            <div className="auth-icon admin">
              <Settings size={32} />
            </div>
            <h2>{t.adminLogin}</h2>
            <p>{language === 'telugu' ? 'అడ్మిన్ ఖాతాలో లాగిన్ అవ్వండి' : 'Login to admin account'}</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label>{t.username} *</label>
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                  placeholder={language === 'telugu' ? 'యూజర్‌నేమ్' : 'Username'}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.password} *</label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                  placeholder={language === 'telugu' ? 'పాస్‌వర్డ్' : 'Password'}
                  required
                />
              </div>
              <button type="submit" className="submit-btn admin" disabled={loading}>
                {loading ? (language === 'telugu' ? 'లాగిన్ అవుతోంది...' : 'Logging in...') : t.adminLogin}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==================== INSTRUCTIONS PAGE ====================
  if (currentPage === "instructions") {
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="instructions-page">
        <header className="skill-header">
          <div className="header-left">
            <BookOpen size={24} className="logo-icon" />
            <span className="brand">{t.title}</span>
          </div>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="instructions-content">
          {employee && (
            <div className="welcome-card">
              <User size={24} />
              <div>
                <span className="welcome-name">{language === 'telugu' ? 'స్వాగతం' : 'Welcome'}, {employee.name}!</span>
                <span className="welcome-designation">{employee.designation}</span>
              </div>
            </div>
          )}

          <div className="test-overview">
            <h2>{language === 'telugu' ? 'పరీక్ష అవలోకనం' : 'Test Overview'}</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <Clock size={28} />
                <div>
                  <span className="value">{TEST_CONFIG.duration}</span>
                  <span className="label">{language === 'telugu' ? 'సమయం' : 'Duration'}</span>
                </div>
              </div>
              <div className="overview-card">
                <FileText size={28} />
                <div>
                  <span className="value">{TEST_CONFIG.questions}</span>
                  <span className="label">{language === 'telugu' ? 'ప్రశ్నలు' : 'Questions'}</span>
                </div>
              </div>
              <div className="overview-card">
                <Trophy size={28} />
                <div>
                  <span className="value">{TEST_CONFIG.maxMarks}</span>
                  <span className="label">{language === 'telugu' ? 'గరిష్ట మార్కులు' : 'Max Marks'}</span>
                </div>
              </div>
              <div className="overview-card">
                <Target size={28} />
                <div>
                  <span className="value">{TEST_CONFIG.sections.length}</span>
                  <span className="label">{language === 'telugu' ? 'విభాగాలు' : 'Sections'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sections-breakdown">
            <h2>{language === 'telugu' ? 'విభాగాల వివరాలు' : 'Sections Breakdown'}</h2>
            <div className="sections-table">
              <div className="table-header-row">
                <span>{language === 'telugu' ? 'విభాగం' : 'Section'}</span>
                <span>{language === 'telugu' ? 'ప్రశ్నలు' : 'Questions'}</span>
                <span>{language === 'telugu' ? 'సమయం' : 'Time'}</span>
              </div>
              {TEST_CONFIG.sections.map((section) => {
                const IconComponent = ICON_MAP[section.icon];
                return (
                  <div key={section.id} className="table-row">
                    <span className="section-name">
                      {IconComponent && <IconComponent size={18} />}
                      {language === 'telugu' ? section.teluguName : section.name}
                    </span>
                    <span>{section.questions}</span>
                    <span>{section.timeLimit} {language === 'telugu' ? 'ని.' : 'min'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="legend-preview">
            <h2>{language === 'telugu' ? 'ప్రశ్న పాలెట్ లెజెండ్' : 'Question Palette Legend'}</h2>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-dot not-visited"></span>
                <span>{language === 'telugu' ? 'సందర్శించలేదు' : 'Not Visited'}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot not-answered"></span>
                <span>{language === 'telugu' ? 'సమాధానం లేదు' : 'Not Answered'}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot answered"></span>
                <span>{language === 'telugu' ? 'సమాధానం ఇచ్చారు' : 'Answered'}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot marked"></span>
                <span>{language === 'telugu' ? 'సమీక్షకు మార్క్' : 'Marked for Review'}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot answered-marked"></span>
                <span>{language === 'telugu' ? 'సమాధానం & మార్క్' : 'Answered & Marked'}</span>
              </div>
            </div>
          </div>

          <div className="instructions-actions">
            <button className="back-btn" onClick={() => setCurrentPage("landing")}>
              <ChevronLeft size={20} /> {t.backHome}
            </button>
            <button className="start-btn" onClick={handleBeginQuiz} data-testid="begin-test-btn">
              {t.beginTest} <Zap size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULTS PAGE ====================
  if (currentPage === "results" && quizResult) {
    const avgTimePerQuestion = quizResult.totalTimeTaken / Math.max(1, quizResult.attemptedQuestions);
    
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="results-page">
        <header className="skill-header">
          <div className="header-left">
            <Trophy size={24} className="logo-icon" />
            <span className="brand">{t.results}</span>
          </div>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="results-content">
          <div className="score-overview">
            <div className="score-main-card">
              <div className="score-circle">
                <span className="score-number">{quizResult.score}</span>
                <span className="score-max">/ {quizResult.total_questions}</span>
              </div>
              <div className="score-percentage">
                <span className="percentage-value">{quizResult.percentage.toFixed(1)}%</span>
                <span className="percentage-label">{t.score}</span>
              </div>
            </div>

            <div className="score-stats-grid">
              <div className="stat-card">
                <div className="stat-icon correct"><CheckCircle size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{quizResult.sections.reduce((sum, s) => sum + s.correct, 0)}</span>
                  <span className="stat-label">{t.correct}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon wrong"><X size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{quizResult.sections.reduce((sum, s) => sum + s.wrong, 0)}</span>
                  <span className="stat-label">{t.wrong}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon skipped"><Circle size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{TEST_CONFIG.questions - quizResult.attemptedQuestions}</span>
                  <span className="stat-label">{t.skipped}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon time"><Clock size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{formatTime(quizResult.totalTimeTaken)}</span>
                  <span className="stat-label">{t.timeTaken}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="performance-analysis">
            <h3><BarChart2 size={20} /> {language === 'telugu' ? 'పనితీరు విశ్లేషణ' : 'Performance Analysis'}</h3>
            <div className="analysis-grid">
              <div className="analysis-item">
                <span className="analysis-label">{t.accuracy}</span>
                <div className="analysis-bar">
                  <div className="bar-fill" style={{width: `${quizResult.accuracy.toFixed(0)}%`}}></div>
                </div>
                <span className="analysis-value">{quizResult.accuracy.toFixed(1)}%</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">{language === 'telugu' ? 'ప్రయత్న రేటు' : 'Attempt Rate'}</span>
                <div className="analysis-bar">
                  <div className="bar-fill green" style={{width: `${(quizResult.attemptedQuestions / TEST_CONFIG.questions * 100).toFixed(0)}%`}}></div>
                </div>
                <span className="analysis-value">{(quizResult.attemptedQuestions / TEST_CONFIG.questions * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="section-results">
            <h3><Target size={20} /> {language === 'telugu' ? 'విభాగం-వారీ పనితీరు' : 'Section-wise Performance'}</h3>
            <div className="section-results-table">
              <div className="table-header">
                <span>{language === 'telugu' ? 'విభాగం' : 'Section'}</span>
                <span>{language === 'telugu' ? 'ప్రశ్నలు' : 'Questions'}</span>
                <span>{language === 'telugu' ? 'ప్రయత్నించినవి' : 'Attempted'}</span>
                <span>{t.correct}</span>
                <span>{t.wrong}</span>
                <span>{t.score}</span>
                <span>{t.accuracy}</span>
              </div>
              {quizResult.sections.map((section, index) => {
                const sectionAccuracy = section.attempted > 0 ? (section.correct / section.attempted * 100) : 0;
                return (
                  <div key={index} className="table-row">
                    <span className="section-name">{language === 'telugu' ? TEST_CONFIG.sections[index]?.teluguName : section.section_name}</span>
                    <span>{section.total_questions}</span>
                    <span>{section.attempted}</span>
                    <span className="correct">{section.correct}</span>
                    <span className="wrong">{section.wrong}</span>
                    <span className="marks">{section.score}</span>
                    <span className={`accuracy ${sectionAccuracy >= 70 ? 'good' : sectionAccuracy >= 40 ? 'avg' : 'poor'}`}>
                      {sectionAccuracy.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="results-actions">
            <button className="action-btn secondary" onClick={() => navigate('/')}>
              <Home size={18} /> {t.backHome}
            </button>
            <button className="action-btn primary" onClick={handleRestart}>
              <RotateCcw size={18} /> {t.retake}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  if (currentPage === "admin" && isAdmin) {
    return (
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`} data-testid="admin-page">
        <header className="admin-header">
          <div className="header-left">
            <Settings size={24} />
            <span className="brand">{language === 'telugu' ? 'అడ్మిన్ డాష్‌బోర్డ్' : 'Admin Dashboard'}</span>
          </div>
          <div className="header-right">
            <button className="lang-toggle" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
              <Globe size={18} />
              {language === 'telugu' ? 'English' : 'తెలుగు'}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              {t.logout}
            </button>
          </div>
        </header>

        <div className="admin-tabs">
          <button className={`tab-btn ${adminTab === 'overview' ? 'active' : ''}`} onClick={() => setAdminTab('overview')}>
            {t.overview}
          </button>
          <button className={`tab-btn ${adminTab === 'employees' ? 'active' : ''}`} onClick={() => setAdminTab('employees')}>
            {t.employees}
          </button>
          <button className={`tab-btn ${adminTab === 'analytics' ? 'active' : ''}`} onClick={() => setAdminTab('analytics')}>
            {t.analytics}
          </button>
        </div>

        <div className="admin-content">
          {adminTab === 'overview' && adminStats && (
            <>
              <div className="stats-cards">
                <div className="stat-card">
                  <Users size={32} />
                  <div className="stat-info">
                    <span className="stat-value">{adminStats.total_employees}</span>
                    <span className="stat-label">{language === 'telugu' ? 'మొత్తం ఉద్యోగులు' : 'Total Employees'}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <FileText size={32} />
                  <div className="stat-info">
                    <span className="stat-value">{adminStats.tests_completed}</span>
                    <span className="stat-label">{language === 'telugu' ? 'పూర్తయిన పరీక్షలు' : 'Tests Completed'}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <Trophy size={32} />
                  <div className="stat-info">
                    <span className="stat-value">{adminStats.average_score?.toFixed(1)}%</span>
                    <span className="stat-label">{language === 'telugu' ? 'సగటు స్కోరు' : 'Average Score'}</span>
                  </div>
                </div>
              </div>

              <div className="recent-results">
                <h3>{language === 'telugu' ? 'ఇటీవలి ఫలితాలు' : 'Recent Results'}</h3>
                {adminStats.recent_results?.length > 0 ? (
                  <div className="results-table">
                    <div className="table-header">
                      <span>{t.name}</span>
                      <span>{t.designation}</span>
                      <span>{t.score}</span>
                      <span>{language === 'telugu' ? 'తేదీ' : 'Date'}</span>
                    </div>
                    {adminStats.recent_results.map((result, index) => (
                      <div key={index} className="table-row">
                        <span>{result.employee_name}</span>
                        <span>{result.designation}</span>
                        <span className="score-badge">{result.percentage?.toFixed(1)}%</span>
                        <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">{language === 'telugu' ? 'ఫలితాలు లేవు' : 'No results yet'}</p>
                )}
              </div>
            </>
          )}

          {adminTab === 'employees' && adminStats && (
            <div className="employees-section">
              <h3>{language === 'telugu' ? 'నమోదైన ఉద్యోగులు' : 'Registered Employees'}</h3>
              {adminStats.employees?.length > 0 ? (
                <div className="employees-table">
                  <div className="table-header">
                    <span>{t.name}</span>
                    <span>{t.designation}</span>
                    <span>{t.mobile}</span>
                    <span>{t.email}</span>
                  </div>
                  {adminStats.employees.map((emp, index) => (
                    <div key={index} className="table-row">
                      <span>{emp.name}</span>
                      <span>{emp.designation}</span>
                      <span>{emp.mobile}</span>
                      <span>{emp.email || '-'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">{language === 'telugu' ? 'ఉద్యోగులు లేరు' : 'No employees registered'}</p>
              )}
            </div>
          )}

          {adminTab === 'analytics' && adminStats && (
            <div className="analytics-section">
              <h3>{language === 'telugu' ? 'విభాగం-వారీ పనితీరు' : 'Section-wise Performance'}</h3>
              <div className="section-analytics">
                {adminStats.section_averages?.map((section, index) => (
                  <div key={index} className="section-bar-item">
                    <div className="section-bar-header">
                      <span className="section-bar-name">
                        {language === 'telugu' ? TEST_CONFIG.sections[index]?.teluguName : section.section}
                      </span>
                      <span className="section-bar-value">{section.average?.toFixed(1)}%</span>
                    </div>
                    <div className="section-bar-bg">
                      <div 
                        className="section-bar-fill" 
                        style={{
                          width: `${section.average}%`,
                          background: section.average >= 70 ? '#10b981' : section.average >= 40 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
      <div className={`skill-test-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{language === 'telugu' ? 'లోడ్ అవుతోంది...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const questionText = question ? (language === 'telugu' ? question.telugu?.question : question.english?.question) : "";
  const options = question ? (language === 'telugu' ? question.telugu?.options : question.english?.options) : [];

  return (
    <div className={`skill-test-container ${darkMode ? 'dark' : 'light'} ${isFullScreen ? 'fullscreen' : ''}`} data-testid="quiz-page">
      {/* Warning Toast */}
      {showWarning && (
        <div className="warning-toast">
          <AlertTriangle size={24} />
          <span>
            {timeRemaining === 600 ? (language === 'telugu' ? '10 నిమిషాలు మిగిలి ఉన్నాయి!' : '10 minutes remaining!') : 
             timeRemaining === 300 ? (language === 'telugu' ? '5 నిమిషాలు మిగిలి ఉన్నాయి!' : '5 minutes remaining!') : 
             (language === 'telugu' ? 'సమయం అయిపోతోంది!' : 'Time is running out!')}
          </span>
        </div>
      )}

      {/* Header */}
      <header className="quiz-header">
        <div className="header-left">
          <BookOpen size={24} className="logo-icon" />
          <span className="test-name">{language === 'telugu' ? 'నైపుణ్య పరీక్ష' : 'Skill Test'}</span>
        </div>
        
        <div className="header-center">
          <div className={`main-timer ${timeRemaining < 600 ? 'warning' : ''}`} data-testid="main-timer">
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
          {saveStatus && (
            <span className={`save-status ${saveStatus}`}>
              {saveStatus === 'saving' ? (language === 'telugu' ? 'సేవ్ అవుతోంది...' : 'Saving...') :
               saveStatus === 'saved' ? (language === 'telugu' ? 'సేవ్ అయింది' : 'Saved') :
               (language === 'telugu' ? 'సేవ్ లోపం' : 'Save error')}
            </span>
          )}
        </div>
        
        <div className="header-right">
          <button className="lang-toggle small" onClick={() => setLanguage(language === 'telugu' ? 'english' : 'telugu')}>
            <Globe size={16} />
            {language === 'telugu' ? 'EN' : 'తె'}
          </button>
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
          {TEST_CONFIG.sections.map(section => {
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
                <span className="tab-name">{language === 'telugu' ? section.teluguName : section.name}</span>
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
          <div className="question-header">
            <div className="question-info">
              <span className="question-number">
                {language === 'telugu' ? `ప్రశ్న ${currentQuestion + 1} / ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}
              </span>
              <span className="section-badge">
                {language === 'telugu' ? TEST_CONFIG.sections.find(s => s.id === currentSection)?.teluguName : TEST_CONFIG.sections.find(s => s.id === currentSection)?.name}
              </span>
            </div>
            <div className="question-actions">
              <button 
                className={`action-btn ${isMarked ? 'marked' : ''}`} 
                onClick={handleMarkForReview}
                title={language === 'telugu' ? 'సమీక్షకు మార్క్ చేయండి' : 'Mark for Review'}
              >
                <Flag size={16} />
                {isMarked ? t.marked : t.mark}
              </button>
              <button 
                className="action-btn clear" 
                onClick={handleClearResponse}
                disabled={selectedAnswer === undefined}
                title={language === 'telugu' ? 'సమాధానం క్లియర్ చేయండి' : 'Clear Response'}
              >
                <Trash2 size={16} /> {t.clear}
              </button>
            </div>
          </div>

          <div className="question-content">
            <p className="question-text">{questionText}</p>
            
            <div className="options-container">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  data-testid={`option-${index}`}
                >
                  <span className="option-key">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {selectedAnswer === index && <Check className="check-icon" size={18} />}
                </button>
              ))}
            </div>
          </div>

          <div className="question-navigation">
            <button 
              className="nav-btn prev" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft size={20} /> {t.previous}
            </button>
            
            <div className="nav-center">
              <button 
                className="nav-btn mark-next"
                onClick={handleMarkAndNext}
              >
                <Flag size={18} /> {t.markNext}
              </button>
            </div>
            
            <button 
              className="nav-btn next"
              onClick={handleSaveAndNext}
            >
              {t.saveNext} <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Question Palette */}
        {showQuestionPalette && (
          <div className="question-palette">
            <div className="palette-header">
              <h3>{language === 'telugu' ? 'ప్రశ్న పాలెట్' : 'Question Palette'}</h3>
              <span className="answered-count">
                {totalStats.totalAnswered}/{totalStats.totalQuestions} {language === 'telugu' ? 'సమాధానం' : 'Answered'}
              </span>
            </div>

            <div className="palette-legend">
              <div className="legend-row">
                <span className="legend-item"><span className="dot not-visited"></span> {language === 'telugu' ? 'చూడలేదు' : 'Not Visited'}</span>
                <span className="legend-item"><span className="dot not-answered"></span> {language === 'telugu' ? 'సమాధానం లేదు' : 'Not Answered'}</span>
              </div>
              <div className="legend-row">
                <span className="legend-item"><span className="dot answered"></span> {language === 'telugu' ? 'సమాధానం' : 'Answered'}</span>
                <span className="legend-item"><span className="dot marked"></span> {language === 'telugu' ? 'మార్క్' : 'Marked'}</span>
              </div>
            </div>

            <div className="palette-sections">
              {TEST_CONFIG.sections.map(section => {
                const sectionQuestions = allQuestions[section.id] || [];
                const stats = getSectionStats(section.id);
                return (
                  <div key={section.id} className={`palette-section ${currentSection === section.id ? 'active' : ''}`}>
                    <div className="section-header" onClick={() => handleSectionChange(section.id)}>
                      <span>{language === 'telugu' ? section.teluguName : section.name}</span>
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

            <button 
              className="submit-btn"
              onClick={() => setShowConfirmSubmit(true)}
              data-testid="submit-test-btn"
            >
              {t.submitTest}
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
              <h3>{t.submitTest}?</h3>
            </div>
            
            <div className="modal-stats">
              <div className="stat-row">
                <span>{t.totalQuestions}</span>
                <span className="value">{totalStats.totalQuestions}</span>
              </div>
              <div className="stat-row answered">
                <span>{t.answered}</span>
                <span className="value">{totalStats.totalAnswered}</span>
              </div>
              <div className="stat-row">
                <span>{t.notAnswered}</span>
                <span className="value">{totalStats.totalNotAnswered}</span>
              </div>
              <div className="stat-row">
                <span>{t.notVisited}</span>
                <span className="value">{totalStats.totalNotVisited}</span>
              </div>
              <div className="stat-row marked">
                <span>{t.markedReview}</span>
                <span className="value">{totalStats.totalMarked}</span>
              </div>
            </div>

            {totalStats.totalNotAnswered + totalStats.totalNotVisited > 0 && (
              <p className="warning-text">
                {language === 'telugu' 
                  ? `మీకు ${totalStats.totalNotAnswered + totalStats.totalNotVisited} సమాధానం ఇవ్వని ప్రశ్నలు ఉన్నాయి. మీరు ఖచ్చితంగా సమర్పించాలనుకుంటున్నారా?`
                  : `You have ${totalStats.totalNotAnswered + totalStats.totalNotVisited} unanswered questions. Are you sure you want to submit?`}
              </p>
            )}

            <div className="modal-actions">
              <button className="btn cancel" onClick={() => setShowConfirmSubmit(false)}>
                {t.cancel}
              </button>
              <button className="btn confirm" onClick={handleSubmitQuiz}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
