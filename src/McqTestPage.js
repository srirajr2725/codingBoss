import React, { useEffect, useState } from 'react';
import MCQQuiz from './MCQQuiz';
import apiClient from './utils/apiClient';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Alert, Spinner, Container } from 'react-bootstrap';

const McqTestPage = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {
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



  useEffect(() => {
    if (!isLoggedIn) {
      if (localStorage.getItem("username") && localStorage.getItem("password")) {
        const email = localStorage.getItem("username");
        const EncryptPassword = localStorage.getItem("password");
        const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const Login = async () => {
          try {
            const response = await apiClient(
              "quiz/users/login/",
              "POST",
              JSON.stringify({ email, password }),
              { "Content-Type": "application/json" }
            );
            if (!response.status === "success") {
              navigate('/LoginPage');
            }
            setIsLoggedIn(true);
          } catch (error) {
            navigate('/LoginPage');
          }
        }
        Login();
      }
      else {

        navigate('/LoginPage');
      }
    }
  }, [isLoggedIn, navigate])




  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const storedEncryptedUserID = localStorage.getItem('userID');
        if (storedEncryptedUserID) {
          const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
          const decryptedUserid = bytes.toString(CryptoJS.enc.Utf8);
          setUserid(decryptedUserid);

          // Check if test is already completed
          try {
            const checkResponse = await apiClient(
              `compiler/check-test-completed/?user_id=${decryptedUserid}&subtype=${subtype}&type=${filterCategory || 'Technical'}`,
              'GET'
            );
            if (checkResponse.is_completed || checkResponse.completed) {
              setIsTestCompleted(true);
            }
          } catch (err) {
            console.log('Could not check completion status:', err);
          }
        }

        const data = await apiClient(`compiler/filter-by-subtype/?subtype=${subtype}`, 'GET');
        if (Array.isArray(data)) {
          setQuestions(data);
          setTestStartTime(Date.now());
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching MCQ data:', error);
      }
    };

    fetchQuestions();
  }, [subtype, filterCategory]);

  useEffect(() => {
  const startTime = Date.now();
  localStorage.setItem("testStartTime", startTime);
}, []);

const startTime = Number(localStorage.getItem("testStartTime"));
const endTime = Date.now();

// minutes (rounded)
const timeTaken = startTime
  ? Math.max(1, Math.round((endTime - startTime) / 60000))
  : 0;


  const submitTest = async (answers) => {
    setCompletionLoading(true);

    const payloadMcqEvaluate = {
    user_id: Number(userid),  
    type: filterCategory || 'Technical',
    subtype: subtype,
    answers: answers,          
  };


    console.log("Sending payload:", payloadMcqEvaluate);

    try {
    const response = await apiClient(
      'compiler/evaluate/',
      'POST',
      payloadMcqEvaluate,   
      {
        'Content-Type': 'application/json',
      }
    );

      if (response.user_id || response.score !== undefined) {
        // Calculate score from correct answers
        const correctAnswers = response.correct_answers || response.score || 0;
        const totalQuestions = questions.length;
        const scorePercentage = (correctAnswers / totalQuestions) * 100;
        const timeTaken = testStartTime ? Math.round((Date.now() - testStartTime) / 60000) : 0;

        // Store results
     const results = {
  testType: 'MCQ',
  score: correctAnswers,
  maxScore: totalQuestions,
  percentage: Math.round((correctAnswers / totalQuestions) * 100),
  totalQuestions,
  correctAnswers,
  incorrectAnswers: totalQuestions - correctAnswers,
  unattempted: 0,
  timeTaken,                // 🔥 IMPORTANT
  category,
  subtype,
  completedAt: new Date().toISOString(),
};



        localStorage.setItem('testResults', JSON.stringify(results));
        localStorage.setItem('submitMessage', 'Test Submitted Successfully!');

        // Mark test as completed
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

        // Navigate to results page
        navigate('/TestResults', { state: { results } });
      }
    } catch (error) {
      console.error('Error submitting MCQ data:', error);
      localStorage.setItem('submitMessage', 'Test Submitted Successfully!');
      navigate(-1);
    } finally {
      setCompletionLoading(false);
    }
  };

  // If test is already completed, show message
  if (isTestCompleted) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Test Already Completed</Alert.Heading>
          <p>
            You have already completed this test ({subtype}). You cannot retake it.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/Testpage')}
          >
            Go Back to Tests
          </button>
        </Alert>
      </Container>
    );
  }

  if (completionLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Processing results...</span>
        </Spinner>
        <p>Processing your test results...</p>
      </Container>
    );
  }

  return <MCQQuiz questions={questions} updateQuestionStatus={updateQuestionStatus} submitTest={submitTest} />;
};

export default McqTestPage;
