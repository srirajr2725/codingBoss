import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaCode, FaChevronRight, FaLock, FaExclamationTriangle, FaCheckCircle, FaClock,
  FaCalculator, FaBrain, FaUserMd, FaQuoteLeft, FaPuzzlePiece
} from 'react-icons/fa';
import Navbar from './NavbarComponent';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';
import './TestPage.css';

// Helper: get decrypted userId from localStorage
const getDecryptedUserId = () => {
  try {
    const enc = localStorage.getItem('userID');
    if (!enc) return '';
    const bytes = CryptoJS.AES.decrypt(enc, 'thirancoding360mgai');
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
};

const TestPage = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {

  const [subtypes, setSubtypes] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubtypes, setLoadingSubtypes] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('categories');
  const [filterLanguage, setFilterLanguage] = useState(() => localStorage.getItem('test_page_lang') || 'quantitative');
  const [submitMsg, setSubmitMsg] = useState('');

  // 🔥 Backend synced results for locking
  const [completedTests, setCompletedTests] = useState([]);

  // view is now initialized in useState
  const [showWarning, setShowWarning] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [domainTimeLeft, setDomainTimeLeft] = useState(1500); // Remaining
  const [totalDomainTime, setTotalDomainTime] = useState(1500); // Total Allocated
  const [questionLockTime, setQuestionLockTime] = useState(75); // 1.25 Min
  const [questionCount, setQuestionCount] = useState(20);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Helper to check if a category is fully completed
  const isCategoryCompleted = (categoryKey) => {
    const currentUserId = getDecryptedUserId();
    if (!currentUserId) return false;

    // 1. Check LocalStorage (Fastest)
    const localKey = `mcq_completed_${currentUserId}_${categoryKey}_${categoryKey}`;
    if (localStorage.getItem(localKey)) return true;

    // 2. Check Backend List (completedTests)
    return completedTests.some(test =>
      (test.subtype === categoryKey || test.type === categoryKey)
    );
  };

  // ================= AUTO REDIRECT CHECK =================
  useEffect(() => {
    if (location.state?.autoView && location.state?.autoLang) {
      setView('categories');
      setFilterLanguage(location.state.autoLang);
      localStorage.setItem('test_page_view', 'categories');
      localStorage.setItem('test_page_lang', location.state.autoLang);
    }
  }, [location.state]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('test_page_view', 'categories');
    localStorage.setItem('test_page_lang', filterLanguage);
  }, [view, filterLanguage]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // ================= DOMAIN TIMER =================
  useEffect(() => {
    let timer;
    if (view === 'tests' && domainTimeLeft > 0) {
      timer = setInterval(() => setDomainTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [view, domainTimeLeft]);

  // Recovery & Persistence Initialization
  useEffect(() => {
    if (view === 'tests') {
      const currentUserId = getDecryptedUserId();
      if (currentUserId && filterLanguage) {
        const timerKey = `domain_expiry_${currentUserId}_${filterLanguage}`;
        const storedExpiry = localStorage.getItem(timerKey);
        const now = Date.now();

        if (storedExpiry) {
          const expiry = parseInt(storedExpiry);
          const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
          if (remaining > 0) {
            setDomainTimeLeft(remaining);
          } else {
            setDomainTimeLeft(0);
          }
        } else {
          // Set new expiry if not exists
          const expiry = now + domainTimeLeft * 1000;
          localStorage.setItem(timerKey, expiry.toString());
        }
      }
    }
  }, [view, filterLanguage]);



  const quantsImg = "/categories/quants.png";
  const logicImg = "/categories/logical.png";
  const psychoImg = "/categories/psychometric.png";
  const verbalImg = "/categories/verbal.png";

  // ================= FETCH CATEGORY & COMPLETED TESTS =================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (localStorage.getItem('submitMessage')) {
          setSubmitMsg(localStorage.getItem('submitMessage'));
          localStorage.removeItem('submitMessage');
        }

        // Fetch Completed Tests for robust locking
        const currentUserId = getDecryptedUserId();
        if (currentUserId) {
          const marksData = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/mcq-marks/user/${currentUserId}/`, "GET");
          if (Array.isArray(marksData?.results)) {
            setCompletedTests(marksData.results);
          }
        }
      } catch (error) {
        setError('Server maintenance is scheduled until 6 AM. Please try again after that.');
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);


  // ================= FETCH SUBTYPE =================
  useEffect(() => {
    const fetchSubtypes = async () => {
      if (filterLanguage) {
        setLoadingSubtypes(filterLanguage);
        try {
          const response = await apiClient(
            `https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/sample/?language=${filterLanguage}`,
            'GET'
          );

          // Extract unique subtypes from the questions
          let uniqueSubtypes = [];
          if (Array.isArray(response)) {
            uniqueSubtypes = [...new Set(response.map(q => q.subtype).filter(Boolean))];
          }

          setSubtypes((prev) => ({
            ...prev,
            [filterLanguage]: uniqueSubtypes,
          }));
        } catch (error) {
          setError(`Failed to fetch subtypes for ${filterLanguage}.`);
        } finally {
          setLoadingSubtypes(null);
        }
      }
    };
    fetchSubtypes();
  }, [filterLanguage]);


  // ================= CATEGORY SELECT =================
  const handleSelectCategory = (language) => {
    if (isCategoryCompleted(language)) return;
    setFilterLanguage(language);

    // Set Domain-Specific Timers
    let initialSeconds = 1500; // 25m
    let lockSeconds = 75; // 1.25m
    let qCount = 20;

    if (language === 'quantitative') {
      initialSeconds = 1500; // 25m
      lockSeconds = 75;      // 1.25m
      qCount = 20;
    }
    if (language === 'logical') {
      initialSeconds = 900;  // 15m
      lockSeconds = 90;     // 1.5m
      qCount = 10;
    }
    if (language === 'Psychomatric') {
      initialSeconds = 300;  // 5m
      lockSeconds = 60;     // 1m
      qCount = 5;
    }
    if (language === 'verbal') {
      initialSeconds = 900;  // 15m
      lockSeconds = 90;     // 1.5m
      qCount = 10;
    }

    setDomainTimeLeft(initialSeconds);
    setTotalDomainTime(initialSeconds);
    setQuestionLockTime(lockSeconds);
    setQuestionCount(qCount);
    setShowEnrollment(true);
  };

  const handleConfirmEnrollment = () => {
    setShowEnrollment(false);
    setSelectedSubtype(filterLanguage);
    setShowWarning(true);
  };

  const handleConfirmWarning = () => {
    setShowWarning(false);
    navigate('/McqTestPage', {
      state: {
        subtype: selectedSubtype,
        filterCategory: filterLanguage,
        remainingTime: domainTimeLeft,
        lockTime: questionLockTime
      }
    });
  };


  // ================= START CLICK =================
  const handleStartAssessment = (subtype) => {
    if (isAlreadyAttended(subtype)) return;
    setSelectedSubtype(subtype);
    setShowWarning(true);
  };

  // 🔥 Helper to check completion (Database + LocalStorage)
  const isAlreadyAttended = (subtype) => {
    const currentUserId = getDecryptedUserId();
    if (!currentUserId) return false;

    // 1. Check LocalStorage (Fastest)
    const localTestKey = `mcq_completed_${currentUserId}_${subtype}_${filterLanguage}`;
    if (localStorage.getItem(localTestKey)) return true;

    // 2. Check Backend List (Most reliable)
    return completedTests.some(test =>
      test.subtype === subtype &&
      test.type === filterLanguage
    );
  };

  const getCategoryIcon = (lang) => {
    if (lang === 'quantitative') return <FaCalculator />;
    if (lang === 'logical') return <FaPuzzlePiece />;
    if (lang === 'Psychomatric') return <FaUserMd />;
    if (lang === 'verbal') return <FaQuoteLeft />;
    return <FaCode />;
  };

  const categories = [
    { title: 'Quants', key: 'quantitative', img: quantsImg, desc: 'Numerical ability & logic', time: '25 Min' },
    { title: 'Logical Reasoning', key: 'logical', img: logicImg, desc: 'Pattern matching & puzzles', time: '15 Min' },
    { title: 'Psychometric', key: 'Psychomatric', img: psychoImg, desc: 'Personality & behavior', time: '5 Min' },
    { title: 'Verbal Ability', key: 'verbal', img: verbalImg, desc: 'English & comprehension', time: '15 Min' }
  ];


  // ================= LOADING =================
  if (loadingInitial)
    return (
      <div className="flex-center">
        <Spinner animation="border" variant="primary" />
        <p className="ms-3">Syncing assessments...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex-center text-danger">
        <p>{error}</p>
      </div>
    );


  // ================= UI =================
  return (
    <div className="test-page-container">
      {/* ================= ENROLLMENT MODAL ================= */}
      {showEnrollment && (
        <div className="warning-overlay">
          <div className="warning-card enrollment-card">
            <div className="enrollment-header">
              <div className="enroll-badge">OFFICIAL ASSESSMENT</div>
              <h4 className="warning-title mt-3">Ready to Start?</h4>
            </div>

            <div className="stats-container-modern my-4">
              {domainTimeLeft > 0 && (
                <div className="stat-item-modern">
                  <FaClock className="stat-icon-blue" />
                  <div className="stat-text">
                    <span className="stat-label">Total Time</span>
                    <span className="stat-val">{Math.floor(domainTimeLeft / 60)} Minutes</span>
                  </div>
                </div>
              )}
              <div className="stat-item-modern border-x">
                <FaPuzzlePiece className="stat-icon-purple" />
                <div className="stat-text">
                  <span className="stat-label">Questions</span>
                  <span className="stat-val">{questionCount} Items</span>
                </div>
              </div>
              <div className="stat-item-modern">
                <FaLock className="stat-icon-orange" />
                <div className="stat-text">
                  <span className="stat-label">Focus Mode</span>
                  <span className="stat-val">{(questionLockTime / 60).toFixed(1)}m / Q</span>
                </div>
              </div>
            </div>

            <p className="enrollment-notice mb-4">
              This assessment uses <b>Strict Enforced Timing</b>. {domainTimeLeft > 0 ? `You have ${Math.floor(domainTimeLeft / 60)} minutes total and you` : 'You'} will be locked to each question for {(questionLockTime / 60).toFixed(1)} minutes to ensure full focus.
            </p>

            <div className="d-flex justify-content-center gap-3">
              <Button className="quiz-btn btn-attended" onClick={() => setShowEnrollment(false)}>Not Now</Button>
              <Button className="quiz-btn btn-start" onClick={handleConfirmEnrollment}>Join Assessment</Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= WARNING MODAL ================= */}
      {showWarning && (
        <div className="warning-overlay">
          <div className="warning-card">
            <div className="warning-icon"><FaExclamationTriangle /></div>
            <h4 className="warning-title">Test Instructions</h4>
            <ul className="instructions-list">
              <li>Do not switch tabs or windows</li>
              <li>Refresh or back navigation is disabled</li>
              <li>Malpractice is strictly prohibited</li>
              <li>Camera monitoring may be active</li>
              <li>Violations lead to immediate disqualification</li>
            </ul>
            <div className="d-flex justify-content-center gap-3">
              <Button className="quiz-btn btn-attended" onClick={() => setShowWarning(false)}>Cancel</Button>
              <Button className="quiz-btn btn-start" onClick={handleConfirmWarning}>Continue Test</Button>
            </div>
          </div>
        </div>
      )}


      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <Container>
        <div className="explorer-header text-center">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="explorer-title m-0">
              {view === 'categories' ? 'Explore ' : 'Assessment '}
              <span className="highlight-blue">{view === 'categories' ? 'Assessments' : filterLanguage.charAt(0).toUpperCase() + filterLanguage.slice(1)}</span>
            </h2>
            {view === 'tests' ? (
              <div className={`domain-timer-pill ${domainTimeLeft < 300 ? 'timer-warning' : ''}`}>
                <FaClock className="me-2" /> Domain Timer: {formatTime(domainTimeLeft)}
              </div>
            ) : (
              <div className="domain-timer-pill">
                <FaClock className="me-2" /> Overall Assessment: 1 Hour
              </div>
            )}
          </div>
          <p className="explorer-subtitle">
            {view === 'categories'
              ? 'Challenge yourself with industry-standard quizzes designed to evaluate and enhance your technical and professional skills.'
              : `Browse and attend specialized assessments in ${filterLanguage} to track your progress.`}
          </p>
        </div>

        {view === 'categories' ? (
          <div className="category-selection-grid">
            {categories.map((cat) => {
              const completed = isCategoryCompleted(cat.key);
              return (
                <div
                  key={cat.key}
                  className={`category-card-outer ${completed ? 'completed' : ''}`}
                  onClick={() => !completed && handleSelectCategory(cat.key)}
                >
                  <div className="category-card-inner glass">
                    <div className="cat-img-wrapper">
                      <img src={cat.img} alt={cat.title} />
                    </div>
                    <div className="cat-content">
                      <h4 className="cat-title">{cat.title}</h4>
                      <p className="cat-desc">{cat.desc}</p>
                      <div className="cat-meta mb-3">
                        <span className="cat-time-badge"><FaClock className="me-2" /> {cat.time}</span>
                      </div>
                      <button className={`cat-btn ${completed ? 'completed-btn' : ''}`} disabled={completed}>
                        {completed ? (
                          <><FaCheckCircle className="me-2" /> Completed</>
                        ) : (
                          <>Start Assessment <FaChevronRight className="ms-2" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="listing-controls mb-4">
              <Button variant="link" className="back-btn" onClick={() => setView('categories')}>
                <FaChevronRight style={{ transform: 'rotate(180deg)' }} /> Back to Categories
              </Button>
            </div>

            <div className="quiz-grid">
              {loadingSubtypes ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading available tests...</p>
                </div>
              ) : (
                subtypes[filterLanguage] && subtypes[filterLanguage].map((subtype, index) => {
                  const attended = isAlreadyAttended(subtype);
                  return (
                    <Card key={index} className="quiz-card">
                      <Card.Body className="d-flex justify-content-between align-items-center">
                        <div className="quiz-info">
                          <div className="quiz-icon-wrapper">
                            {getCategoryIcon(filterLanguage)}
                          </div>
                          <div>
                            <h4 className="quiz-name">{subtype}</h4>
                            <div className={`status-badge ${attended ? 'status-completed' : 'status-pending'}`}>
                              {attended ? <FaCheckCircle /> : <FaClock />}
                              <span className="ms-1">{attended ? 'Completed' : 'Available'}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          className={`quiz-btn ${attended ? 'btn-attended' : (domainTimeLeft <= 0 ? 'btn-attended' : 'btn-start')}`}
                          disabled={attended || domainTimeLeft <= 0}
                          onClick={() => handleStartAssessment(subtype)}
                        >
                          {attended ? (
                            <><FaLock className="me-2" /> Already Attended</>
                          ) : domainTimeLeft <= 0 ? (
                            <><FaLock className="me-2" /> Category Locked</>
                          ) : (
                            <>Start Assessment <FaChevronRight className="ms-2" /></>
                          )}
                        </Button>
                      </Card.Body>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default TestPage;
