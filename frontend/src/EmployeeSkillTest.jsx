import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ChevronLeft, ChevronRight, Check, X, Globe, User, Shield, 
  Clock, BookOpen, Award, Users, ArrowRight, Phone, Mail
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/employee-skill`;

// Landing Page Component
function LandingPage({ language, setLanguage, setCurrentPage, setEmployeeId }) {
  const navigate = useNavigate();

  return (
    <div className="employee-landing">
      <header className="employee-header">
        <div className="header-left">
          <BookOpen size={28} className="logo-icon" />
          <span className="brand">{language === 'te' ? 'ఉద్యోగి నైపుణ్య మూల్యాంకనం' : 'Employee Skill Assessment'}</span>
        </div>
        <button className="lang-toggle" onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}>
          <Globe size={18} />
          {language === 'en' ? 'English' : 'తెలుగు'}
        </button>
      </header>

      <main className="landing-content">
        <div className="landing-text">
          <h1>{language === 'te' ? 'ఉద్యోగి నైపుణ్య మూల్యాంకనం' : 'Employee Skill Assessment'}</h1>
          <p>{language === 'te' ? 'వృత్తి నైపుణ్యాలను అంచనా వేయండి' : 'Assess Professional Skills'}</p>
          
          <div className="landing-buttons">
            <button className="primary-btn" onClick={() => setCurrentPage('register')}>
              <User size={20} />
              {language === 'te' ? 'ఉద్యోగి లాగిన్' : 'Employee Login'}
              <ArrowRight size={18} />
            </button>
            <button className="secondary-btn" onClick={() => setCurrentPage('admin-login')}>
              <Shield size={20} />
              {language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Admin Login'}
            </button>
          </div>
        </div>
        <div className="landing-image">
          <img 
            src="https://images.unsplash.com/photo-1758691736975-9f7f643d178e?crop=entropy&cs=srgb&fm=jpg&w=600" 
            alt="Professional team" 
          />
        </div>
      </main>

      <footer className="employee-footer">
        <p>© 2025 Edu9 Career Guidance | <Phone size={14} /> 9133311450 | <Mail size={14} /> info@edu9.in</p>
      </footer>
    </div>
  );
}

// Registration Page
function RegisterPage({ language, setLanguage, setCurrentPage, setEmployeeId }) {
  const [formData, setFormData] = useState({ name: '', designation: '', mobile: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API}/register`, formData);
      if (response.data.success) {
        setEmployeeId(response.data.employee_id);
        setCurrentPage('test');
      }
    } catch (err) {
      setError(language === 'te' ? 'నమోదు విఫలమైంది' : 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="employee-register">
      <header className="employee-header">
        <button className="back-btn" onClick={() => setCurrentPage('landing')}>
          <ChevronLeft size={20} />
          {language === 'te' ? 'హోమ్ కు వెళ్ళండి' : 'Back to Home'}
        </button>
        <button className="lang-toggle" onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}>
          <Globe size={18} />
          {language === 'en' ? 'English' : 'తెలుగు'}
        </button>
      </header>

      <div className="register-container">
        <div className="register-form-section">
          <h2>{language === 'te' ? 'నమోదు చేయండి' : 'Register'}</h2>
          <p className="subtitle">{language === 'te' ? 'ఉద్యోగి లాగిన్' : 'Employee Login'}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{language === 'te' ? 'పేరు' : 'Name'}</label>
              <input 
                type="text" 
                placeholder={language === 'te' ? 'పేరు' : 'Name'}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{language === 'te' ? 'హోదా' : 'Designation'}</label>
              <input 
                type="text" 
                placeholder={language === 'te' ? 'హోదా' : 'Designation'}
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}</label>
              <input 
                type="tel" 
                placeholder={language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{language === 'te' ? 'ఇమెయిల్' : 'Email'}</label>
              <input 
                type="email" 
                placeholder={language === 'te' ? 'ఇమెయిల్' : 'Email'}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            {error && <p className="error-msg">{error}</p>}
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '...' : (language === 'te' ? 'న మోడు చేయండి' : 'Register')}
            </button>
          </form>
          
          <p className="login-link">
            {language === 'te' ? 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ చేయండి' : 'Already have an account? Login'}
          </p>
        </div>

        <div className="register-info-section">
          <BookOpen size={48} />
          <h3>{language === 'te' ? 'ఉద్యోగి నైపుణ్య మూల్యాంకనం' : 'Employee Skill Assessment'}</h3>
          <p>{language === 'te' ? 'వృత్తి నైపుణ్యాలను అంచనా వేయండి' : 'Assess Professional Skills'}</p>
        </div>
      </div>
    </div>
  );
}

