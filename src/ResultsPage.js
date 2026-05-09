import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaClock, FaBullseye, FaArrowRight, FaChartLine } from "react-icons/fa";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import "./ResultsPage.css";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (location?.state?.result) {
          normalize(location.state.result);
          return;
        }

        const encrypted = localStorage.getItem("userID");
        if (!encrypted) throw new Error("User session expired");
        
        const bytes = CryptoJS.AES.decrypt(encrypted, "thirancoding360mgai");
        const userId = bytes.toString(CryptoJS.enc.Utf8);

        const data = await apiClient(`compiler/mcq-marks/user/${userId}/`, "GET");
        if (!Array.isArray(data) || data.length === 0) throw new Error("Assessment history not found");

        normalize(data[data.length - 1]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location]);

  const normalize = (raw) => {
    setResults({
      score: Number(raw.marks || raw.score || 0),
      maxScore: Number(raw.total_questions || 0),
      correct: Number(raw.correct_answers || 0),
      incorrect: Number(raw.total_questions || 0) - Number(raw.correct_answers || 0),
      percentage: Number(raw.percentage || 0),
      timeTaken: raw.time_taken || 0,
      category: raw.type || "Performance Review"
    });
  };

  if (loading) return <div className="text-center py-5">Analyzing Assessment Results...</div>;
  if (error || !results) return <div className="text-center py-5 text-danger">{error || "No data available."}</div>;

  const isPass = results.percentage >= 60;

  return (
    <div className="results-container">
      <div className="results-wrapper">
        
        <div className={`rs-hero-card ${isPass ? 'passed' : 'failed'}`}>
          <div className="rs-score-circle">
            <span className="rs-score-value">{results.score}</span>
            <span className="rs-score-max">/ {results.maxScore}</span>
          </div>
          
          <h2 className="mb-2">{isPass ? "Excellent Achievement!" : "Focus & Improve"}</h2>
          <div className={`rs-status-badge ${isPass ? 'passed' : 'failed'} mb-4`}>
            {isPass ? <FaCheckCircle /> : <FaBullseye />}
            {isPass ? "Certified Proficient" : "Practice Recommended"}
          </div>
          
          <p className="text-muted">You scored higher than 85% of other candidates in this category.</p>
        </div>

        <div className="rs-stats-grid">
          <div className="rs-stat-card">
            <div className="rs-stat-icon"><FaChartLine /></div>
            <div className="rs-stat-value">{results.percentage}%</div>
            <div className="rs-stat-label">Accuracy</div>
          </div>
          
          <div className="rs-stat-card">
            <div className="rs-stat-icon"><FaClock /></div>
            <div className="rs-stat-value">{results.timeTaken}m</div>
            <div className="rs-stat-label">Duration</div>
          </div>
          
          <div className="rs-stat-card">
            <div className="rs-stat-icon"><FaTrophy /></div>
            <div className="rs-stat-value">{results.correct}</div>
            <div className="rs-stat-label">Correct</div>
          </div>
        </div>

        <div className="rs-actions">
          <button className="rs-btn rs-btn-primary" onClick={() => navigate("/UserDashboard")}>
            Back to Workspace <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
