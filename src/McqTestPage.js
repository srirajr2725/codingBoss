import React, { useEffect, useState } from 'react';
import MCQQuiz from './MCQQuiz';
import apiClient from './utils/apiClient';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Alert, Spinner, Container } from 'react-bootstrap';

const McqTestPage = ({ isLoggedIn, setIsLoggedIn }) => {

  const { state } = useLocation();
  const { subtype, filterCategory } = state || {};
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [questionStatus, setQuestionStatus] = useState({});
  const [userid, setUserid] = useState('');
  const [testStartTime, setTestStartTime] = useState(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);

  const updateQuestionStatus = (questionId, status) => {
    setQuestionStatus((prevStatus) => ({
      ...prevStatus,
      [questionId]: status,
    }));
  };

  // Session is handled by App.js


  // ================= FETCH QUESTIONS =================
  useEffect(() => {

    const fetchQuestions = async () => {

      try {

        const storedEncryptedUserID = localStorage.getItem('userID');

        if (storedEncryptedUserID) {

          const bytes = CryptoJS.AES.decrypt(
            storedEncryptedUserID,
            'thirancoding360mgai'
          );

          const decryptedUserid = bytes.toString(CryptoJS.enc.Utf8);
          setUserid(decryptedUserid);

          // 🔥 LOCAL STORAGE LOCK CHECK
          const localTestKey = `mcq_completed_${decryptedUserid}_${subtype}_${filterCategory || 'Technical'}`;

          if (localStorage.getItem(localTestKey)) {
            setIsTestCompleted(true);
            return;
          }

          // 🔥 BACKEND CHECK
          try {
            const checkResponse = await apiClient(
              `compiler/check-test-completed/?user_id=${decryptedUserid}&subtype=${subtype}&type=${filterCategory || 'Technical'}`,
              'GET'
            );

            if (checkResponse.is_completed || checkResponse.completed) {
              setIsTestCompleted(true);
              localStorage.setItem(localTestKey, "true"); 
              return;
            }
          } catch (err) {
            console.error("Completion check failed:", err);
          }
        }

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


  // ================= SUBMIT TEST =================
  const submitTest = async (answers) => {

    setCompletionLoading(true);

    const payloadMcqEvaluate = {
      user_id: Number(userid),
      type: filterCategory || 'Technical',
      subtype: subtype,
      answers: answers,
    };

    try {

      const response = await apiClient(
        'compiler/evaluate/',
        'POST',
        payloadMcqEvaluate,
        { 'Content-Type': 'application/json' }
      );

      if (response.user_id || response.score !== undefined) {

        const correctAnswers = response.correct_answers || response.score || 0;
        const totalQuestions = questions.length;

        const timeTaken = testStartTime
          ? Math.round((Date.now() - testStartTime) / 60000)
          : 0;

        const results = {
          testType: 'MCQ',
          score: correctAnswers,
          maxScore: totalQuestions,
          percentage: Math.round((correctAnswers / totalQuestions) * 100),
          totalQuestions,
          correctAnswers,
          incorrectAnswers: totalQuestions - correctAnswers,
          unattempted: 0,
          timeTaken,
          category: filterCategory,
          subtype,
          completedAt: new Date().toISOString(),
        };

        localStorage.setItem('testResults', JSON.stringify(results));
        localStorage.setItem('submitMessage', 'Test Submitted Successfully!');

        // 🔥 SAVE LOCAL LOCK
        const localTestKey = `mcq_completed_${userid}_${subtype}_${filterCategory || 'Technical'}`;
        localStorage.setItem(localTestKey, "true");

        // 🔥 MARK IN BACKEND
        try {
          await apiClient(
            `compiler/mark-test-completed/`,
            'POST',
            JSON.stringify({
              user_id: userid,
              subtype: subtype,
              type: filterCategory || 'Technical',
              score: correctAnswers,
              total_questions: totalQuestions,
            }),
            { 'Content-Type': 'application/json' }
          );
        } catch (err) {
          console.log('Could not mark test as completed:', err);
        }

        navigate("/UserDashboard");
      }

    } catch (error) {
      console.error('Error submitting MCQ data:', error);
      navigate(-1);
    } finally {
      setCompletionLoading(false);
    }
  };


  // ================= ALREADY COMPLETED UI =================
  if (isTestCompleted) {
    return (
      <Container className="mt-5 p-4" style={{ backgroundColor: '#fff5f5', borderRadius: '12px', border: '1px solid #feb2b2' }}>
        <Alert variant="danger" style={{ border: 'none', background: 'transparent' }}>
          <Alert.Heading className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>🚫</span> Already Attended
          </Alert.Heading>
          <hr />
          <p className="mb-4">
            It looks like you have already completed this <strong>{subtype}</strong> test. 
            Multiple attempts are not allowed for this evaluation.
          </p>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-danger px-4"
              style={{ borderRadius: '8px', fontWeight: 'bold' }}
              onClick={() => navigate('/UserDashboard')}
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

  return (
    <MCQQuiz
      questions={questions}
      updateQuestionStatus={updateQuestionStatus}
      submitTest={submitTest}
    />
  );
};

export default McqTestPage;