// Admin Login Page
function AdminLoginPage({ language, setLanguage, setCurrentPage, setIsAdmin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API}/admin/login`, formData);
      if (response.data.success) {
        setIsAdmin(true);
        setCurrentPage('admin-dashboard');
      } else {
        setError(language === 'te' ? 'తప్పు క్రెడెన్షియల్స్' : 'Invalid credentials');
      }
    } catch (err) {
      setError(language === 'te' ? 'లాగిన్ విఫలమైంది' : 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="employee-register">
      <header className="employee-header">
        <button className="back-btn" onClick={() => setCurrentPage('landing')}>
          <ChevronLeft size={20} />
          {language === 'te' ? 'హోమ్ కు వెళ్ళండి' : 'Back to Home'}
        </button>
        <button className="lang-toggle" onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}>
          <Globe size={18} />
          {language === 'en' ? 'English' : 'తెలుగు'}
        </button>
      </header>

      <div className="register-container">
        <div className="register-form-section">
          <h2>{language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Admin Login'}</h2>
          <p className="subtitle">{language === 'te' ? 'అడ్మిన్ పేనల్ యాక్సెస్ చేసి పరీక్ష ఫలితాలను చూడండి' : 'Access admin panel to view test results'}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{language === 'te' ? 'యూజర్‌నేమ్' : 'Username'}</label>
              <input 
                type="text" 
                placeholder={language === 'te' ? 'యూజర్‌నేమ్' : 'Username'}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}</label>
              <input 
                type="password" 
                placeholder={language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            
            {error && <p className="error-msg">{error}</p>}
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '...' : (language === 'te' ? 'లాగిన్' : 'Login')}
            </button>
          </form>
        </div>

        <div className="register-info-section admin-info">
          <Shield size={48} />
          <h3>{language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Admin Login'}</h3>
          <p>{language === 'te' ? 'ఉద్యోగుల పరీక్ష ఫలితాలను చూడండి మరియు పర్యవేక్షించండి' : 'View and monitor employee test results'}</p>
        </div>
      </div>
    </div>
  );
}

// Test Page
function TestPage({ language, setLanguage, employeeId, setCurrentPage, setTestResult }) {
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(170 * 60); // 170 minutes
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchQuestions = async () => {
    try {
      const [questionsRes, sectionsRes] = await Promise.all([
        axios.get(`${API}/questions`),
        axios.get(`${API}/sections`)
      ]);
      setQuestions(questionsRes.data.questions);
      setSections(sectionsRes.data.sections);
      if (sectionsRes.data.sections.length > 0) {
        setCurrentSection(sectionsRes.data.sections[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sectionQuestions = questions.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex) => {
    if (currentQuestion) {
      setAnswers({...answers, [currentQuestion.id]: optionIndex});
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
    setCurrentQuestionIndex(0);
  };

  const handleSubmit = async () => {
    try {
      const answersList = Object.entries(answers).map(([qId, answer]) => ({
        question_id: parseInt(qId),
        selected_answer: answer
      }));

      const response = await axios.post(`${API}/submit`, {
        employee_id: employeeId,
        answers: answersList,
        time_taken: (170 * 60) - timeRemaining
      });

      setTestResult(response.data);
      setCurrentPage('results');
    } catch (err) {
      console.error('Error submitting test:', err);
    }
  };

  const getAnsweredCount = (sectionId) => {
    const sectionQs = questions.filter(q => q.section === sectionId);
    return sectionQs.filter(q => answers[q.id] !== undefined).length;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{language === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="employee-test">
      <header className="test-header">
        <div className="header-left">
          <BookOpen size={24} />
          <span>{language === 'te' ? 'నైపుణ్య పరీక్ష' : 'Skill Test'}</span>
        </div>
        <div className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
          <Clock size={20} />
          <span>{formatTime(timeRemaining)}</span>
        </div>
        <button className="lang-toggle" onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}>
          <Globe size={18} />
          {language === 'en' ? 'English' : 'తెలుగు'}
        </button>
      </header>

      <div className="section-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`section-tab ${currentSection === section.id ? 'active' : ''}`}
            onClick={() => handleSectionChange(section.id)}
          >
            <span className="section-name">{language === 'te' ? section.name_te : section.name}</span>
            <span className="section-progress">{getAnsweredCount(section.id)}/{section.questions}</span>
          </button>
        ))}
      </div>

      <div className="test-content">
        <div className="question-panel">
          <div className="question-header">
            <span className="question-number">
              {language === 'te' ? 'ప్రశ్న' : 'Question'} {currentQuestionIndex + 1} / {sectionQuestions.length}
            </span>
          </div>

          {currentQuestion && (
            <div className="question-content">
              <p className="question-text">
                {language === 'te' ? currentQuestion.telugu.question : currentQuestion.english.question}
              </p>
              
              <div className="options-list">
                {(language === 'te' ? currentQuestion.telugu.options : currentQuestion.english.options).map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {answers[currentQuestion.id] === index && <Check size={18} className="check-icon" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="navigation-buttons">
            <button 
              className="nav-btn prev" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft size={20} />
              {language === 'te' ? 'మునుపటి' : 'Previous'}
            </button>
            <button 
              className="nav-btn next" 
              onClick={handleNext}
              disabled={currentQuestionIndex === sectionQuestions.length - 1}
            >
              {language === 'te' ? 'తదుపరి' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="question-palette">
          <h3>{language === 'te' ? 'ప్రశ్న పాలెట్' : 'Question Palette'}</h3>
          <p className="answered-count">
            {language === 'te' ? 'సమాధానం ఇచ్చినవి' : 'Answered'}: {Object.keys(answers).length}/{questions.length}
          </p>
          
          <div className="palette-legend">
            <div className="legend-item"><span className="dot answered"></span> {language === 'te' ? 'సమాధానం ఇచ్చినవి' : 'Answered'}</div>
            <div className="legend-item"><span className="dot not-answered"></span> {language === 'te' ? 'సమాధానం ఇవ్వనివి' : 'Not Answered'}</div>
          </div>

          <div className="palette-questions">
            {sectionQuestions.map((q, index) => (
              <button
                key={q.id}
                className={`q-btn ${answers[q.id] !== undefined ? 'answered' : ''} ${currentQuestionIndex === index ? 'current' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button className="submit-test-btn" onClick={() => setShowConfirm(true)}>
            {language === 'te' ? 'పరీక్ష సమర్పించు' : 'Submit Test'}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{language === 'te' ? 'పరీక్ష సమర్పించాలా?' : 'Submit Test?'}</h3>
            <div className="modal-stats">
              <p>{language === 'te' ? 'మొత్తం ప్రశ్నలు' : 'Total Questions'}: {questions.length}</p>
              <p>{language === 'te' ? 'సమాధానం ఇచ్చినవి' : 'Answered'}: {Object.keys(answers).length}</p>
              <p>{language === 'te' ? 'సమాధానం ఇవ్వనివి' : 'Unanswered'}: {questions.length - Object.keys(answers).length}</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
                {language === 'te' ? 'రద్దు' : 'Cancel'}
              </button>
              <button className="confirm-btn" onClick={handleSubmit}>
                {language === 'te' ? 'సమర్పించు' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Results Page
function ResultsPage({ language, setLanguage, testResult, setCurrentPage }) {
  if (!testResult) return null;

  return (
    <div className="employee-results">
      <header className="results-header">
        <BookOpen size={28} />
        <h2>{language === 'te' ? 'పరీక్ష ఫలితాలు' : 'Test Results'}</h2>
      </header>

      <div className="results-content">
        <div className="score-card">
          <div className="score-circle">
            <span className="score-value">{testResult.percentage}%</span>
          </div>
          <div className="score-details">
            <p><strong>{language === 'te' ? 'మొత్తం ప్రశ్నలు' : 'Total Questions'}:</strong> {testResult.total_questions}</p>
            <p><strong>{language === 'te' ? 'సమాధానం ఇచ్చినవి' : 'Attempted'}:</strong> {testResult.total_attempted}</p>
            <p className="correct"><strong>{language === 'te' ? 'సరైనవి' : 'Correct'}:</strong> {testResult.total_correct}</p>
          </div>
        </div>

        <div className="section-results">
          <h3>{language === 'te' ? 'విభాగాల వారీగా ఫలితాలు' : 'Section-wise Results'}</h3>
          <div className="results-table">
            <div className="table-header">
              <div className="table-cell">{language === 'te' ? 'విభాగం' : 'Section'}</div>
              <div className="table-cell">{language === 'te' ? 'మొత్తం' : 'Total'}</div>
              <div className="table-cell">{language === 'te' ? 'ప్రయత్నించినవి' : 'Attempted'}</div>
              <div className="table-cell">{language === 'te' ? 'సరైనవి' : 'Correct'}</div>
              <div className="table-cell">%</div>
            </div>
            {Object.entries(testResult.sections).map(([sectionId, data]) => (
              <div key={sectionId} className="table-row">
                <div className="table-cell">{data.name}</div>
                <div className="table-cell">{data.total}</div>
                <div className="table-cell">{data.attempted}</div>
                <div className="table-cell">{data.correct}</div>
                <div className="table-cell">{data.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <button className="back-home-btn" onClick={() => setCurrentPage('landing')}>
          {language === 'te' ? 'హోమ్ కు వెళ్ళండి' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
}

// Admin Dashboard with Analytics
function AdminDashboard({ language, setLanguage, setCurrentPage, setIsAdmin }) {
  const [results, setResults] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'employees', 'analytics'
  const [suggestionText, setSuggestionText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsRes, employeesRes] = await Promise.all([
        axios.get(`${API}/admin/results`),
        axios.get(`${API}/admin/employees`)
      ]);
      setResults(resultsRes.data.results);
      setEmployees(employeesRes.data.employees);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('landing');
  };

  const handleAddSuggestion = async (employeeId) => {
    try {
      await axios.post(`${API}/admin/suggestion`, {
        employee_id: employeeId,
        suggestion: suggestionText
      });
      setSuggestionText('');
      fetchData();
      alert(language === 'te' ? 'సూచన జోడించబడింది' : 'Suggestion added successfully');
    } catch (err) {
      console.error('Error adding suggestion:', err);
    }
  };

  // Calculate analytics
  const analytics = {
    totalEmployees: employees.length,
    totalTests: results.length,
    avgScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1) : 0,
    highPerformers: results.filter(r => r.percentage >= 80).length,
    mediumPerformers: results.filter(r => r.percentage >= 50 && r.percentage < 80).length,
    lowPerformers: results.filter(r => r.percentage < 50).length,
    sectionStats: {}
  };

  // Calculate section-wise stats
  results.forEach(result => {
    if (result.sections) {
      Object.entries(result.sections).forEach(([sectionId, data]) => {
        if (!analytics.sectionStats[sectionId]) {
          analytics.sectionStats[sectionId] = { name: data.name, totalScore: 0, count: 0 };
        }
        analytics.sectionStats[sectionId].totalScore += data.percentage;
        analytics.sectionStats[sectionId].count += 1;
      });
    }
  });

  const getSkillLevel = (percentage) => {
    if (percentage >= 80) return { level: language === 'te' ? 'అత్యుత్తమం' : 'Excellent', color: '#10b981' };
    if (percentage >= 60) return { level: language === 'te' ? 'మంచి' : 'Good', color: '#3b82f6' };
    if (percentage >= 40) return { level: language === 'te' ? 'సగటు' : 'Average', color: '#f59e0b' };
    return { level: language === 'te' ? 'మెరుగుపరచాలి' : 'Needs Improvement', color: '#ef4444' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{language === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-left">
          <Shield size={28} />
          <span>{language === 'te' ? 'అడ్మిన్ డాష్‌బోర్డ్' : 'Admin Dashboard'}</span>
        </div>
        <div className="header-right">
          <button className="lang-toggle" onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}>
            <Globe size={18} />
            {language === 'en' ? 'English' : 'తెలుగు'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            {language === 'te' ? 'లాగ్ అవుట్' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
          onClick={() => setViewMode('overview')}
        >
          {language === 'te' ? 'సారాంశం' : 'Overview'}
        </button>
        <button 
          className={`tab-btn ${viewMode === 'employees' ? 'active' : ''}`}
          onClick={() => setViewMode('employees')}
        >
          {language === 'te' ? 'ఉద్యోగులు' : 'Employees'}
        </button>
        <button 
          className={`tab-btn ${viewMode === 'analytics' ? 'active' : ''}`}
          onClick={() => setViewMode('analytics')}
        >
          {language === 'te' ? 'విశ్లేషణ' : 'Analytics'}
        </button>
      </div>

      <div className="dashboard-content">
        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <>
            <div className="stats-cards">
              <div className="stat-card">
                <Users size={32} />
                <div>
                  <span className="stat-value">{analytics.totalEmployees}</span>
                  <span className="stat-label">{language === 'te' ? 'మొత్తం ఉద్యోగులు' : 'Total Employees'}</span>
                </div>
              </div>
              <div className="stat-card">
                <Award size={32} />
                <div>
                  <span className="stat-value">{analytics.totalTests}</span>
                  <span className="stat-label">{language === 'te' ? 'పరీక్షలు పూర్తయినవి' : 'Tests Completed'}</span>
                </div>
              </div>
              <div className="stat-card">
                <BookOpen size={32} />
                <div>
                  <span className="stat-value">{analytics.avgScore}%</span>
                  <span className="stat-label">{language === 'te' ? 'సగటు స్కోర్' : 'Average Score'}</span>
                </div>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="performance-section">
              <h3>{language === 'te' ? 'పనితీరు పంపిణీ' : 'Performance Distribution'}</h3>
              <div className="performance-bars">
                <div className="perf-bar">
                  <div className="perf-label">
                    <span className="dot" style={{background: '#10b981'}}></span>
                    {language === 'te' ? 'అత్యుత్తమం (≥80%)' : 'Excellent (≥80%)'}
                  </div>
                  <div className="perf-value">{analytics.highPerformers}</div>
                </div>
                <div className="perf-bar">
                  <div className="perf-label">
                    <span className="dot" style={{background: '#f59e0b'}}></span>
                    {language === 'te' ? 'సగటు (50-79%)' : 'Average (50-79%)'}
                  </div>
                  <div className="perf-value">{analytics.mediumPerformers}</div>
                </div>
                <div className="perf-bar">
                  <div className="perf-label">
                    <span className="dot" style={{background: '#ef4444'}}></span>
                    {language === 'te' ? 'మెరుగుపరచాలి (<50%)' : 'Needs Improvement (<50%)'}
                  </div>
                  <div className="perf-value">{analytics.lowPerformers}</div>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className="results-section">
              <h3>{language === 'te' ? 'ఇటీవలి పరీక్ష ఫలితాలు' : 'Recent Test Results'}</h3>
              {results.length === 0 ? (
                <p className="no-data">{language === 'te' ? 'ఇంకా ఫలితాలు లేవు' : 'No results yet'}</p>
              ) : (
                <table className="results-table-full">
                  <thead>
                    <tr>
                      <th>{language === 'te' ? 'ఉద్యోగి పేరు' : 'Employee Name'}</th>
                      <th>{language === 'te' ? 'స్కోర్' : 'Score'}</th>
                      <th>{language === 'te' ? 'స్థాయి' : 'Level'}</th>
                      <th>{language === 'te' ? 'తేదీ' : 'Date'}</th>
                      <th>{language === 'te' ? 'చర్యలు' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 10).map(result => {
                      const skillLevel = getSkillLevel(result.percentage);
                      return (
                        <tr key={result.id}>
                          <td>{result.employee_name}</td>
                          <td><span className="score-badge">{result.percentage}%</span></td>
                          <td><span className="level-badge" style={{background: skillLevel.color}}>{skillLevel.level}</span></td>
                          <td>{new Date(result.timestamp).toLocaleDateString()}</td>
                          <td>
                            <button className="view-btn" onClick={() => setSelectedEmployee(result)}>
                              {language === 'te' ? 'వివరాలు' : 'Details'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Employees Mode */}
        {viewMode === 'employees' && (
          <div className="employees-section">
            <h3>{language === 'te' ? 'నమోదైన ఉద్యోగులు' : 'Registered Employees'}</h3>
            {employees.length === 0 ? (
              <p className="no-data">{language === 'te' ? 'ఇంకా ఉద్యోగులు లేరు' : 'No employees yet'}</p>
            ) : (
              <table className="results-table-full">
                <thead>
                  <tr>
                    <th>{language === 'te' ? 'పేరు' : 'Name'}</th>
                    <th>{language === 'te' ? 'హోదా' : 'Designation'}</th>
                    <th>{language === 'te' ? 'మొబైల్' : 'Mobile'}</th>
                    <th>{language === 'te' ? 'ఇమెయిల్' : 'Email'}</th>
                    <th>{language === 'te' ? 'నమోదు తేదీ' : 'Registered'}</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.designation || '-'}</td>
                      <td>{emp.mobile}</td>
                      <td>{emp.email}</td>
                      <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Analytics Mode */}
        {viewMode === 'analytics' && (
          <div className="analytics-section">
            <h3>{language === 'te' ? 'నైపుణ్య విశ్లేషణ' : 'Skill Analysis'}</h3>
            
            {/* Section-wise Performance */}
            <div className="section-analytics">
              <h4>{language === 'te' ? 'విభాగాల వారీగా సగటు పనితీరు' : 'Section-wise Average Performance'}</h4>
              <div className="section-bars">
                {Object.entries(analytics.sectionStats).map(([sectionId, data]) => {
                  const avgPercentage = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
                  const skillLevel = getSkillLevel(parseFloat(avgPercentage));
                  return (
                    <div key={sectionId} className="section-bar-item">
                      <div className="section-bar-header">
                        <span className="section-bar-name">{data.name}</span>
                        <span className="section-bar-value" style={{color: skillLevel.color}}>{avgPercentage}%</span>
                      </div>
                      <div className="section-bar-bg">
                        <div 
                          className="section-bar-fill" 
                          style={{width: `${avgPercentage}%`, background: skillLevel.color}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Insights */}
            <div className="skill-insights">
              <h4>{language === 'te' ? 'నైపుణ్య అంతర్దృష్టులు' : 'Skill Insights'}</h4>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon" style={{background: '#10b981'}}>
                    <Check size={24} />
                  </div>
                  <div className="insight-content">
                    <h5>{language === 'te' ? 'బలమైన విభాగాలు' : 'Strong Areas'}</h5>
                    <p>
                      {Object.entries(analytics.sectionStats)
                        .filter(([_, data]) => data.count > 0 && (data.totalScore / data.count) >= 60)
                        .map(([_, data]) => data.name)
                        .join(', ') || (language === 'te' ? 'డేటా లేదు' : 'No data')}
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon" style={{background: '#ef4444'}}>
                    <X size={24} />
                  </div>
                  <div className="insight-content">
                    <h5>{language === 'te' ? 'మెరుగుపరచాల్సిన విభాగాలు' : 'Areas to Improve'}</h5>
                    <p>
                      {Object.entries(analytics.sectionStats)
                        .filter(([_, data]) => data.count > 0 && (data.totalScore / data.count) < 60)
                        .map(([_, data]) => data.name)
                        .join(', ') || (language === 'te' ? 'అన్నీ మంచివి!' : 'All good!')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Recommendations */}
            <div className="recommendations">
              <h4>{language === 'te' ? 'శిక్షణ సిఫార్సులు' : 'Training Recommendations'}</h4>
              <div className="rec-list">
                {analytics.lowPerformers > 0 && (
                  <div className="rec-item">
                    <span className="rec-priority high">{language === 'te' ? 'అత్యవసరం' : 'High Priority'}</span>
                    <p>{analytics.lowPerformers} {language === 'te' ? 'ఉద్యోగులకు అదనపు శిక్షణ అవసరం' : 'employees need additional training'}</p>
                  </div>
                )}
                {Object.entries(analytics.sectionStats)
                  .filter(([_, data]) => data.count > 0 && (data.totalScore / data.count) < 50)
                  .map(([sectionId, data]) => (
                    <div key={sectionId} className="rec-item">
                      <span className="rec-priority medium">{language === 'te' ? 'మధ్యస్థం' : 'Medium'}</span>
                      <p>{data.name} {language === 'te' ? 'విభాగంలో నైపుణ్యాలు మెరుగుపరచాలి' : 'section needs skill improvement'}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <h3>{selectedEmployee.employee_name} - {language === 'te' ? 'వివరమైన నివేదిక' : 'Detailed Report'}</h3>
            
            <div className="detail-score">
              <div className="score-circle" style={{background: getSkillLevel(selectedEmployee.percentage).color}}>
                <span className="score-value">{selectedEmployee.percentage}%</span>
              </div>
              <div className="score-info">
                <p><strong>{language === 'te' ? 'స్థాయి' : 'Level'}:</strong> {getSkillLevel(selectedEmployee.percentage).level}</p>
                <p><strong>{language === 'te' ? 'మొత్తం ప్రశ్నలు' : 'Total Questions'}:</strong> {selectedEmployee.total_questions}</p>
                <p><strong>{language === 'te' ? 'సరైన సమాధానాలు' : 'Correct Answers'}:</strong> {selectedEmployee.total_correct}</p>
                <p><strong>{language === 'te' ? 'సమయం' : 'Time Taken'}:</strong> {Math.floor(selectedEmployee.time_taken / 60)} {language === 'te' ? 'నిమిషాలు' : 'minutes'}</p>
              </div>
            </div>

            {/* Section Breakdown */}
            <div className="section-breakdown">
              <h4>{language === 'te' ? 'విభాగాల వారీగా పనితీరు' : 'Section-wise Performance'}</h4>
              {selectedEmployee.sections && Object.entries(selectedEmployee.sections).map(([sectionId, data]) => {
                const skillLevel = getSkillLevel(data.percentage);
                return (
                  <div key={sectionId} className="section-detail">
                    <div className="section-detail-header">
                      <span>{data.name}</span>
                      <span style={{color: skillLevel.color}}>{data.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="section-bar-bg">
                      <div className="section-bar-fill" style={{width: `${data.percentage}%`, background: skillLevel.color}}></div>
                    </div>
                    <div className="section-stats">
                      <span>{language === 'te' ? 'సరైనవి' : 'Correct'}: {data.correct}/{data.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Suggestion */}
            <div className="suggestion-section">
              <h4>{language === 'te' ? 'సూచన/గమనిక జోడించండి' : 'Add Suggestion/Note'}</h4>
              <textarea
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                placeholder={language === 'te' ? 'ఈ ఉద్యోగికి సూచన లేదా గమనిక రాయండి...' : 'Write a suggestion or note for this employee...'}
              ></textarea>
              <button className="add-suggestion-btn" onClick={() => handleAddSuggestion(selectedEmployee.employee_id)}>
                {language === 'te' ? 'సూచన జోడించు' : 'Add Suggestion'}
              </button>
            </div>

            <button className="close-modal-btn" onClick={() => setSelectedEmployee(null)}>
              {language === 'te' ? 'మూసివేయి' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function EmployeeSkillTest() {
  const [language, setLanguage] = useState('te'); // Default Telugu
  const [currentPage, setCurrentPage] = useState('landing');
  const [employeeId, setEmployeeId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} setEmployeeId={setEmployeeId} />;
      case 'register':
        return <RegisterPage language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} setEmployeeId={setEmployeeId} />;
      case 'admin-login':
        return <AdminLoginPage language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} setIsAdmin={setIsAdmin} />;
      case 'test':
        return <TestPage language={language} setLanguage={setLanguage} employeeId={employeeId} setCurrentPage={setCurrentPage} setTestResult={setTestResult} />;
      case 'results':
        return <ResultsPage language={language} setLanguage={setLanguage} testResult={testResult} setCurrentPage={setCurrentPage} />;
      case 'admin-dashboard':
        return <AdminDashboard language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} setIsAdmin={setIsAdmin} />;
      default:
        return <LandingPage language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} setEmployeeId={setEmployeeId} />;
    }
  };

  return (
    <div className="employee-skill-app">
      {renderPage()}
    </div>
  );
}
