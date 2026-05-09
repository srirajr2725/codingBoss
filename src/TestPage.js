import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaLightbulb, FaUserTie, FaChevronRight, FaLock, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
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

const CategoryList = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {

  const [categories, setCategories] = useState([]);
  const [subtypes, setSubtypes] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubtypes, setLoadingSubtypes] = useState(null);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('Technical');
  const [submitMsg, setSubmitMsg] = useState('');
  
  // 🔥 Backend synced results for locking
  const [completedTests, setCompletedTests] = useState([]);

  // WARNING STATES
  const [showWarning, setShowWarning] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState(null);

  // Current userId for lock checks
  const userId = getDecryptedUserId();

  const navigate = useNavigate();

  // ================= FETCH CATEGORY & COMPLETED TESTS =================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (localStorage.getItem('submitMessage')) {
          setSubmitMsg(localStorage.getItem('submitMessage'));
          localStorage.removeItem('submitMessage');
        }

        // Fetch Categories
        const catData = await apiClient('compiler/get-category/', 'GET');
        setCategories(catData.categories || []);

        // Fetch Completed Tests for robust locking
        const currentUserId = getDecryptedUserId();
        if (currentUserId) {
          const marksData = await apiClient(`compiler/mcq-marks/user/${currentUserId}/`, "GET");
          if (Array.isArray(marksData?.results)) {
            setCompletedTests(marksData.results);
          }
        }

      } catch (error) {
        setError('Server maintenance is scheduled until 6 AM. Please try again after that.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchInitialData();
  }, []);


  // ================= FETCH SUBTYPE =================
  useEffect(() => {
    const fetchSubtypes = async () => {
      if (filterCategory) {
        setLoadingSubtypes(filterCategory);
        try {
          const response = await apiClient(
            `compiler/get-subtype/?category=${filterCategory}`,
            'GET'
          );
          setSubtypes((prev) => ({
            ...prev,
            [filterCategory]: response.subtypes || [],
          }));
        } catch (error) {
          setError(`Failed to fetch subtypes for ${filterCategory}.`);
        } finally {
          setLoadingSubtypes(null);
        }
      }
    };
    fetchSubtypes();
  }, [filterCategory]);


  // ================= CATEGORY SELECT =================
  const handleViewSubtypes = async (category) => {
    if (filterCategory === category) return;
    setLoadingSubtypes(category);
    try {
      const response = await apiClient(
        `compiler/get-subtype/?category=${category}`,
        'GET'
      );
      setSubtypes((prev) => ({
        ...prev,
        [category]: response.subtypes || [],
      }));
      setFilterCategory(category);
    } catch (error) {
      setError(`Data Not Available for ${category}.`);
    } finally {
      setLoadingSubtypes(null);
    }
  };


  // ================= START CLICK =================
  const handleNavigateToMcqTestPage = (subtype) => {
    if (isAlreadyAttended(subtype)) return;
    setSelectedSubtype(subtype);
    setShowWarning(true);
  };

  // 🔥 Helper to check completion (Database + LocalStorage)
  const isAlreadyAttended = (subtype) => {
    const currentUserId = getDecryptedUserId();
    if (!currentUserId) return false;

    // 1. Check LocalStorage (Fastest)
    const localTestKey = `mcq_completed_${currentUserId}_${subtype}_${filterCategory || 'Technical'}`;
    if (localStorage.getItem(localTestKey)) return true;

    // 2. Check Backend List (Most reliable)
    return completedTests.some(test => 
      test.subtype === subtype && 
      test.type === (filterCategory || 'Technical')
    );
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'Technical') return <FaCode />;
    if (cat === 'Aptitude') return <FaLightbulb />;
    if (cat === 'SoftSkill') return <FaUserTie />;
    return <FaCode />;
  };


  // ================= LOADING =================
  if (loadingCategories)
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
              <Button className="quiz-btn btn-start" onClick={() => {
                setShowWarning(false);
                navigate('/McqTestPage', {
                  state: { subtype: selectedSubtype, filterCategory }
                });
              }}>Continue Test</Button>
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
          <h2 className="explorer-title">
            Explore <span className="highlight-blue">Assessments</span>
          </h2>
          <p className="explorer-subtitle">
            Challenge yourself with industry-standard quizzes designed to evaluate and enhance your technical and professional skills.
          </p>
        </div>

        <div className="category-tabs">
          {['Technical', 'Aptitude', 'SoftSkill'].map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => handleViewSubtypes(cat)}
            >
              {getCategoryIcon(cat)} <span className="ms-2">{cat}</span>
            </button>
          ))}
        </div>

        {submitMsg && <h5 className="text-center text-success mb-4">{submitMsg}</h5>}

        <div className="quiz-grid">
          {loadingSubtypes ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading available tests...</p>
            </div>
          ) : (
            subtypes[filterCategory] && subtypes[filterCategory].map((subtype, index) => {
              const attended = isAlreadyAttended(subtype);
              return (
                <Card key={index} className="quiz-card">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="quiz-info">
                      <div className="quiz-icon-wrapper">
                        {getCategoryIcon(filterCategory)}
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
                      className={`quiz-btn ${attended ? 'btn-attended' : 'btn-start'}`}
                      disabled={attended}
                      onClick={() => handleNavigateToMcqTestPage(subtype)}
                    >
                      {attended ? (
                        <><FaLock className="me-2" /> Already Attended</>
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
      </Container>
    </div>
  );
};

export default CategoryList;
