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
import Navbar from "./NavbarComponent";
import "./ProgrammingTestPage.css";

/* ================= LEVEL INDICATOR ================= */

const LevelIndicator = ({ level }) => {
  const angle = level * 90 - 45;

  return (
    <div className="level-indicator">
      <svg className="gauge" viewBox="0 0 100 50">

        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke="#e6e6e6"
          strokeWidth="10"
        />

        <path
          d="M10 50 A40 40 0 0 1 50 10"
          fill="none"
          stroke="#1e88e5"
          strokeWidth="10"
        />

        <path
          d="M50 10 A40 40 0 0 1 90 50"
          fill="none"
          stroke="#1e88e5"
          strokeWidth="10"
        />

        <line
          x1="50"
          y1="50"
          x2={50 + 40 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={50 + 40 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="#333"
          strokeWidth="3"
        />

      </svg>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

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
  const [needleLevel, setNeedleLevel] = useState(0);

  const [submissionMessage, setSubmissionMessage] = useState("");

  /* ================= AUTH CHECK ================= */

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/LoginPage");
    }

  }, [navigate]);

  /* ================= FETCH QUESTIONS ================= */

  useEffect(() => {

    const fetchQuestions = async () => {

      try {

        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/LoginPage");
          return;
        }

        const response = await fetch(
          "https://api.codingboss.in/compiler/questions/",
          {
            method: "GET",

            headers: {
              "Content-Type": "application/json",

              // ✅ JWT
              Authorization: `Bearer ${token}`,

              // ✅ FIX NGROK WARNING
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const text = await response.text();

        console.log("RAW RESPONSE:", text);

        if (!response.ok) {
          throw new Error(text);
        }

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Not JSON (Ngrok HTML page)");
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid API format");
        }

        setQuestions(data);

        // Default LOW
        const low = data
          .filter((q) => q.level === "Low")
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        setFilteredQuestions(low);

      } catch (err) {

        console.error("Fetch Error:", err);

        setError("Session expired or server offline. Please login again.");

      } finally {

        setLoading(false);

      }
    };

    fetchQuestions();

  }, [navigate]);

  /* ================= FILTER ================= */

  const handleFilter = (level) => {

    setFilterLevel(level);

    if (level === "Low") setNeedleLevel(0);
    if (level === "Medium") setNeedleLevel(1);
    if (level === "High") setNeedleLevel(2);

    const filtered = questions
      .filter((q) => q.level === level)
      .sort(() => 0.5 - Math.random())
      .slice(0, level === "Low" ? 5 : 2);

    setFilteredQuestions(filtered);
  };

  /* ================= SUBMIT MESSAGE ================= */

  useEffect(() => {

    const msg = localStorage.getItem("submitMessage");

    if (msg) {

      setSubmissionMessage(msg);

      setTimeout(() => {
        localStorage.removeItem("submitMessage");
        setSubmissionMessage("");
      }, 4000);
    }

  }, []);

  /* ================= START TEST ================= */

  const handleStart = (question) => {

    if (!isLoggedIn) {
      navigate("/LoginPage");
      return;
    }

    navigate("/QuestionPage", {
      state: {
        questionId: question.id,
        question,
      },
    });
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  /* ================= UI ================= */

  return (
    <>

      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <Container>

        {/* SPEEDOMETER */}
        <div className="d-flex justify-content-center mb-4">
          <LevelIndicator level={needleLevel} />
        </div>

        {/* FILTER BUTTONS */}
        <div className="level-buttons-container">

          <button
            className={`level-button Low ${
              filterLevel === "Low" ? "selected" : ""
            }`}
            onClick={() => handleFilter("Low")}
          >
            Low
          </button>

          <button
            className={`level-button Medium ${
              filterLevel === "Medium" ? "selected" : ""
            }`}
            onClick={() => handleFilter("Medium")}
          >
            Medium
          </button>

          <button
            className={`level-button High ${
              filterLevel === "High" ? "selected" : ""
            }`}
            onClick={() => handleFilter("High")}
          >
            High
          </button>

        </div>

        {/* QUESTIONS */}
        <Row className="mt-3">

          {filteredQuestions.length > 0 ? (

            filteredQuestions.map((question) => (

              <Col key={question.id} md={12} className="mb-3">

                <Card className="question-card shadow-sm">

                  <Card.Body className="d-flex justify-content-between align-items-center">

                    <span>{question.question}</span>

                    <Button
                      size="sm"
                      onClick={() => handleStart(question)}
                      style={{
                        minWidth: "80px",
                        height: "32px",
                        backgroundColor: "#017a8c",
                        borderColor: "#017a8c",
                      }}
                    >
                      Start
                    </Button>

                  </Card.Body>

                </Card>

              </Col>

            ))

          ) : (

            <Col md={12} className="text-center">
              <p>No questions available</p>
            </Col>

          )}

        </Row>

      </Container>

    </>
  );
};

export default ProgrammingTestPage;
