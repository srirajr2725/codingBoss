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
import { FaTerminal, FaCode, FaBrain, FaChevronRight, FaExclamationTriangle, FaShieldAlt, FaLightbulb } from 'react-icons/fa';
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

        // Using the new endpoint specified by the user
        const response = await fetch("https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/test-cases/", {
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        let questionsArray = [];

        if (Array.isArray(data)) {
          questionsArray = data;
        } else if (data && data.questions && Array.isArray(data.questions)) {
          questionsArray = data.questions;
        } else if (data && data.data && Array.isArray(data.data)) {
          questionsArray = data.data;
        } else {
          // Fallback to legacy structure if new one fails
          const legacyData = await apiClient("https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/", "GET");
          questionsArray = Array.isArray(legacyData) ? legacyData : (legacyData.questions || []);
        }

        // Map fields to ensure consistency
        const normalizedQuestions = questionsArray.map(q => ({
          ...q,
          id: q.id || q.question_id || q.question,
          title: q.title || q.name || "Untitled Challenge",
          question: typeof q.question === 'string' ? q.question : (q.problem_statement || "No description available."),
          difficulty: q.difficulty || q.level || "Low",
          hints: q.hints || q.hint || "",
          algorithm: q.algorithm || q.algo || "",
          example_code: q.example_programs || q.example_code || q.code_example || ""
        }));

        setQuestions(normalizedQuestions);

        // Default Filter (Low)
        const initialFiltered = normalizedQuestions.filter((q) => {
          const diff = q.difficulty || "Low";
          return diff.toLowerCase() === "low";
        });
        setFilteredQuestions(initialFiltered);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Unable to load challenges. Falling back to primary server.");

        // Fallback attempt
        try {
          const fallbackData = await apiClient("https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/", "GET");
          const array = Array.isArray(fallbackData) ? fallbackData : (fallbackData.questions || []);
          setQuestions(array);
          setFilteredQuestions(array.filter(q => (q.difficulty || q.level || "Low").toLowerCase() === "low"));
        } catch (fallbackErr) {
          setError("All systems are down. Please try again later.");
        }
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
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
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
                    </div>

                    {/* Extra Info: Hints, Algorithm, Example Code */}
                    <div className="problem-details-grid">
                      {question.hints && (
                        <div className="detail-item">
                          <h6><FaLightbulb className="me-2 text-warning" /> Hint</h6>
                          <p className="small text-muted" style={{ whiteSpace: 'pre-wrap' }}>{question.hints}</p>
                        </div>
                      )}
                      {question.algorithm && (
                        <div className="detail-item">
                          <h6><FaBrain className="me-2 text-primary" /> Algorithm</h6>
                          <p className="small text-muted" style={{ whiteSpace: 'pre-wrap' }}>{question.algorithm}</p>
                        </div>
                      )}
                      {question.example_code && (
                        <div className="detail-item full-width">
                          <h6><FaCode className="me-2 text-success" /> Example Code</h6>
                          <pre className="example-code-block">
                            <code>{question.example_code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
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
