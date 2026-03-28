import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavbarComponent';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';

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
    if (filterCategory === category) {
      setFilterCategory(null);
      return;
    }
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
    if (isAlreadyAttended(subtype)) {
      return;
    }
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


  // ================= LOADING =================
  if (loadingCategories)
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <p>Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-danger mt-5">
        <p>{error}</p>
      </div>
    );


  // ================= UI =================
  return (
    <>

      {/* ================= WARNING POPUP ================= */}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '25px',
            width: '400px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ color: '#dc3545' }}>
              ⚠️ Test Instructions
            </h4>
            <ul style={{ textAlign: 'left', marginTop: '15px' }}>
              <li>Do not switch tabs</li>
              <li>Do not refresh page</li>
              <li>No malpractice allowed</li>
              <li>Camera may be monitored</li>
              <li>Violation leads to auto submit</li>
            </ul>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px',
              flexWrap: 'wrap'
            }}>
              <Button
                variant="outline-dark"
                onClick={() => {
                  setShowWarning(false);
                  navigate('/UserDashboard', { replace: true });
                }}
              >
                ⬅ Go to Dashboard
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowWarning(false)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  setShowWarning(false);
                  navigate('/McqTestPage', {
                    state: {
                      subtype: selectedSubtype,
                      filterCategory
                    }
                  });
                }}
              >
                Continue Test
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* ================= NAVBAR ================= */}
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />


      {/* ================= MAIN ================= */}
      <Container style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '15px',
        marginTop: '80px'
      }}>

        <h2 className="text-center my-4">
          Explore <span style={{ color: '#007bff' }}>Quiz Categories</span>
        </h2>

        <div className="level-buttons-container">
          <button
            className={`level-button technical ${filterCategory === 'Technical' ? 'selected' : ''}`}
            onClick={() => handleViewSubtypes('Technical')}
          >
            Technical
          </button>
          <button
            className={`level-button aptitude ${filterCategory === 'Aptitude' ? 'selected' : ''}`}
            onClick={() => handleViewSubtypes('Aptitude')}
          >
            Aptitude
          </button>
          <button
            className={`level-button softskill ${filterCategory === 'SoftSkill' ? 'selected' : ''}`}
            onClick={() => handleViewSubtypes('SoftSkill')}
          >
            SoftSkill
          </button>
        </div>

        <h5 style={{ color: '#2E7D32' }}>{submitMsg}</h5>

        {filterCategory && subtypes[filterCategory] && (
          <Row>
            {subtypes[filterCategory].map((subtype, index) => {
              const attended = isAlreadyAttended(subtype);
              return (
                <Col key={index} md={12} className="mb-4">
                  <Card className="question-card">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <span>{subtype}</span>
                      <Button
                        size="sm"
                        disabled={attended}
                        onClick={() => handleNavigateToMcqTestPage(subtype)}
                        style={{
                          backgroundColor: attended ? '#28a745' : '#017a8c',
                          borderColor: attended ? '#28a745' : '#017a8c',
                          minWidth: '150px',
                        }}
                      >
                        {attended ? 'Already Attended' : 'Start'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {loadingSubtypes && filterCategory === loadingSubtypes && (
          <div className="text-center">
            <Spinner animation="border" />
            Loading Subtypes...
          </div>
        )}

      </Container>
    </>
  );
};

export default CategoryList;
