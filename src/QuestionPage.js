import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import { FaLock, FaCheckCircle, FaPlay, FaPaperPlane, FaTerminal, FaQuestionCircle, FaShieldAlt, FaClock, FaExclamationTriangle, FaLightbulb, FaRobot } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';
import 'react-toastify/dist/ReactToastify.css';
import './UltraIDE.css';
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

const QuestionPage = ({ isLoggedIn, userRole, setIsLoggedIn, handleLogout, username }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Editor States
  const [sourceCode, setSourceCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // Question States
  const { questionId } = location.state || {};
  const [questionData, setQuestionData] = useState(null);

  // Security States
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  
  const isTrackingRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const isUploadingRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationRef = useRef(null);
  const terminatedRef = useRef(false);

  const [showViolationOverlay, setShowViolationOverlay] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");

  const uploadViolationFrame = async () => {
    try {
      let image = null;
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = 240;
        canvas.height = 180;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 240, 180);
        image = canvas.toDataURL('image/jpeg', 0.1);
      }

      await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          student_id: Number(getDecryptedUserId() || 1),
          image,
          flagged: true,
          violation_type: lastViolationRef.current?.type || null,
          violation_message: lastViolationRef.current?.message || null,
          violation_count: violationCountRef.current,
          terminated: terminatedRef.current || violationCountRef.current >= 4
        })
      });
    } catch (err) {}
  };

  useEffect(() => {
    if (questionId) {
      apiClient(`compiler/question/?question_id=${questionId}`, 'GET')
        .then(data => setQuestionData(Array.isArray(data) ? data[0] : data))
        .catch(() => toast.error("Error loading question"));
    }
  }, [questionId]);

  useEffect(() => {
    if (startTime && !isTestSubmitted) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isTestSubmitted]);

  const triggerWarning = (msg, type = "proctoring_violation") => {
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 4000) return;
    lastWarningTimeRef.current = now;

    console.warn("AI PROCTOR ALERT:", msg);
    setViolationMessage(msg);
    setShowViolationOverlay(true);
    setTimeout(() => setShowViolationOverlay(false), 2500);
    
    setTabSwitchCount(prev => {
      const next = prev + 1;
      violationCountRef.current = next;
      lastViolationRef.current = { type, message: msg, count: next, at: new Date().toISOString() };
      if (next >= 4) {
        terminatedRef.current = true;
        uploadViolationFrame();
        toast.error("🚫 DISQUALIFIED! Too many violations.");
        setIsTestSubmitted(true);
        setTimeout(() => navigate('/UserDashboard'), 1000);
      } else {
        uploadViolationFrame();
        toast.error(`⚠️ WARNING (${next}/3): ${msg}`);
      }
      return next;
    });
  };

  useEffect(() => {
    let timeoutId;

    const startFaceTracking = async () => {
      if (!isTestStarted || !videoRef.current || !window.faceapi || isTrackingRef.current || document.hidden || isTestSubmitted) {
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
          // triggerWarning("Face missing! Stay in front of camera.", "face_missing");
        } else {
          const landmarks = detections.landmarks;
          const nose = landmarks.getNose()[3];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[3];
          
          const eyeCenterX = (leftEye.x + rightEye.x) / 2;
          const diff = Math.abs(eyeCenterX - nose.x);
          
          // if (diff > 10) triggerWarning("Head rotation detected!", "head_switch");
          // if (rightEye.x - leftEye.x < 30) triggerWarning("Please focus on the screen!", "focus_lost");
        }
      } catch (err) {
        console.error("AI PROCTOR ERROR:", err);
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
            startFaceTracking();
          } catch (err) { console.error("Init failed", err); }
        };
        document.body.appendChild(script);
      } else {
        startFaceTracking();
      }
    }
    return () => clearTimeout(timeoutId);
  }, [isTestStarted, isTestSubmitted]);

  useEffect(() => {
    let timeoutId;
    const uploadFrame = async () => {
      if (!isTestStarted || !cameraStream || !videoRef.current || isUploadingRef.current || isTestSubmitted) {
        timeoutId = setTimeout(uploadFrame, 15000); return;
      }
      isUploadingRef.current = true;
      try {
        const canvas = canvasRef.current;
        canvas.width = 240; canvas.height = 180;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 240, 180);
        await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({
            student_id: Number(getDecryptedUserId() || 1),
            image: canvas.toDataURL('image/jpeg', 0.1),
            flagged: Boolean(lastViolationRef.current),
            violation_type: lastViolationRef.current?.type || null,
            violation_message: lastViolationRef.current?.message || null,
            violation_count: violationCountRef.current,
            terminated: terminatedRef.current || violationCountRef.current >= 4
          })
        });
      } catch (err) {} finally { isUploadingRef.current = false; timeoutId = setTimeout(uploadFrame, 15000); }
    };
    if (isTestStarted && cameraStream) uploadFrame();
    return () => clearTimeout(timeoutId);
  }, [isTestStarted, cameraStream, isTestSubmitted]);

  // 🔥 ENGINE: POLLING FOR DOCTOR WARNINGS
  useEffect(() => {
    let intervalId;
    const pollDoctorWarnings = async () => {
      if (!isTestStarted || isTestSubmitted || terminatedRef.current) return;
      try {
        const res = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/', {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true', 'Accept': 'application/json' }
        });
        const data = await res.json();
        const list = data.sessions ? data.sessions : Array.isArray(data) ? data : data.results || data.frames || data.data || [];
        const studentId = String(getDecryptedUserId() || 1);
        const myFrames = list.filter(r => String(r.student_id) === studentId);
        
        let doctorDetects = 0;
        let isTerminated = false;
        
        myFrames.forEach(f => {
          if (f.violation_type === 'doctor_detect') doctorDetects++;
          if (f.terminated) isTerminated = true;
        });

        if (!window.lastDoctorDetectCountRef) window.lastDoctorDetectCountRef = { current: 0 };
        
        if (doctorDetects > window.lastDoctorDetectCountRef.current) {
           const newDetects = doctorDetects - window.lastDoctorDetectCountRef.current;
           window.lastDoctorDetectCountRef.current = doctorDetects;
           
           for(let i=0; i<newDetects; i++) {
             triggerWarning("Doctor issued a warning! Please follow exam rules.", "doctor_detect");
           }
        }
        
        if (isTerminated && !terminatedRef.current) {
           terminatedRef.current = true;
           toast.error("🚫 DISQUALIFIED! Doctor terminated the exam.");
           setIsTestSubmitted(true);
           setTimeout(() => navigate('/UserDashboard'), 1000);
        }
      } catch (err) {}
    };

    if (isTestStarted) {
       if (!window.lastDoctorDetectCountRef) window.lastDoctorDetectCountRef = { current: 0 };
       intervalId = setInterval(pollDoctorWarnings, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isTestStarted, isTestSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setCameraStream(stream);
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsTestStarted(true);
        setStartTime(Date.now());
      }
    } catch (err) { toast.error("❌ Camera and Fullscreen required!"); }
  };

  const handleCompile = async () => {
    if (!sourceCode.trim()) return toast.warning("Enter code first!");
    setIsCompiling(true);
    try {
      const res = await apiClient("compiler/compile/", "POST", { source_code: sourceCode, language: selectedLanguage, stdin: "" });
      setOutput(res.output || res.error || "No output captured.");
    } catch (err) { setOutput("Execution error."); } finally { setIsCompiling(false); }
  };

  if (!isTestStarted) return (
    <div className="ide-lock-screen">
      <div className="ide-lock-card">
        <FaShieldAlt style={{ fontSize: '3rem', color: '#FFA003', marginBottom: '20px' }} />
        <h2 className="mb-4">Secure Coding Lab</h2>
        <p className="mb-5">Stay focused. Violations will result in immediate disqualification.</p>
        <button className="ide-btn ide-btn-submit w-100 py-3" onClick={startTest}>Start Session</button>
      </div>
    </div>
  );

  return (
    <div className="ide-root coding-scope">
      <ToastContainer theme="dark" position="top-center" />
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
      <div className="camera-proctor-box">
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="camera-status"><div className="pulse"></div> LIVE PROCTOR</div>
      </div>
      <aside className="ide-sidebar">
        <div className="ide-sidebar-content">
          <div className={`ide-difficulty ${questionData?.difficulty?.toLowerCase() || 'medium'}`}>{questionData?.difficulty || 'Medium'}</div>
          <h4>{questionData?.title || 'Challenge'}</h4>
          <div className="ide-desc">{questionData?.description || 'Loading...'}</div>
        </div>
      </aside>
      <main className="ide-main">
        <header className="ide-toolbar">
          <div className="ide-status-pill"><div className="pulse"></div> SECURE LAB</div>
          <div className="text-muted small"><FaClock /> {formatTime(elapsedTime)}</div>
        </header>
        <div className="ide-editor-container">
          <MonacoEditor height="100%" theme="vs-dark" language={selectedLanguage} value={sourceCode} onChange={(val) => setSourceCode(val)} options={{ fontSize: 14, minimap: { enabled: false } }} />
        </div>
        <div className="ide-controls">
          <button className="ide-btn ide-btn-run" onClick={handleCompile} disabled={isCompiling}>{isCompiling ? "Compiling..." : "Run Code"}</button>
          <button className="ide-btn ide-btn-submit" onClick={() => { setIsTestSubmitted(true); toast.success("Solution Submitted!"); setTimeout(() => navigate('/UserDashboard'), 1000); }}>Submit Solution</button>
        </div>
        <div className="ide-console">
          <div className="ide-console-output"><pre>{output || 'Execution results...'}</pre></div>
        </div>
      </main>
    </div>
  );
};

export default QuestionPage;
