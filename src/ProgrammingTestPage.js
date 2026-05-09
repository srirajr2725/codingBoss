import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTerminal, FaCode, FaBrain, FaChevronRight, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import Navbar from "./NavbarComponent";
import apiClient from "./utils/apiClient";
import "./ProgrammingTestPage.css";

const ProgrammingTestPage = ({
  isLoggedIn,
  setIsLoggedIn,
  userRole,
  handleLogout,
  username,
}) => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterLevel, setFilterLevel] = useState("Low");
  const [showWarning, setShowWarning] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiClient("compiler/questions/", "GET");
        let questionsArray = data;

        if (data && !Array.isArray(data)) {
          if (Array.isArray(data.questions)) {
            questionsArray = data.questions.map((q, idx) => {
              if (data.base_tests && data.base_tests[idx]) {
                return { ...q, base_tests: [data.base_tests[idx]] };
              }
              return q;
            });
          } else if (Array.isArray(data.base_tests)) {
            questionsArray = data.base_tests;
          } else if (Array.isArray(data.data)) {
            questionsArray = data.data;
          }
        }

        if (!Array.isArray(questionsArray)) {
          throw new Error("Invalid API format");
        }

        setQuestions(questionsArray);

        // Default Filter
        const initialFiltered = questionsArray.filter((q) => {
          const diff = q.level || q.difficulty || "Low";
          return diff.toLowerCase() === "low";
        });
        setFilteredQuestions(initialFiltered);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Unable to load challenges. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  /* ================= FILTER ================= */
  const handleFilter = (level) => {
    setFilterLevel(level);
    const filtered = questions.filter((q) => {
      const diff = q.level || q.difficulty || "Low";
      return diff.toLowerCase() === level.toLowerCase();
    });
    setFilteredQuestions(filtered);
  };

  /* ================= START TEST ================= */
  const handleStart = (question) => {
    if (!isLoggedIn) {
      navigate("/LoginPage");
      return;
    }
    setSelectedQuestion(question);
    setShowWarning(true);
  };

  const confirmStart = () => {
    setShowWarning(false);
    navigate("/QuestionPage", {
      state: {
        questionId: selectedQuestion.id,
        question: selectedQuestion,
      },
    });
  };

  const getDifficultyIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return <FaCode />;
      case 'medium': return <FaTerminal />;
      case 'high': return <FaBrain />;
      default: return <FaCode />;
    }
  };

  if (loading) {
    return (
      <div className="programming-page-container d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="programming-page-container">
      {/* ================= WARNING MODAL ================= */}
      {showWarning && (
        <div className="warning-overlay">
          <div className="warning-card">
            <div className="warning-icon"><FaExclamationTriangle /></div>
            <h4 className="warning-title">Proctoring Instructions</h4>
            <p className="text-center text-muted mb-4">You are entering a secure IDE environment.</p>
            <ul className="instructions-list">
              <li>Camera monitoring will be enabled</li>
              <li>Fullscreen mode is mandatory</li>
              <li>Tab switching leads to disqualification</li>
              <li>Malpractice is strictly prohibited</li>
              <li>Right-click and clipboard are disabled</li>
            </ul>
            <div className="d-flex justify-content-center gap-3">
              <Button className="quiz-btn btn-attended" style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={() => setShowWarning(false)}>Cancel</Button>
              <Button className="quiz-btn btn-start" style={{ background: '#0f172a', color: 'white', border: 'none' }} onClick={confirmStart}>
                Initialize Secure Lab
              </Button>
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
        <header className="explorer-header mt-4">
          <h1 className="explorer-title">Coding Challenges</h1>
          <p className="explorer-subtitle">
            Master your skills with real-world programming problems. 
            Choose your difficulty and start building.
          </p>
        </header>

        <div className="difficulty-tabs-wrapper">
          <div className="difficulty-tabs">
            {["Low", "Medium", "High"].map((level) => (
              <button
                key={level}
                className={`difficulty-tab ${filterLevel === level ? "selected" : ""}`}
                onClick={() => handleFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="text-center mx-auto" style={{ maxWidth: '600px', borderRadius: '16px' }}>
            {error}
          </Alert>
        )}

        <Row className="justify-content-center">
          <Col lg={10}>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="programming-card">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="problem-info">
                      <div className="problem-icon-wrapper">
                        {getDifficultyIcon(filterLevel)}
                      </div>
                      <p className="problem-text">{question.question}</p>
                    </div>
                    <Button
                      className="start-btn"
                      onClick={() => handleStart(question)}
                    >
                      Start Challenge <FaChevronRight className="ms-2" />
                    </Button>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>
                  No challenges found for the {filterLevel} level.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProgrammingTestPage;
