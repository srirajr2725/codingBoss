import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  ProgressBar,
  Spinner,
} from "react-bootstrap";

import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Clock, Target } from "lucide-react";
import CryptoJS from "crypto-js";
import "./ResultsPage.css";
import apiClient from "./utils/apiClient";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [results, setResults] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= GET USER ID =================
  useEffect(() => {
    const encrypted = localStorage.getItem("userID");

    if (!encrypted) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const bytes = CryptoJS.AES.decrypt(
      encrypted,
      "thirancoding360mgai"
    );

    setUserId(bytes.toString(CryptoJS.enc.Utf8));
  }, []);

  // ================= FETCH RESULTS =================
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // 1️⃣ From navigation (fast)
        if (location?.state?.result) {
          normalize(location.state.result);
          return;
        }

        if (!userId) return;

        // 2️⃣ From API (backup)
        const data = await apiClient(
          `compiler/mcq-marks/user/${userId}/`,
          "GET"
        );

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No results found");
        }

        // Latest attempt
        normalize(data[data.length - 1]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId, location]);

  // ================= NORMALIZE DATA =================
  const normalize = (raw) => {
    const formatted = {
      testType: "MCQ",

      score: Number(raw.marks || raw.score || 0),
      maxScore: Number(raw.total_questions || 0),

      totalQuestions: Number(raw.total_questions || 0),

      correctAnswers: Number(raw.correct_answers || 0),

      incorrectAnswers:
        Number(raw.total_questions || 0) -
        Number(raw.correct_answers || 0),

      unattempted:
        Number(raw.total_questions || 0) -
        Number(raw.attempted_questions || 0),

      percentage: Number(raw.percentage || 0),

      timeTaken: raw.time_taken || 0,

      category: raw.type || "MCQ",
      subtype: raw.subtype || "-",
    };

    setResults(formatted);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading results...</p>
      </Container>
    );
  }

  // ================= ERROR =================
  if (error || !results) {
    return (
      <Container className="text-center mt-5">
        <Card>
          <Card.Body>
            <h4>{error || "No Results Found"}</h4>

            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // ================= DATA =================
  const {
    testType,
    score,
    maxScore,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unattempted,
    timeTaken,
    category,
    subtype,
    percentage,
  } = results;

  const isPass = percentage >= 60;

  // ================= UI =================
  return (
    <Container className="results-container mt-4">

      {/* SCORE CARD */}
      <Card
        className={`score-card ${
          isPass ? "success" : "warning"
        }`}
      >
        <Card.Body className="text-center">

          {isPass ? (
            <CheckCircle size={80} color="#4caf50" />
          ) : (
            <Target size={80} color="#ff9800" />
          )}

          <h1>
            {score} / {maxScore}
          </h1>

          <h4>{percentage}%</h4>

          <p
            className={
              isPass ? "text-success" : "text-warning"
            }
          >
            {isPass ? "✓ PASSED" : "⚠ NEEDS IMPROVEMENT"}
          </p>

        </Card.Body>
      </Card>

      {/* DETAILS */}
      <Card className="mt-3">
        <Card.Body>

          <Row>
            <Col md={6}>
              <strong>Category:</strong> {category}
            </Col>

            <Col md={6}>
              <strong>Subtype:</strong> {subtype}
            </Col>
          </Row>

          <Row className="mt-2">
            <Col md={6}>
              <strong>Time Taken:</strong> {timeTaken} min
            </Col>

            <Col md={6}>
              <strong>Test Type:</strong> {testType}
            </Col>
          </Row>

        </Card.Body>
      </Card>

      {/* BREAKDOWN */}
      <Card className="mt-3">
        <Card.Body>

          <Row className="text-center">

            <Col>
              <CheckCircle />
              <p>{correctAnswers} Correct</p>
            </Col>

            <Col>
              <XCircle />
              <p>{incorrectAnswers} Incorrect</p>
            </Col>

            <Col>
              <Clock />
              <p>{unattempted} Unattempted</p>
            </Col>

          </Row>

          <ProgressBar
            now={(correctAnswers / totalQuestions) * 100}
            label={`${correctAnswers}/${totalQuestions}`}
            className="mt-3"
          />

        </Card.Body>
      </Card>

      {/* ACTION */}
      <div className="text-center mt-4">
        <Button onClick={() => navigate("/UserDashboard")}>
          Go to Dashboard
        </Button>
      </div>

    </Container>
  );
};

export default ResultsPage;
