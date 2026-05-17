// src/McqTestPage.js

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Alert, Spinner, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { FaShieldAlt, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

import MCQQuiz from './MCQQuiz';
import apiClient from './utils/apiClient';
import './Proctoring.css';

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
  const { subtype: stateSubtype, filterCategory: stateCategory, remainingTime, lockTime: stateLockTime } = state || {};

  // Persistence for subtype, category, and lockTime
  const subtype = stateSubtype || localStorage.getItem('mcq_current_subtype');
  const filterCategory = stateCategory || localStorage.getItem('mcq_current_category');
  const lockTime = stateLockTime ? parseInt(stateLockTime) : (localStorage.getItem('mcq_current_locktime') ? parseInt(localStorage.getItem('mcq_current_locktime')) : 75);

  useEffect(() => {
    if (stateSubtype) localStorage.setItem('mcq_current_subtype', stateSubtype);
    if (stateCategory) localStorage.setItem('mcq_current_category', stateCategory);
    if (stateLockTime) localStorage.setItem('mcq_current_locktime', stateLockTime.toString());
  }, [stateSubtype, stateCategory, stateLockTime]);
  const navigate = useNavigate();

  const answersRef = useRef({});
  const timingsRef = useRef({});
  const handleAnswersChange = useCallback(({ answers, timings }) => {
    answersRef.current = answers || {};
    timingsRef.current = timings || {};
  }, []);

  const [questions, setQuestions] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(true);
  const [isCameraMinimized, setIsCameraMinimized] = useState(false);
  const [actualTimeLeft, setActualTimeLeft] = useState(() => {
    const userId = getDecryptedUserId();
    if (userId && filterCategory) {
      const timerKey = `domain_expiry_${userId}_${filterCategory}`;
      const storedExpiry = localStorage.getItem(timerKey);
      if (storedExpiry) {
        const remaining = Math.max(0, Math.floor((parseInt(storedExpiry) - Date.now()) / 1000));
        return remaining;
      }
    }
    return remainingTime || 1500;
  });

  // ── TIMER PERSISTENCE ──
  useEffect(() => {
    const userId = getDecryptedUserId();
    if (!userId || !filterCategory) return;

    const timerKey = `domain_expiry_${userId}_${filterCategory}`;
    const storedExpiry = localStorage.getItem(timerKey);
    const now = Date.now();

    if (storedExpiry) {
      const expiry = parseInt(storedExpiry);
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setActualTimeLeft(remaining);
    } else {
      // Set new expiry if not exists
      const expiry = now + (remainingTime || 1500) * 1000;
      localStorage.setItem(timerKey, expiry.toString());
      setActualTimeLeft(remainingTime || 1500);
    }
  }, [filterCategory, remainingTime]);

  // Update timeLeft and cleanup on finish
  useEffect(() => {
    if (isTestSubmitted) {
      const userId = getDecryptedUserId();
      localStorage.removeItem('mcq_current_subtype');
      localStorage.removeItem('mcq_current_category');
      localStorage.removeItem('mcq_current_locktime');
    }
  }, [isTestSubmitted]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // PERMANENT FIX: Suppress cross-origin "Script error." (from Face-API) to stop React overlay crashes
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.message === 'Script error.' || (event.error && event.error.message === 'Script error.')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleVisibilityChange = () => {
      console.log("Visibility Change detected. Hidden:", document.hidden, "Started:", isTestStartedRef.current);
      if (document.hidden && isTestStartedRef.current && !isTestSubmittedRef.current) {
        triggerWarning("Tab switching is strictly prohibited!", "tab_switch", true);
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('error', handleGlobalError, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isTestStarted]);
  const isTrackingRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const isUploadingRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationRef = useRef(null);
  const terminatedRef = useRef(false);
  const isHeadRotatedRef = useRef(false);
  const isFocusLostRef = useRef(false);
  const isDetectionEnabledRef = useRef(true);
  const isTestStartedRef = useRef(false);
  const isTestSubmittedRef = useRef(false);

  useEffect(() => {
    isDetectionEnabledRef.current = isDetectionEnabled;
  }, [isDetectionEnabled]);

  useEffect(() => {
    isTestStartedRef.current = isTestStarted;
  }, [isTestStarted]);

  useEffect(() => {
    isTestSubmittedRef.current = isTestSubmitted;
  }, [isTestSubmitted]);

  const [showViolationOverlay, setShowViolationOverlay] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");

  const uploadViolationFrame = async () => {
    try {
      let image = null;
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const canvas = canvasRef.current;
        canvas.width = 240;
        canvas.height = 180;
        canvas.getContext('2d', { alpha: false }).drawImage(videoRef.current, 0, 0, 240, 180);
        image = canvas.toDataURL('image/jpeg', 0.1);
      }

      await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          student_id: Number(getDecryptedUserId() || 1),
          image,
          flagged: true,
          violation_type: lastViolationRef.current?.type || null,
          violation_message: lastViolationRef.current?.message || null,
          violation_count: violationCountRef.current,
          terminated: terminatedRef.current
        })
      });
    } catch (err) { }
  };

  const triggerWarning = (msg, type = "proctoring_violation", bypassCooldown = false) => {
    const now = Date.now();
    if (!bypassCooldown && now - lastWarningTimeRef.current < 4000) return;
    lastWarningTimeRef.current = now;

    console.warn("AI PROCTOR ALERT:", msg);
    setViolationMessage(msg);
    setShowViolationOverlay(true);
    setTimeout(() => setShowViolationOverlay(false), 2500);

    if (type === 'tab_switch') {
      setTabSwitchCount(prev => {
        const next = prev + 1;
        violationCountRef.current = next;
        lastViolationRef.current = { type, message: msg, count: next, at: new Date().toISOString() };
        if (next >= 5) { // Disqualified on 5th violation
          terminatedRef.current = true;
          uploadViolationFrame();
          toast.error("🚫 DISQUALIFIED! Too many tab switches. Test submitted.");
          setIsTestSubmitted(true);
          setTimeout(() => submitTest(answersRef.current), 1000);
        } else {
          uploadViolationFrame();
          toast.error(`⚠️ WARNING (${next}/5): ${msg}`);
        }
        return next;
      });
    } else {
      // For video and other warnings (face_missing, head_switch, camera_off, ui_minimize, doctor_detect)
      // We upload the frame and warn the student, but do NOT increment the auto-submit violation counter.
      lastViolationRef.current = { type, message: msg, count: tabSwitchCount, at: new Date().toISOString() };
      uploadViolationFrame();
      toast.error(`⚠️ WARNING: ${msg}`);
    }
  };

  // 🔥 ENGINE: FACE TRACKING
  useEffect(() => {
    let timeoutId;

    const startFaceTracking = async () => {
      if (!isTestStartedRef.current || !videoRef.current || videoRef.current.readyState < 2 || !window.faceapi || !window.faceapi.detectSingleFace || isTrackingRef.current || document.hidden || isTestSubmittedRef.current) {
        timeoutId = setTimeout(startFaceTracking, 1000);
        return;
      }

      isTrackingRef.current = true;
      try {
        const detections = await window.faceapi.detectSingleFace(
          videoRef.current,
          new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
        ).withFaceLandmarks();

        if (!detections) {
          console.log("PROCTOR: No face found");
          triggerWarning("Face not detected!", "face_missing");
        } else {
          const landmarks = detections.landmarks;
          const nose = landmarks.getNose()[3];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[3];

          const eyeCenterX = (leftEye.x + rightEye.x) / 2;
          const diff = Math.abs(eyeCenterX - nose.x);

          console.log("PROCTOR DEBUG:", { diff, eyeWidth: (rightEye.x - leftEye.x) });

          // Sensitive rotation detection
          if (diff > 10) {
            triggerWarning("Looking away detected!", "head_switch");
          }

          // Gaze detection
          const eyeWidth = rightEye.x - leftEye.x;
          if (eyeWidth < 30) {
            // Only count if not already looking away to prevent double counting
            if (!isHeadRotatedRef.current) {
              // triggerWarning("Please focus on the screen!", "focus_lost"); 
            }
          }
        }
      } catch (err) {
        console.error("PROCTOR ERROR:", err);
      } finally {
        isTrackingRef.current = false;
        timeoutId = setTimeout(startFaceTracking, 2000);
      }
    };

    if (isTestStarted) {
      if (!window.faceapi) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = async () => {
          try {
            const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
            await Promise.all([
              window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
              window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            console.log("AI Proctor Engine Loaded");
            startFaceTracking();
          } catch (e) { console.warn("AI Proctor models failed to load - proceeding without face tracking", e); }
        };
        script.onerror = () => console.warn("AI Proctor script failed to load");
        document.body.appendChild(script);
      } else {
        startFaceTracking();
      }
    }
    return () => clearTimeout(timeoutId);
  }, [isTestStarted]);

  // 🔥 ENGINE: FRAME UPLOAD
  useEffect(() => {
    let intervalId;
    if (isTestStarted && cameraStream) {
      intervalId = setInterval(async () => {
        if (isTestSubmitted || isUploadingRef.current || !videoRef.current || !canvasRef.current) return;
        isUploadingRef.current = true;
        try {
          const video = videoRef.current;
          if (video.readyState < 2 || video.videoWidth === 0) return; // Wait for video data

          const canvas = canvasRef.current;
          canvas.width = 160; canvas.height = 120; // Smaller for speed
          canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, 160, 120);
          await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              student_id: Number(getDecryptedUserId() || 1),
              image: canvas.toDataURL('image/jpeg', 0.1),
              flagged: Boolean(lastViolationRef.current),
              violation_type: lastViolationRef.current?.type || null,
              violation_message: lastViolationRef.current?.message || null,
              violation_count: violationCountRef.current,
              terminated: terminatedRef.current
            })
          });
        } catch (e) { } finally { isUploadingRef.current = false; }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isTestStarted, cameraStream]);

  // 🔥 ENGINE: CAMERA STATUS MONITORING
  useEffect(() => {
    let intervalId;
    const checkCameraStatus = () => {
      if (!isTestStartedRef.current || isTestSubmittedRef.current || !cameraStream) return;

      const videoTrack = cameraStream.getVideoTracks()[0];
      const isTrackOff = !videoTrack || !videoTrack.enabled || videoTrack.readyState === 'ended';
      const isVideoPaused = videoRef.current && (videoRef.current.paused || videoRef.current.ended);

      if (isTrackOff || isVideoPaused) {
        triggerWarning("Camera is disconnected or turned off! Re-enable it immediately.", "camera_off");
      }
    };

    if (isTestStarted) {
      intervalId = setInterval(checkCameraStatus, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isTestStarted, isTestSubmitted, cameraStream]);

  // 🔥 ENGINE: POLLING FOR DOCTOR WARNINGS
  useEffect(() => {
    let intervalId;
    const pollDoctorWarnings = async () => {
      if (!isTestStarted || isTestSubmitted || terminatedRef.current) return;
      try {
        const res = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await res.json();
        const list = data.sessions ? data.sessions : Array.isArray(data) ? data : data.results || data.frames || data.data || [];
        const studentId = String(getDecryptedUserId() || 1);
        const myFrames = list.filter(r => String(r.student_id) === studentId);

        let doctorDetects = 0;
        let doctorUndetects = 0;
        let isTerminated = false;

        myFrames.forEach(f => {
          if (f.violation_type === 'doctor_detect') doctorDetects++;
          if (f.violation_type === 'doctor_undetect') doctorUndetects++;
          if (f.terminated) isTerminated = true;
        });

        const effectiveDetects = Math.max(0, doctorDetects - doctorUndetects);

        if (!window.lastDoctorDetectCountRef) window.lastDoctorDetectCountRef = { current: 0 };

        if (effectiveDetects > window.lastDoctorDetectCountRef.current) {
          const newDetects = effectiveDetects - window.lastDoctorDetectCountRef.current;
          window.lastDoctorDetectCountRef.current = effectiveDetects;

          for (let i = 0; i < newDetects; i++) {
            setTimeout(() => {
              triggerWarning("Doctor issued a warning! Please follow exam rules.", "doctor_detect", true);
            }, i * 500); // spread out visually
          }
        } else if (effectiveDetects < window.lastDoctorDetectCountRef.current) {
          // Doctor hit "UNDETECT"
          const reducedBy = window.lastDoctorDetectCountRef.current - effectiveDetects;
          window.lastDoctorDetectCountRef.current = effectiveDetects;

          // Reduce the internal tabSwitchCount
          setTabSwitchCount(prev => {
            const next = Math.max(0, prev - reducedBy);
            violationCountRef.current = next;
            return next;
          });
          toast.info("A warning was cleared by the Doctor.", { position: "bottom-center" });
        }

        if (isTerminated && !terminatedRef.current) {
          terminatedRef.current = true;
          toast.error("🚫 Warning: Doctor issued a critical notice. Please follow exam rules.");
        }
      } catch (err) { }
    };

    if (isTestStarted) {
      if (!window.lastDoctorDetectCountRef) window.lastDoctorDetectCountRef = { current: 0 };
      intervalId = setInterval(pollDoctorWarnings, 2000);
    }
    return () => clearInterval(intervalId);
  }, [isTestStarted, isTestSubmitted]);

  // ── DETECTION STATUS SYNC ──
  useEffect(() => {
    let isMounted = true;
    const checkDetection = async () => {
      try {
        const studentId = getDecryptedUserId();
        if (!studentId) return;

        const response = await fetch(`https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/?student_id=${studentId}&user_id=${studentId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json();

        if (isMounted) {
          const sessions = data.sessions || [];
          const mySession = sessions.find(s => (s.student_id || s.user_id) === studentId);
          if (mySession && mySession.is_detection_enabled !== undefined) {
            setIsDetectionEnabled(mySession.is_detection_enabled);
          }
        }
      } catch (err) {
        console.warn("Detection sync error:", err.message);
      }
    };

    if (isTestStarted) {
      const timer = setInterval(checkDetection, 4000);
      checkDetection();
      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }
  }, [isTestStarted]);

  useEffect(() => {
    if (isTestStarted && cameraStream && videoRef.current) videoRef.current.srcObject = cameraStream;
  }, [isTestStarted, cameraStream]);

  const startProctoring = async () => {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setCameraStream(cam);
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      setIsTestStarted(true);
      setTestStartTime(Date.now());
    } catch (err) { toast.error("❌ Camera and Fullscreen required!"); }
  };

  const [detectedType, setDetectedType] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!subtype) { navigate('/TestPage', { replace: true }); return; }
      const normalizedSubtype = String(subtype).trim();
      const normalizedCategory = filterCategory || 'Technical';

      const isNgrokCategory = ['quantitative', 'logical', 'Psychomatric', 'verbal'].includes(normalizedCategory);

      try {
        const userId = getDecryptedUserId();
        if (userId && localStorage.getItem(`mcq_completed_${userId}_${normalizedSubtype}_${normalizedCategory}`)) {
          setIsTestCompleted(true); return;
        }

        let data;
        if (isNgrokCategory) {
          // Fetch all for category from ngrok
          const allQuestions = await apiClient(`https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/sample/?language=${normalizedCategory}`, 'GET');
          // If the selected subtype is the category itself, don't filter by subtype!
          if (['quantitative', 'logical', 'Psychomatric', 'verbal'].includes(normalizedSubtype)) {
            data = Array.isArray(allQuestions) ? allQuestions : [];
          } else {
            data = Array.isArray(allQuestions) ? allQuestions.filter(q => String(q.subtype).trim() === normalizedSubtype) : [];
          }
        } else {
          const params = new URLSearchParams({ subtype: normalizedSubtype });
          data = await apiClient(`https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/filter-by-subtype/?${params.toString()}`, 'GET');
        }

        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          setTestStartTime(Date.now());
          if (data[0].list) setDetectedType(data[0].list);
          else if (data[0].type) setDetectedType(data[0].type);
        }
        else setError('No questions found.');
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setError('Connection error.');
      } finally { setLoading(false); }
    };
    fetchQuestions();
  }, [subtype, filterCategory, navigate]);

  const submitTest = async (manualAnswers = null) => {
    setCompletionLoading(true);
    const normalizedSubtype = String(subtype || '').trim();
    const normalizedCategory = filterCategory || 'Technical';

    const activeAnswers = manualAnswers || answersRef.current || {};
    const activeTimings = timingsRef.current || {};

    // Sanitize answers to avoid backend 500 errors on empty selections
    const sanitizedAnswers = Object.fromEntries(
      Object.entries(activeAnswers).filter(([_, value]) => value !== "" && value !== null)
    );

    // Build timings payload: for any question in questions, provide spent time or 0 if not tracked
    const timingsPayload = {};
    questions.forEach(q => {
      if (q && q.id) {
        timingsPayload[q.id] = Number(activeTimings[q.id] || 0);
      }
    });

    const userId = Number(getDecryptedUserId());
    if (!userId) {
      toast.error("User ID missing. Please login again.");
      setCompletionLoading(false);
      return;
    }

    let finalLanguage = 'General';
    const catLower = String(normalizedCategory || '').toLowerCase();
    if (catLower.includes('quant')) finalLanguage = 'Quantitative';
    else if (catLower.includes('logic')) finalLanguage = 'Logical';
    else if (catLower.includes('psycho')) finalLanguage = 'Psychometric';
    else if (catLower.includes('verb')) finalLanguage = 'Verbal';
    else if (normalizedSubtype) {
      const subLower = String(normalizedSubtype).toLowerCase();
      if (subLower.includes('quant')) finalLanguage = 'Quantitative';
      else if (subLower.includes('logic')) finalLanguage = 'Logical';
      else if (subLower.includes('psycho')) finalLanguage = 'Psychometric';
      else if (subLower.includes('verb')) finalLanguage = 'Verbal';
    }

    try {
      const payload = {
        user_id: userId,
        type: detectedType || normalizedCategory || "Technical",
        subtype: normalizedSubtype || "General",
        language: finalLanguage,
        hints_used: 0,
        answers: sanitizedAnswers,
        timings: timingsPayload
      };

      await apiClient('https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/evaluate/', 'POST', payload);

      toast.success("Test Submitted!");
      const timerKey = `domain_expiry_${userId}_${normalizedCategory}`;
      localStorage.removeItem(timerKey);

      localStorage.setItem(`mcq_completed_${getDecryptedUserId()}_${normalizedSubtype}_${normalizedCategory}`, 'true');
      setTimeout(() => navigate('/TestPage', { replace: true, state: { autoView: 'tests', autoLang: normalizedCategory } }), 1000);
    } catch (error) {
      console.error("SUBMISSION ERROR:", error);
      toast.error(`Submission failed: ${error.message || 'Unknown Error'}`);
    } finally {
      setCompletionLoading(false);
    }
  };

  if (isTestCompleted) return <Container className="mt-5 text-center"><Alert variant="danger"><h4>🚫 Test already attended</h4></Alert></Container>;
  if (completionLoading || loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <div className="text-center mt-5"><h3>⚠️ {error}</h3></div>;

  if (!isTestStarted) return (
    <div className="proctor-start-screen">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="proctor-start-card">
        <div className="proctor-start-icon">
          <FaShieldAlt />
        </div>
        <h2 className="proctor-start-title">Proctoring Enabled</h2>
        <p className="proctor-start-copy">
          Stay focused. Looking away or leaving the camera will result in disqualification.
        </p>
        <button className="proctor-start-btn" onClick={startProctoring}>
          Start Assessment
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
      <ToastContainer position="top-center" autoClose={3000} />

      {showViolationOverlay && (
        <div className="security-alert-overlay">
          <div className="alert-flash-red"></div>
          <div className="alert-content">
            <FaExclamationTriangle size={60} color="#ff4d4d" className="mb-4" />
            <h2 className="alert-title">SECURITY WARNING</h2>
            <p className="alert-msg">{violationMessage}</p>
            <div className="alert-violation-tag">ACTION REQUIRED</div>
          </div>
        </div>
      )}

      <div className="proctoring-dashboard">
        <div className={`camera-proctor-box ${isCameraMinimized ? 'minimized' : ''}`}>
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-status" onClick={() => {
            if (!isCameraMinimized) {
              triggerWarning("Hiding the camera feed is strictly prohibited!", "ui_minimize");
            }
            setIsCameraMinimized(!isCameraMinimized);
          }}>
            <div className="pulse"></div>
            {isCameraMinimized ? 'VIEW FEED' : 'LIVE PROCTOR (Minimize)'}
          </div>
        </div>
      </div>
      <MCQQuiz
        questions={questions}
        updateQuestionStatus={() => { }}
        submitTest={submitTest}
        initialTimeLeft={actualTimeLeft}
        initialLockTime={lockTime || 75}
        onAnswersChange={handleAnswersChange}
      />
    </div>
  );
};

export default McqTestPage;