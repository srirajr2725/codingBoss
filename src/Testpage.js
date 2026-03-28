import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavbarComponent';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';

const CategoryList = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {

  const [categories, setCategories] = useState([]);
  const [subtypes, setSubtypes] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubtypes, setLoadingSubtypes] = useState(null);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('Technical');

  const navigate = useNavigate();

  const [submitMsg, setSubmitMsg] = useState("");

  // WARNING STATES
  const [showWarning, setShowWarning] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState(null);

  // Session is handled by App.js


  // ================= FETCH CATEGORY =================
  useEffect(() => {

    const fetchCategories = async () => {

      try {

        if (localStorage.getItem('submitMessage')) {
          setSubmitMsg(localStorage.getItem('submitMessage'));
          localStorage.removeItem('submitMessage');
        }

        const data = await apiClient('compiler/get-category/', 'GET');
        setCategories(data.categories || []);

      } catch (error) {

        setError('Server maintenance is scheduled until 6 AM. Please try again after that.');

      } finally {

        setLoadingCategories(false);
      }
    };

    fetchCategories();

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
    setSelectedSubtype(subtype);
    setShowWarning(true);
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
        <p>Loading Categories...</p>
      </div>
    );


  if (error)
    return (
      <div className="text-center text-danger">
        <p>{error}</p>
      </div>
    );


  // ================= UI =================
  return (

    <>

      {/* ================= WARNING POPUP ================= */}
      {showWarning && (

        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>

          <div style={{
            background: "#fff",
            padding: "25px",
            width: "400px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
          }}>

            <h4 style={{ color: "#dc3545" }}>
              ⚠️ Test Instructions
            </h4>

            <ul style={{ textAlign: "left", marginTop: "15px" }}>
              <li>Do not switch tabs</li>
              <li>Do not refresh page</li>
              <li>No malpractice allowed</li>
              <li>Camera may be monitored</li>
              <li>Violation leads to auto submit</li>
            </ul>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap"
            }}>

              {/* NEW BACK BUTTON */}
              <Button
                variant="outline-dark"
                onClick={() => {
                  setShowWarning(false);
                  navigate('/UserDashboard'); // Go to dashboard without locking anything
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

            {subtypes[filterCategory].map((subtype, index) => (

              <Col key={index} md={12} className="mb-4">

                <Card className="question-card">

                  <Card.Body className="d-flex justify-content-between align-items-center">

                    <span>{subtype}</span>

                    <Button
                      size="sm"
                      onClick={() => handleNavigateToMcqTestPage(subtype)}
                    >
                      Start
                    </Button>

                  </Card.Body>

                </Card>

              </Col>
            ))}

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
