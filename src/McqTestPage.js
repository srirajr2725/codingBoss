// src/McqTestPage.js

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Alert, Spinner, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { FaShieldAlt, FaLock } from 'react-icons/fa';
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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [error, setError] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null); // Ref for capturing frames

  // 🔥 NEW: Frame Upload Proctoring Logic
  useEffect(() => {
    let interval;
    if (isTestStarted && cameraStream) {
      interval = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');

          // Set optimized canvas dimensions for proctoring (reduces payload size)
          canvas.width = 320;
          canvas.height = 240;

          // Draw frame with scaling
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Use full base64 data URL (required by backend)
          const imageData = canvas.toDataURL('image/jpeg', 0.1);

          try {
            const res = await fetch('https://copious-frill-parrot.ngrok-free.dev/exam/upload-frame/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Required to bypass ngrok browser warning
              },
              body: JSON.stringify({
                student_id: 1,
                image: imageData
              })
            });
            if (!res.ok) {
              const errText = await res.text();
              console.error('Upload failed:', res.status, errText);
            } else {
              console.log('Frame uploaded successfully', res.status);
            }
          } catch (error) {
            console.error('Error uploading frame:', error);
          }
        }
      }, 10000); // Upload every 10 seconds
    }
    return () => clearInterval(interval);
  }, [isTestStarted, cameraStream]);

  // Required by MCQQuiz component to track answer progress
  const updateQuestionStatus = (questionId, status) => {
    setQuestionStatus((prev) => ({ ...prev, [questionId]: status }));
  };

  // 🔥 FIX: Ensure video stream is attached after the video element is rendered
  useEffect(() => {
    if (isTestStarted && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isTestStarted, cameraStream]);

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);

      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }

      setIsTestStarted(true);
      setTestStartTime(Date.now());
    } catch (err) {
      toast.error("❌ Camera access and Fullscreen are required to start the test!");
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    const fetchQuestions = async () => {
      // 🚨 CRITICAL: If state is missing (e.g. on refresh), redirect back
      if (!subtype) {
        console.warn('Test metadata missing, redirecting to explorer...');
        navigate('/TestPage', { replace: true });
        return;
      }

      try {
        setError(null);
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
          if (data.length === 0) {
            setError('No questions available for this category.');
          } else {
            setQuestions(data);
            setTestStartTime(Date.now());
          }
        } else {
          setError('Invalid data received from server.');
        }
      } catch (err) {
        console.error('Error fetching MCQ data:', err);
        setError('Failed to load questions. Please check your connection or try again later.');
      }
    };

    fetchQuestions();
  }, [subtype, filterCategory, navigate]);

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

  const handleTabSwitch = useCallback(() => {
    if (isTestCompleted) return;

    setTabSwitchCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        toast.error("🚫 Maximum tab switches reached. Test terminated!", {
          position: "top-center",
          autoClose: 4000,
        });
        setTimeout(() => {
          submitTest({});
        }, 1500);
      } else {
        toast.warning(`⚠️ Tab switch detected (${newCount}/2 warnings)`, {
          position: "top-center",
          autoClose: 2000,
        });
      }
      return newCount;
    });
  }, [isTestCompleted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isTestCompleted) {
        handleTabSwitch();
      }
    };

    const handleFocusLost = () => {
      if (!isTestCompleted) {
        handleTabSwitch();
      }
    };

    window.addEventListener("blur", handleFocusLost);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleFocusLost);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleTabSwitch, isTestCompleted]);

  useEffect(() => {
    const preventClipboard = (e) => {
      if (!isTestCompleted) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("❌ Copy / Paste / Cut is disabled during the test!");
        return false;
      }
    };

    const preventRightClick = (e) => {
      if (!isTestCompleted) {
        e.preventDefault();
        toast.error("❌ Right click is disabled during the test!");
        return false;
      }
    };

    const preventKeyboardShortcuts = (e) => {
      if (isTestCompleted) return;
      if (
        (e.ctrlKey || e.metaKey) &&
        (
          e.key.toLowerCase() === "c" ||
          e.key.toLowerCase() === "v" ||
          e.key.toLowerCase() === "x" ||
          e.key.toLowerCase() === "a" ||
          e.key.toLowerCase() === "s" ||
          e.key.toLowerCase() === "u"
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("❌ Shortcut disabled during the test!");
        return false;
      }
      if (e.key === "F12") {
        e.preventDefault();
        toast.error("❌ Developer tools disabled during test!");
        return false;
      }
    };

    const disableSelection = () => {
      if (!isTestCompleted) {
        document.body.style.userSelect = "none";
      }
    };

    const enableSelection = () => {
      document.body.style.userSelect = "auto";
    };

    disableSelection();
    window.addEventListener("keydown", preventKeyboardShortcuts, true);
    window.addEventListener("copy", preventClipboard, true);
    window.addEventListener("cut", preventClipboard, true);
    window.addEventListener("paste", preventClipboard, true);
    window.addEventListener("contextmenu", preventRightClick, true);

    return () => {
      enableSelection();
      window.removeEventListener("keydown", preventKeyboardShortcuts, true);
      window.removeEventListener("copy", preventClipboard, true);
      window.removeEventListener("cut", preventClipboard, true);
      window.removeEventListener("paste", preventClipboard, true);
      window.removeEventListener("contextmenu", preventRightClick, true);
    };
  }, [isTestCompleted]);

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

  if (error) {
    return (
      <div className="flex-center flex-column text-center p-4">
        <div style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '24px' }}>⚠️</div>
        <h3 style={{ fontWeight: 800, color: '#0f172a' }}>Assessment Error</h3>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '32px' }}>{error}</p>
        <button
          className="btn btn-dark px-4 py-2"
          style={{ borderRadius: '12px', fontWeight: 800 }}
          onClick={() => navigate('/TestPage', { replace: true })}
        >
          Return to Explorer
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-center flex-column">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3" style={{ fontWeight: 600, color: '#64748b' }}>Syncing questions...</p>
      </div>
    );
  }

  if (!isTestStarted) {
    return (
      <div className="ide-lock-screen">
        <div className="ide-lock-card text-center">
          <div className="ide-lock-icon" style={{ fontSize: '3rem', color: '#FFA003', marginBottom: '24px' }}>
            <FaShieldAlt />
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: '16px' }}>Secure Assessment Portal</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>
            To ensure the integrity of this evaluation, you must enable your camera and enter fullscreen mode.
            All tab switches and browser interactions are strictly monitored.
          </p>
          <button
            className="btn btn-dark w-100 py-3"
            style={{ borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem' }}
            onClick={startProctoring}
          >
            Initialize Secure Environment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* CAMERA PREVIEW */}
      <div className="camera-proctor-box">
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="camera-status">
          <div className="pulse"></div> PROCTORING ACTIVE
        </div>
      </div>

      <MCQQuiz
        questions={questions}
        updateQuestionStatus={updateQuestionStatus}
        submitTest={submitTest}
      />
    </div>
  );
};

export default McqTestPage;