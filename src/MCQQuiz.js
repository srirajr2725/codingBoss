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
import "./MCQQuiz.css";

function MCQQuiz({ questions, updateQuestionStatus, submitTest }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [unattemptedCount, setUnattemptedCount] = useState(questions.length);
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Initialize
  useEffect(() => {
    const initialAnswers = {};
    questions.forEach((_, index) => {
      initialAnswers[index + 1] = "";
    });
    setSelectedAnswer(initialAnswers);
  }, [questions]);

  // Reset Hint on Question Change
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionIndex]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

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
    setSelectedAnswer((prev) => ({
      ...prev,
      [currentQuestionIndex + 1]: answer,
    }));

    updateQuestionStatus(questions[currentQuestionIndex].id, "answered");

    if (autoNextEnabled && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 400);
    }
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
    if (isConfirmed && submitTest) submitTest(selectedAnswer);
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
              Question
              <br />
               {currentQuestionIndex + 1} / {questions.length}
            </span>

            <div className="header-actions">
              <button 
                className={`ai-hint-btn ${showHint ? 'active' : ''}`}
                onClick={() => setShowHint(!showHint)}
              >
                <Sparkles size={16} /> {showHint ? 'Hide Hint' : 'Ask AI Hint'}
              </button>

              {/* Custom Toggle Switch */}
              <label className="toggle-wrapper">
                <span className="toggle-text">Auto Next</span>
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={autoNextEnabled}
                  onChange={() => setAutoNextEnabled(!autoNextEnabled)}
                />
                <div className="toggle-bg">
                  <div className="toggle-circle"></div>
                </div>
              </label>
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

              <div className="options-grid">
                {parseOptions(questions[currentQuestionIndex]?.options).map((option, i) => {
                  const isSelected = selectedAnswer[currentQuestionIndex + 1] === option;
                  return (
                    <div
                      key={i}
                      className={`option-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <div className="option-marker"></div>
                      {option}
                    </div>
                  );
                })}
              </div>

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
            {questions.map((_, index) => (
              <div
                key={index}
                className={`palette-item 
                  ${selectedAnswer[index + 1] ? "answered" : ""} 
                  ${currentQuestionIndex === index ? "current" : ""}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </div>
            ))}
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