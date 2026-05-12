import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import { FaLock, FaCheckCircle, FaPlay, FaPaperPlane, FaTerminal, FaQuestionCircle, FaShieldAlt, FaClock, FaExclamationTriangle, FaLightbulb, FaRobot, FaCode, FaBrain } from 'react-icons/fa';
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
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [output, setOutput] = useState('');
  const [stdin, setStdin] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // Question States
  const { questionId, question } = location.state || {};
  const [questionData, setQuestionData] = useState(question || null);

  // Security States
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'hint' | 'algorithm' | 'example'

  const handleConfirmAction = () => {
    if (confirmAction === 'hint') setShowHint(true);
    if (confirmAction === 'algorithm') setShowAlgorithm(true);
    if (confirmAction === 'example') setShowExample(true);
    setConfirmAction(null);
  };

  const handleToggleHint = () => {
    if (!showHint) setConfirmAction('hint');
    else setShowHint(false);
  };

  const handleToggleAlgorithm = () => {
    if (!showAlgorithm) setConfirmAction('algorithm');
    else setShowAlgorithm(false);
  };

  const handleToggleExample = () => {
    if (!showExample) setConfirmAction('example');
    else setShowExample(false);
  };

  // PERMANENT FIX: Suppress cross-origin "Script error." (from Monaco/Face-API) to stop React overlay crashes
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.message === 'Script error.' || (event.error && event.error.message === 'Script error.')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isTestStarted && !isTestSubmitted && isDetectionEnabled) {
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
  }, [cameraStream]);

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

    const timer = setInterval(checkDetection, 4000);
    checkDetection();
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isTestStarted]);

  const isTrackingRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const isUploadingRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationRef = useRef(null);
  const terminatedRef = useRef(false);
  const isHeadRotatedRef = useRef(false);
  const isFocusLostRef = useRef(false);

  const [showViolationOverlay, setShowViolationOverlay] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");

  const uploadViolationFrame = async () => {
    try {
      let image = null;
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const canvas = canvasRef.current;
        canvas.width = 240;
        canvas.height = 180;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 240, 180);
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
          terminated: false
        })
      });
    } catch (err) { }
  };


  useEffect(() => {
    const fetchFullQuestionData = async () => {
      // Use what we have from state first
      let currentData = question || { title: "Coding Challenge", description: "Loading challenge details..." };
      setQuestionData(currentData);

      if (!questionId) return;

      try {
        // Fetch hints, algorithm, and example_programs strictly from ngrok test-cases
        const langParam = selectedLanguage === 'Python' ? 'python' : selectedLanguage;
        fetch(`https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/test-cases/?language=${langParam}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
          .then(res => res.json())
          .then(tcData => {
            const allItems = Array.isArray(tcData) ? tcData : (tcData.results || tcData.questions || tcData.data || []);
            // Filter by questionId
            const found = allItems.find(q => String(q.id || q.question_id) === String(questionId) || String(q.question) === String(questionId));

            if (found) {
              setQuestionData(prev => ({
                ...prev,
                hints: found.hints || prev?.hints,
                algorithm: found.algorithm || prev?.algorithm,
                example_code: found.example_programs || prev?.example_code
              }));
            }
          }).catch((err) => { console.error("Test cases fetch failed:", err); });

        // Sync Primary API info
        const primaryData = await apiClient(`compiler/question/?question_id=${questionId}`, 'GET');
        const base = Array.isArray(primaryData) ? primaryData[0] : primaryData;
        if (base) {
          setQuestionData(prev => ({
            ...prev,
            ...base,
            title: base.title || prev?.title,
            description: base.description || base.question || prev?.description
          }));
        }
      } catch (err) {
        console.error("Primary fetch failed.");
      }
    };

    fetchFullQuestionData();
  }, [questionId, selectedLanguage]);

  useEffect(() => {
    if (startTime && !isTestSubmitted) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isTestSubmitted]);

  // 🔥 ENGINE: POLLING FOR DETECTION ENABLED STATUS
  useEffect(() => {
    let intervalId;
    const checkDetectionStatus = async () => {
      if (!isTestStarted || isTestSubmitted) return;
      try {
        const studentId = getDecryptedUserId() || 1;
        const res = await fetch(`https://unlanded-isela-unmunificently.ngrok-free.dev/api/toggle-detection/?user_id=${studentId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        if (data.is_detection_enabled !== undefined) {
          setIsDetectionEnabled(!!data.is_detection_enabled);
        }
      } catch (err) { }
    };

    if (isTestStarted) {
      checkDetectionStatus();
      intervalId = setInterval(checkDetectionStatus, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isTestStarted, isTestSubmitted]);

  const triggerWarning = (msg, type = "proctoring_violation", bypassCooldown = false) => {
    const now = Date.now();
    if (!bypassCooldown && now - lastWarningTimeRef.current < 4000) return;
    lastWarningTimeRef.current = now;

    console.warn("AI PROCTOR ALERT:", msg);
    setViolationMessage(msg);
    setShowViolationOverlay(true);
    setTimeout(() => setShowViolationOverlay(false), 2500);

    setTabSwitchCount(prev => {
      const next = prev + 1;
      violationCountRef.current = next;
      lastViolationRef.current = { type, message: msg, count: next, at: new Date().toISOString() };
      if (next >= 3) {
        terminatedRef.current = true;
        uploadViolationFrame();
        toast.error("🚫 DISQUALIFIED! Too many violations. Test submitted.");
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
      if (!isTestStarted || !isDetectionEnabled || !videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0 || !window.faceapi || !window.faceapi.detectSingleFace || isTrackingRef.current || document.hidden || isTestSubmitted) {
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
          if (!isFocusLostRef.current) {
            isFocusLostRef.current = true;
            triggerWarning("Face missing! Stay in front of camera.", "face_missing");
          }
        } else {
          isFocusLostRef.current = false;

          const landmarks = detections.landmarks;
          const nose = landmarks.getNose()[3];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[3];

          const eyeCenterX = (leftEye.x + rightEye.x) / 2;
          const diff = Math.abs(eyeCenterX - nose.x);

          if (diff > 10) {
            if (!isHeadRotatedRef.current) {
              isHeadRotatedRef.current = true;
              triggerWarning("Head rotation detected!", "head_switch");
            }
          } else {
            isHeadRotatedRef.current = false;
          }

          if (rightEye.x - leftEye.x < 30) {
            if (!isHeadRotatedRef.current) {
              // triggerWarning("Please focus on the screen!", "focus_lost");
            }
          }
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
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = async () => {
          try {
            const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
            await Promise.all([
              window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
              window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            startFaceTracking();
          } catch (err) { console.warn("AI Proctor models failed to load - proceeding without face tracking", err); }
        };
        script.onerror = () => console.warn("AI Proctor script failed to load");
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
        timeoutId = setTimeout(uploadFrame, 3000); return;
      }
      isUploadingRef.current = true;
      try {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0) {
          isUploadingRef.current = false;
          timeoutId = setTimeout(uploadFrame, 3000);
          return;
        }
        const canvas = canvasRef.current;
        canvas.width = 240; canvas.height = 180;
        canvas.getContext('2d').drawImage(video, 0, 0, 240, 180);
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
            terminated: false
          })
        });
      } catch (err) { } finally { isUploadingRef.current = false; timeoutId = setTimeout(uploadFrame, 3000); }
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
      const res = await apiClient("compiler/compile/", "POST", {
        source_code: sourceCode,
        code: sourceCode,
        language: selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1).toLowerCase(),
        stdin: stdin
      });
      setOutput(res.output || res.error || "No output captured.");
    } catch (err) { setOutput("Execution error."); } finally { setIsCompiling(false); }
  };

  const submitSolution = async () => {
    const currentUserId = getDecryptedUserId();

    if (!currentUserId) {
      toast.error("Session expired. Please login again.");
      navigate("/LoginPage");
      return;
    }

    if (!questionId) {
      toast.error("Challenge metadata missing. Please restart the challenge.");
      return;
    }

    if (!sourceCode.trim()) {
      toast.warning("Please enter some code before submitting.");
      return;
    }

    setIsCompiling(true);
    console.log("Submitting Solution for ID:", questionId, "User:", currentUserId);

    try {
      const response = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/run-test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          user_id: Number(currentUserId),
          question_id: questionId,
          language: selectedLanguage === 'Python' ? 'python' : selectedLanguage,
          source_code: sourceCode,
          hint_used: showHint,
          algorithm_used: showAlgorithm,
          example_program_used: showExample
        })
      });

      if (response.ok) {
        toast.success("Solution Submitted Successfully!");
        setIsTestSubmitted(true);
        setTimeout(() => navigate('/UserDashboard'), 1500);
      }
    } catch (error) {
      console.error("IDE Submission Error:", error);
      toast.error(`Submission Failed: ${error.message || "Server Error"}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const monacoLang = selectedLanguage.toLowerCase() === 'cpp' ? 'cpp' : selectedLanguage.toLowerCase();

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
      {confirmAction && (
        <div className="ide-modal-overlay">
          <div className="ide-modal">
            <FaExclamationTriangle className="ide-modal-icon" />
            <h3>Wait a moment!</h3>
            <p>Viewing this section will cost you <strong>2 marks</strong>. Are you sure you want to proceed?</p>
            <div className="ide-modal-actions">
              <button className="ide-btn-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="ide-btn-proceed" onClick={handleConfirmAction}>Proceed (-2 Marks)</button>
            </div>
          </div>
        </div>
      )}
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
          <div className="ide-desc">{questionData?.description || questionData?.question || 'Loading...'}</div>

          <div className="ide-extra-info">
            <div className="ide-info-section">
              <h6 onClick={handleToggleHint} style={{ cursor: 'pointer', color: 'var(--ide-text-main)' }}>
                <FaLightbulb className="text-warning" /> HINT {showHint ? '▲' : '▼'}
              </h6>
              {showHint && (
                <p className="ide-info-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {questionData?.hints || "1. Check for edge cases like empty strings.\n2. Think about the most efficient loop structure."}
                </p>
              )}
            </div>

            <div className="ide-info-section">
              <h6 onClick={handleToggleAlgorithm} style={{ cursor: 'pointer', color: 'var(--ide-text-main)' }}>
                <FaBrain className="text-primary" /> ALGORITHM {showAlgorithm ? '▲' : '▼'}
              </h6>
              {showAlgorithm && (
                <p className="ide-info-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {questionData?.algorithm || "1. Initialize variables.\n2. Process input data using a loop or recursion.\n3. Apply core logic.\n4. Return result."}
                </p>
              )}
            </div>

            <div className="ide-info-section">
              <h6 onClick={handleToggleExample} style={{ cursor: 'pointer', color: 'var(--ide-text-main)' }}>
                <FaCode className="text-success" /> EXAMPLE PROGRAM {showExample ? '▲' : '▼'}
              </h6>
              {showExample && (
                <pre className="ide-info-text" style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  marginTop: '8px'
                }}>
                  <code>{questionData?.example_code || "// Solution template\npublic class Solution {\n    public static void main(String[] args) {\n        // Code goes here\n    }\n}"}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </aside>
      <main className="ide-main">
        <header className="ide-toolbar">
          <div className="ide-toolbar-left">
            <div className="ide-status-pill"><div className="pulse"></div> SECURE LAB</div>
            <select
              className="ide-lang-selector"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="C">C</option>
              <option value="Cpp">C++</option>
            </select>
          </div>
          <div className="text-muted small"><FaClock /> {formatTime(elapsedTime)}</div>
        </header>
        <div className="ide-editor-container">
          <MonacoEditor height="100%" theme="light" language={monacoLang} value={sourceCode} onChange={(val) => setSourceCode(val)} options={{ fontSize: 14, minimap: { enabled: false } }} />
        </div>
        <div className="ide-controls">
          <button className="ide-btn ide-btn-run" onClick={handleCompile} disabled={isCompiling}>{isCompiling ? "Compiling..." : "Run Code"}</button>
          <button className="ide-btn ide-btn-submit" onClick={submitSolution} disabled={isCompiling}>Submit Solution</button>
        </div>
        <div className="ide-console">
          <div className="ide-console-header">
            <span className="console-tab active"><FaTerminal /> Output</span>
            <span className="console-tab"><FaRobot /> Input</span>
          </div>
          <div className="ide-console-body">
            <div className="ide-input-panel">
              <label className="input-label">Standard Input (stdin)</label>
              <textarea
                className="ide-stdin-field"
                placeholder="Enter input data here..."
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />
            </div>
            <div className="ide-console-output">
              <pre>{output || 'Execution results...'}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionPage;
