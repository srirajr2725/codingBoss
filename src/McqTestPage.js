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
  const { subtype, filterCategory } = state || {};
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isTrackingRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const isUploadingRef = useRef(false);

  const [showViolationOverlay, setShowViolationOverlay] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");

  const triggerWarning = (msg) => {
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 4000) return;
    lastWarningTimeRef.current = now;

    console.warn("AI PROCTOR ALERT:", msg);
    setViolationMessage(msg);
    setShowViolationOverlay(true);
    setTimeout(() => setShowViolationOverlay(false), 2500);
    
    setTabSwitchCount(prev => {
      const next = prev + 1;
      if (next >= 3) { // 2 Warnings, 3rd is Terminate
        // Temporarily commented out termination
        // toast.error("🚫 DISQUALIFIED! Too many violations.");
        // setTimeout(() => submitTest({}), 1000);
        toast.error(`⚠️ WARNING (${next}): ${msg} (Termination Disabled)`);
      } else {
        toast.error(`⚠️ WARNING (${next}/2): ${msg}`);
      }
      return next;
    });
  };

  // 🔥 ENGINE: FACE TRACKING
  useEffect(() => {
    let timeoutId;

    const startFaceTracking = async () => {
      if (!isTestStarted || !videoRef.current || !window.faceapi || isTrackingRef.current || document.hidden) {
        timeoutId = setTimeout(startFaceTracking, 1000);
        return;
      }

      isTrackingRef.current = true;
      try {
        const detections = await window.faceapi.detectSingleFace(
          videoRef.current,
          new window.faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.3 })
        ).withFaceLandmarks();

        if (!detections) {
          console.log("PROCTOR: No face found");
          triggerWarning("Face not detected!");
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
            triggerWarning("Looking away detected!");
          }

          // Gaze detection
          const eyeWidth = rightEye.x - leftEye.x;
          if (eyeWidth < 30) {
            triggerWarning("Please focus on the screen!");
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
          } catch (e) { console.error("Model load error", e); }
        };
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
        if (isUploadingRef.current || !videoRef.current || !canvasRef.current) return;
        isUploadingRef.current = true;
        try {
          const canvas = canvasRef.current;
          canvas.width = 240; canvas.height = 180;
          canvas.getContext('2d', { alpha: false }).drawImage(videoRef.current, 0, 0, 240, 180);
          await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ student_id: Number(getDecryptedUserId() || 1), image: canvas.toDataURL('image/jpeg', 0.1) })
          });
        } catch (e) {} finally { isUploadingRef.current = false; }
      }, 15000);
    }
    return () => clearInterval(intervalId);
  }, [isTestStarted, cameraStream]);

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

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!subtype) { navigate('/TestPage', { replace: true }); return; }
      try {
        const userId = getDecryptedUserId();
        if (userId && localStorage.getItem(`mcq_completed_${userId}_${subtype}_${filterCategory || 'Technical'}`)) {
          setIsTestCompleted(true); return;
        }
        const data = await apiClient(`compiler/filter-by-subtype/?subtype=${subtype}`, 'GET');
        if (Array.isArray(data) && data.length > 0) { setQuestions(data); setTestStartTime(Date.now()); }
        else setError('No questions found.');
      } catch (err) { setError('Connection error.'); } finally { setLoading(false); }
    };
    fetchQuestions();
  }, [subtype, filterCategory, navigate]);

  const submitTest = async (answers) => {
    setCompletionLoading(true);
    try {
      const response = await apiClient('compiler/evaluate/', 'POST', {
        user_id: Number(getDecryptedUserId()),
        type: filterCategory || 'Technical',
        subtype: subtype,
        answers: answers,
      });
      if (response) {
        toast.success("Test Submitted!");
        localStorage.setItem(`mcq_completed_${getDecryptedUserId()}_${subtype}_${filterCategory || 'Technical'}`, 'true');
        setTimeout(() => navigate('/UserDashboard', { replace: true }), 1000);
      }
    } catch (error) { toast.error("Submission failed."); } finally { setCompletionLoading(false); }
  };

  if (isTestCompleted) return <Container className="mt-5 text-center"><Alert variant="danger"><h4>🚫 Test already attended</h4></Alert></Container>;
  if (completionLoading || loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <div className="text-center mt-5"><h3>⚠️ {error}</h3></div>;

  if (!isTestStarted) return (
    <div className="ide-lock-screen">
      <div className="ide-lock-card text-center">
        <FaShieldAlt style={{ fontSize: '3.5rem', color: '#FFA003', marginBottom: '20px' }} />
        <h2 style={{ fontWeight: 800 }}>Proctoring Enabled</h2>
        <p className="text-muted">Stay focused. Looking away or leaving the camera will result in disqualification.</p>
        <button className="btn btn-dark w-100 py-3 mt-4" style={{ borderRadius: '12px', fontWeight: 800 }} onClick={startProctoring}>Start Assessment</button>
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
        <div className="camera-proctor-box">
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-status"><div className="pulse"></div> LIVE PROCTOR</div>
        </div>
      </div>
      <MCQQuiz questions={questions} updateQuestionStatus={() => {}} submitTest={submitTest} />
    </div>
  );
};

export default McqTestPage;