// src/components/MCQQuiz.js

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Sparkles
} from "lucide-react";
import { FaLock, FaShieldAlt } from "react-icons/fa";
import "./MCQQuiz.css";

function MCQQuiz({ questions, updateQuestionStatus, submitTest, initialTimeLeft, initialLockTime, onAnswersChange }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 1500); // 25 Min Total or Passed Remaining
  const [questionTimers, setQuestionTimers] = useState({});

  // Sync remaining time dynamically when passed from parent
  useEffect(() => {
    if (initialTimeLeft !== undefined && initialTimeLeft !== null) {
      setTimeLeft(initialTimeLeft);
    }
  }, [initialTimeLeft]);
  const [questionSpentTimes, setQuestionSpentTimes] = useState({});
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [unattemptedCount, setUnattemptedCount] = useState(questions.length);
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const getTimersStorageKey = (qId) => {
    const rawUser = localStorage.getItem('userID') || 'anonymous';
    const subtype = localStorage.getItem('mcq_current_subtype') || 'default_subtype';
    const category = localStorage.getItem('mcq_current_category') || 'default_category';
    return `mcq_qtimer_${rawUser}_${subtype}_${category}_${qId}`;
  };

  const getQuestionTimeRemaining = (qId) => {
    if (!qId) return initialLockTime || 75;
    if (questionTimers[qId] !== undefined) {
      return questionTimers[qId];
    }
    const storageKey = getTimersStorageKey(qId);
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      return parseInt(saved);
    }
    return initialLockTime || 75;
  };

  const isQuestionLocked = (qId) => {
    return getQuestionTimeRemaining(qId) <= 0;
  };

  // Initialize
  useEffect(() => {
    const initialAnswers = {};
    questions.forEach((q) => {
      if (q && q.id) initialAnswers[q.id] = "";
    });
    setSelectedAnswer(initialAnswers);
  }, [questions]);

  // Sync selected answers and timings to parent
  useEffect(() => {
    if (onAnswersChange) {
      onAnswersChange({
        answers: selectedAnswer,
        timings: questionSpentTimes
      });
    }
  }, [selectedAnswer, questionSpentTimes, onAnswersChange]);

  // Reset Hint on Question Change
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionIndex]);

  // Main Timer (Global 25m)
  useEffect(() => {
    if (timeLeft <= 0) {
      handleConfirmation(true); // Auto-submit
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Initialize per-question timers
  useEffect(() => {
    if (questions && questions.length > 0) {
      setQuestionTimers((prev) => {
        const newTimers = { ...prev };
        questions.forEach((q) => {
          if (newTimers[q.id] === undefined) {
            newTimers[q.id] = getQuestionTimeRemaining(q.id);
          }
        });
        return newTimers;
      });
    }
  }, [questions, initialLockTime]);

  // Tick down the active question's timer
  useEffect(() => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    const qId = currentQ.id;

    const interval = setInterval(() => {
      // 1. Accumulate spent time
      setQuestionSpentTimes((prev) => ({
        ...prev,
        [qId]: (prev[qId] || 0) + 1
      }));

      // 2. Lock time tracker
      setQuestionTimers((prev) => {
        const val = prev[qId] !== undefined ? prev[qId] : getQuestionTimeRemaining(qId);
        if (val <= 0) {
          clearInterval(interval);
          return {
            ...prev,
            [qId]: 0
          };
        }
        const nextVal = val - 1;
        const storageKey = getTimersStorageKey(qId);
        localStorage.setItem(storageKey, nextVal.toString());

        if (nextVal <= 0) {
          clearInterval(interval);
          // Auto navigate to next question if possible
          if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
              setCurrentQuestionIndex((idx) => idx + 1);
            }, 800);
          }
        }
        return {
          ...prev,
          [qId]: nextVal,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, questions, initialLockTime]);

  // Stats Logic
  useEffect(() => {
    const attempted = Object.values(selectedAnswer).filter((ans) => ans !== "").length;
    setAttemptedCount(attempted);
    setUnattemptedCount(questions.length - attempted);
  }, [selectedAnswer, questions.length]);

  const parseOptions = (options) => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    try {
      // Handle single quotes formatted json
      const parsedOptions = JSON.parse(options.replace(/'/g, '"'));
      if (Array.isArray(parsedOptions)) return parsedOptions;
    } catch {
      // Fallback for simple string lists
      return options.replace(/\[|\]/g, "").split(",").map((item) => item.trim());
    }
    return [];
  };

  const handleAnswerSelect = (answer) => {
    const qId = questions[currentQuestionIndex]?.id;
    if (!qId || isQuestionLocked(qId)) return;

    setSelectedAnswer((prev) => ({
      ...prev,
      [qId]: answer,
    }));

    updateQuestionStatus(questions[currentQuestionIndex].id, "answered");

    // Only auto-next for multiple choice questions
    if (questions[currentQuestionIndex]?.question_type !== 'fill' && autoNextEnabled && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 400);
    }
  };

  const handleInputChange = (e) => {
    const qId = questions[currentQuestionIndex]?.id;
    if (!qId || isQuestionLocked(qId)) return;

    setSelectedAnswer((prev) => ({
      ...prev,
      [qId]: e.target.value,
    }));

    updateQuestionStatus(questions[currentQuestionIndex].id, "answered");
  };

  // Dynamic AI Hint Generator based on question text
  const generateHint = (questionText) => {
    if (!questionText) return "Think about the fundamental principles of this topic before selecting an option.";
    const lowerQ = questionText.toLowerCase();

    if (lowerQ.includes("java")) return "Consider how Java handles object-oriented principles or memory management (like Garbage Collection).";
    if (lowerQ.includes("python")) return "Python emphasizes readability. Think about dynamic typing, indentation rules, and built-in data structures.";
    if (lowerQ.includes("react")) return "React relies heavily on component state and the virtual DOM. Consider how changes trigger re-renders.";
    if (lowerQ.includes("sql") || lowerQ.includes("database")) return "For databases, focus on relations, ACID properties, and how joins connect different tables.";
    if (lowerQ.includes("html") || lowerQ.includes("css")) return "Web design principles dictate structure (HTML) vs presentation (CSS).";
    if (lowerQ.includes("c++") || lowerQ.includes("pointer")) return "C++ gives direct memory access. Think about pointers, references, and manual memory management.";
    if (lowerQ.includes("loop") || lowerQ.includes("iteration")) return "Loops repeat actions. Check the exit condition to ensure it doesn't run infinitely.";
    if (lowerQ.includes("array") || lowerQ.includes("list")) return "Arrays are contiguous blocks of memory. Consider index bounds (usually 0 to length-1).";
    if (lowerQ.includes("function") || lowerQ.includes("method")) return "Functions encapsulate logic. What inputs (arguments) does it take, and what does it return?";

    // Fallback dynamic extraction
    const words = questionText.split(" ").filter(w => w.length > 5);
    const keyWord = words.length > 0 ? words[0].replace(/[^a-zA-Z]/g, '') : "the core concept";

    return `Focus on the role of '${keyWord}' in this context. Eliminating options that clearly violate standard rules will help you narrow down the correct answer.`;
  };

  const handleSubmitTest = () => setShowConfirmationDialog(true);

  const handleConfirmation = (isConfirmed) => {
    setShowConfirmationDialog(false);
    if (isConfirmed && submitTest) {
      if (questions && questions.length > 0) {
        questions.forEach((q) => {
          const storageKey = getTimersStorageKey(q.id);
          localStorage.removeItem(storageKey);
        });
      }
      submitTest(selectedAnswer);
    }
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-layout">
      {/* --- Confirmation Modal --- */}
      <AnimatePresence>
        {showConfirmationDialog && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <AlertCircle size={48} color="#6366f1" style={{ marginBottom: 16 }} />
              <h3 className="modal-title">Submit Quiz?</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                You have {unattemptedCount} unattempted questions remaining.
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => handleConfirmation(false)}>
                  Review
                </button>
                <button className="modal-btn confirm" onClick={() => handleConfirmation(true)}>
                  Submit Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Question Section (Left) --- */}
      <motion.div
        className="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="question-card">
          {/* Top Progress Bar */}
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>

          <div className="question-header">
            <span className="question-count">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>

            <div className="header-actions">
              <div className={`question-lock-timer ${isQuestionLocked(questions[currentQuestionIndex]?.id) ? 'active' : 'unlocked'}`}>
                {isQuestionLocked(questions[currentQuestionIndex]?.id) ? <FaLock className="me-2" /> : <Clock size={16} className="me-2" />}
                {isQuestionLocked(questions[currentQuestionIndex]?.id)
                  ? "Question Locked"
                  : `Locked: ${formatTime(getQuestionTimeRemaining(questions[currentQuestionIndex]?.id))}`}
              </div>

              <button
                className={`ai-hint-btn ${showHint ? 'active' : ''}`}
                onClick={() => setShowHint(!showHint)}
              >
                <Sparkles size={16} /> {showHint ? 'Hide Hint' : 'Ask AI Hint'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="question-text">
                {questions[currentQuestionIndex]?.question}
              </h2>

              {questions[currentQuestionIndex]?.question_type === "fill" ? (
                <div className="fill-blank-container">
                  <input
                    type="text"
                    className="fill-blank-input"
                    placeholder={isQuestionLocked(questions[currentQuestionIndex]?.id) ? "Question is locked" : "Type your answer here..."}
                    autoFocus
                    disabled={isQuestionLocked(questions[currentQuestionIndex]?.id)}
                    value={selectedAnswer[questions[currentQuestionIndex]?.id] || ""}
                    onChange={handleInputChange}
                  />
                  <p className="fill-hint">Enter your numeric or text answer above.</p>
                </div>
              ) : (
                <div className="options-grid">
                  {parseOptions(questions[currentQuestionIndex]?.options).map((option, i) => {
                    const qId = questions[currentQuestionIndex]?.id;
                    const isSelected = selectedAnswer[qId] === option;
                    const isLockedQ = isQuestionLocked(qId);
                    return (
                      <div
                        key={i}
                        className={`option-item ${isSelected ? "selected" : ""} ${isLockedQ ? "locked-option" : ""}`}
                        onClick={() => !isLockedQ && handleAnswerSelect(option)}
                      >
                        <div className="option-marker"></div>
                        {option}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- AI HINT COMPONENT --- */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    className="ai-hint-box"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="ai-hint-header">
                      <Sparkles size={18} color="#a855f7" />
                      <span>AI Assistant</span>
                    </div>
                    <p className="ai-hint-text">
                      <strong>Hint:</strong> {generateHint(questions[currentQuestionIndex]?.question)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </AnimatePresence>

          <div className="nav-footer">
            <button
              className="nav-btn secondary"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <button
              className="nav-btn primary"
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- Side Panel (Right) --- */}
      <motion.div
        className="side-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Timer Card */}
        <div className="info-card timer-wrapper">
          <div className="timer-label">
            <Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
            Time Remaining
          </div>
          <div className={`timer-value ${timeLeft <= 300 ? "warning" : ""}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Palette */}
        <div className="info-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <LayoutGrid size={18} /> Question Palette
          </div>
          <div className="palette-grid">
            {questions.map((_, index) => {
              const qId = questions[index]?.id;
              const isLockedQ = isQuestionLocked(qId);
              return (
                <div
                  key={index}
                  className={`palette-item 
                    ${selectedAnswer[qId] ? "answered" : ""} 
                    ${currentQuestionIndex === index ? "current" : ""}
                    ${isLockedQ ? "locked-palette" : ""}`}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                  }}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box success">
            <span className="stat-value">{attemptedCount}</span>
            <span className="stat-label">Answered</span>
          </div>
          <div className="stat-box danger">
            <span className="stat-value">{unattemptedCount}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <motion.button
          className="submit-btn"
          onClick={handleSubmitTest}
          disabled={timeLeft <= 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Submit Test
        </motion.button>
      </motion.div>
    </div>
  );
}

export default MCQQuiz;
