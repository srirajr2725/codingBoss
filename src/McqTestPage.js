// src/McqTestPage.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Alert, Spinner, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🔥 FIX: Adjusted imports to point to folders inside src/
import MCQQuiz from './MCQQuiz';
import apiClient from './utils/apiClient';

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

const McqTestPage = () => {
  const { state } = useLocation();
  const { subtype, filterCategory } = state || {};
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [questionStatus, setQuestionStatus] = useState({});
  const [testStartTime, setTestStartTime] = useState(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);

  // Required by your MCQQuiz component
  const updateQuestionStatus = (questionId, status) => {
    setQuestionStatus((prev) => ({ ...prev, [questionId]: status }));
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const currentUserId = getDecryptedUserId();

        if (currentUserId) {
          // Check Local Storage Lock
          const localTestKey = `mcq_completed_${currentUserId}_${subtype}_${filterCategory || 'Technical'}`;
          if (localStorage.getItem(localTestKey)) {
            setIsTestCompleted(true);
            return;
          }

          // Check Backend Lock
          try {
            const checkResponse = await apiClient(
              `compiler/check-test-completed/?user_id=${currentUserId}&subtype=${subtype}&type=${filterCategory || 'Technical'}`,
              'GET'
            );
            if (checkResponse.is_completed || checkResponse.completed) {
              setIsTestCompleted(true);
              localStorage.setItem(localTestKey, 'true');
              return;
            }
          } catch (err) {
            console.error('Completion check failed:', err);
          }
        }

        // Fetch Questions
        const data = await apiClient(
          `compiler/filter-by-subtype/?subtype=${subtype}`,
          'GET'
        );
        if (Array.isArray(data)) {
          setQuestions(data);
          setTestStartTime(Date.now());
        }
      } catch (error) {
        console.error('Error fetching MCQ data:', error);
      }
    };

    fetchQuestions();
  }, [subtype, filterCategory]);

  const submitTest = async (answers) => {
    setCompletionLoading(true);
    const currentUserId = getDecryptedUserId();
    const token = 
      localStorage.getItem("token") || 
      localStorage.getItem("user_token") || 
      localStorage.getItem("access_token");

    if (!token) {
      toast.error("⚠️ Authentication missing. Please log in again.");
      setCompletionLoading(false);
      setTimeout(() => navigate('/LoginPage'), 2000);
      return;
    }

    try {
      // 1. Evaluate Answers (apiClient handles the auth header)
      const response = await apiClient(
        'compiler/evaluate/',
        'POST',
        {
          user_id: Number(currentUserId),
          type: filterCategory || 'Technical',
          subtype: subtype,
          answers: answers,
        }
      );

      if (response) {
        toast.success("✅ Test Submitted Successfully!");

        const correctAnswers = response.correct_answers || response.score || 0;
        const totalQuestions = questions.length;
        const timeTaken = testStartTime
          ? Math.round((Date.now() - testStartTime) / 60000)
          : 0;

        const results = {
          testType: 'MCQ',
          score: correctAnswers,
          maxScore: totalQuestions,
          percentage: Math.round((correctAnswers / (totalQuestions || 1)) * 100),
          totalQuestions,
          correctAnswers,
          incorrectAnswers: Math.max(0, totalQuestions - correctAnswers),
          unattempted: 0,
          timeTaken,
          category: filterCategory,
          subtype,
          completedAt: new Date().toISOString(),
        };

        localStorage.setItem('testResults', JSON.stringify(results));
        localStorage.setItem('submitMessage', 'Test Submitted Successfully!');

        // Lock test locally
        const localTestKey = `mcq_completed_${currentUserId}_${subtype}_${filterCategory || 'Technical'}`;
        localStorage.setItem(localTestKey, 'true');

        // Backup backend completion mark
        try {
          await apiClient(
            'compiler/mark-test-completed/',
            'POST',
            {
              user_id: currentUserId,
              subtype: subtype,
              type: filterCategory || 'Technical',
              score: correctAnswers,
              total_questions: totalQuestions,
            }
          );
        } catch (err) {
          console.log('Backend mark-completed fallback failed.');
        }

        setTimeout(() => navigate('/UserDashboard', { replace: true }), 1500);
      }
    } catch (error) {
      console.error('Error submitting MCQ data:', error);
      toast.error("❌ Results could not be saved. Returning to dashboard...");
      setTimeout(() => navigate('/UserDashboard', { replace: true }), 2000);
    } finally {
      setCompletionLoading(false);
    }
  };

  if (isTestCompleted) {
    return (
      <Container className="mt-5 p-4" style={{ backgroundColor: '#fff5f5', borderRadius: '12px', border: '1px solid #feb2b2' }}>
        <Alert variant="danger" style={{ border: 'none', background: 'transparent' }}>
          <Alert.Heading className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>🚫</span> You are already attended
          </Alert.Heading>
          <hr />
          <p className="mb-4">
            You are already attended this <strong>{subtype}</strong> test.
            Multiple attempts are not allowed.
          </p>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-danger px-4"
              style={{ borderRadius: '8px', fontWeight: 'bold' }}
              onClick={() => navigate('/UserDashboard', { replace: true })}
            >
              Return to Dashboard
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (completionLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Processing your test results...</p>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading questions...</p>
      </Container>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <MCQQuiz
        questions={questions}
        updateQuestionStatus={updateQuestionStatus}
        submitTest={submitTest}
      />
    </>
  );
};

export default McqTestPage;