import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaCode, FaClipboardList, FaChartLine, FaRocket } from 'react-icons/fa';
import apiClient from './utils/apiClient';
import CryptoJS from "crypto-js";
import './Assignments.css';

const Assignments = ({ isLoggedIn, setIsLoggedIn }) => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [programmingQuestions, setProgrammingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [mcqQuestions] = useState(["Java Mastery", "Python Basics", "C Programming", "Data Structures", "Cloud Fundamentals"]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedEncryptedUserID = localStorage.getItem('userID');
    if (storedEncryptedUserID) {
      const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
      setUserId(bytes.toString(CryptoJS.enc.Utf8));
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const questions = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/', 'GET');
        setProgrammingQuestions(questions);

        if (userId) {
          const completed = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/completed-questions/?user_id=${userId}`, 'GET');
          if (completed?.completed_questions) {
            setCompletedQuestions(completed.completed_questions);
            if (questions.length > 0) {
              setProgress((completed.completed_questions.length / questions.length) * 100);
            }
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAllData();
  }, [userId]);

  const handleStartProgramming = (question) => {
    const sebConfigUrl = "https://codingboss.in/config/thiran-seb.seb";
    window.location.href = `seb://open?config=${encodeURIComponent(sebConfigUrl)}`;
  };

  const handleStartMcq = () => {
    const sebLink = "seb://open?config=https://codingboss.in/config/thiran-mcq.seb";
    window.location.href = sebLink;
  };

  if (loading) return <div className="text-center py-5">Loading Assignments...</div>;

  return (
    <div className="as-container">
      <header className="as-header">
        <h1 className="as-title">Assignment <span>Portal</span></h1>
        <p className="text-muted">Master the curriculum through practical coding and conceptual assessments.</p>
      </header>

      <div className="as-progress-card">
        <div className="as-progress-info">
          <h4>Overall Progress</h4>
          <p className="mb-0 text-white-50">You have completed {completedQuestions.length} out of {programmingQuestions.length} programming tasks.</p>
          <div className="as-progress-bar-bg">
            <div className="as-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <FaRocket size={40} color="#FFA003" />
      </div>

      <h3 className="as-section-title"><FaCode color="#FFA003" /> Programming Lab</h3>
      <div className="as-list">
        {programmingQuestions.map((q, i) => {
          const isCompleted = completedQuestions.includes(q.id);
          const isLocked = i >= 3 && !isCompleted; // Simple lock logic for UI demo

          return (
            <div key={q.id} className={`as-item-card ${isLocked ? 'as-item-locked' : ''}`}>
              <div className="as-item-main">
                <span className="as-item-name">{q.title}</span>
                <span className="as-item-desc">{q.description || 'Live coding challenge'}</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                {isCompleted ? (
                  <div className="as-btn-completed"><FaCheckCircle /> Completed</div>
                ) : isLocked ? (
                  <FaLock className="as-lock-icon" />
                ) : (
                  <button className="as-btn-start" onClick={() => handleStartProgramming(q)}>Start Lab</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="as-section-title"><FaClipboardList color="#FFA003" /> Theoretical Assessments</h3>
      <div className="as-list">
        {mcqQuestions.map((q, i) => {
          const isCompleted = !!localStorage.getItem(`mcq_completed_${userId}_${q}_Technical`);

          return (
            <div key={i} className="as-item-card">
              <div className="as-item-main">
                <span className="as-item-name">{q}</span>
                <span className="as-item-desc">Advanced MCQ Assessment</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                {isCompleted ? (
                  <div className="as-btn-completed"><FaCheckCircle /> Completed</div>
                ) : (
                  <button className="as-btn-start" onClick={handleStartMcq}>Start Exam</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Assignments;
