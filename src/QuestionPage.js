import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import { FaLock, FaCheckCircle, FaPlay, FaPaperPlane, FaTerminal, FaQuestionCircle, FaShieldAlt, FaClock, FaExclamationTriangle, FaLightbulb, FaRobot } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';
import 'react-toastify/dist/ReactToastify.css';
import './UltraIDE.css';

const QuestionPage = ({ isLoggedIn, userRole, setIsLoggedIn, handleLogout, username }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Editor States
  const [sourceCode, setSourceCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  
  // Console States
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('output');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question States
  const { questionId } = location.state || {};
  const [questionData, setQuestionData] = useState(null);

  // UI & Security States
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const storedEncryptedUserID = localStorage.getItem('userID');
    if (storedEncryptedUserID) {
      const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
      setUserId(bytes.toString(CryptoJS.enc.Utf8));
    }
    
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

  // Dynamic AI Hint Generator based on question title & description
  const generateProgrammingHint = (title, desc) => {
    const text = ((title || "") + " " + (desc || "")).toLowerCase();
    
    if (text.includes("array") || text.includes("list")) return "For array problems, two-pointer techniques or hash maps often yield optimal O(N) solutions. Watch out for out-of-bounds errors!";
    if (text.includes("string")) return "String manipulation might require checking for palindromes, substrings, or character frequencies. Consider using an array of size 26 or a HashMap.";
    if (text.includes("sort")) return "If the data isn't sorted, sorting it first takes O(N log N) but might make finding the solution trivial (e.g., binary search or two pointers).";
    if (text.includes("tree") || text.includes("graph") || text.includes("node")) return "This problem structure suggests DFS or BFS. Decide whether you need to explore path-by-path (DFS) or level-by-level (BFS).";
    if (text.includes("dynamic programming") || text.includes("maximum") || text.includes("minimum") || text.includes("longest") || text.includes("shortest")) return "Optimization problems often require Dynamic Programming. Try to break it down: what is the sub-problem, and how can you memoize the overlapping subproblems?";
    if (text.includes("math") || text.includes("prime") || text.includes("modulo")) return "Mathematical problems often have edge cases. Consider using modular arithmetic to prevent overflow, or think about base cases like 0 and 1.";
    
    return "Before writing the main loop, carefully consider the boundary conditions. What happens if the input is empty or the target value is zero? Handling these edge cases first will prevent runtime errors.";
  };

  const handleTabSwitch = useCallback(() => {
    if (!isTestStarted || isTestSubmitted) return;

    setTabSwitchCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        toast.error("🚫 Maximum tab switches reached. Test terminated!", { 
          position: "top-center",
          autoClose: 3000
        });
        setIsTestSubmitted(true);
        setTimeout(() => {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          navigate('/UserDashboard', { replace: true });
        }, 1500);
      } else {
        toast.warning(`⚠️ Tab switch detected (${newCount}/2 warnings)`, { position: "top-center" });
      }
      return newCount;
    });
  }, [isTestStarted, isTestSubmitted, navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTestStarted && !isTestSubmitted) {
        handleTabSwitch();
      }
    };

    const handleBlur = () => {
      if (isTestStarted && !isTestSubmitted) {
        handleTabSwitch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleTabSwitch, isTestStarted, isTestSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 🔥 FIX: Ensure video stream is attached after the video element is rendered
  useEffect(() => {
    if (isTestStarted && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isTestStarted, cameraStream]);

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);

      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsTestStarted(true);
        setStartTime(Date.now());
        if (navigator.keyboard?.lock) navigator.keyboard.lock();
      }
    } catch (err) {
      toast.error("❌ Camera access and Fullscreen are required to begin the assessment.");
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [cameraStream]);

  const handleCompile = async () => {
    if (!sourceCode.trim()) return toast.warning("Enter code first!");
    setIsCompiling(true);
    setActiveTab('output');
    try {
      const res = await apiClient("compiler/compile/", "POST", {
        source_code: sourceCode,
        language: selectedLanguage,
        stdin: ""
      });
      setOutput(res.output || res.error || "No output captured.");
    } catch (err) {
      setOutput("Execution error. Check your syntax.");
    } finally {
      setIsCompiling(false);
    }
  };

  if (!isTestStarted) {
    return (
      <div className="ide-lock-screen">
        <div className="ide-lock-card">
          <div className="ide-lock-icon"><FaShieldAlt /></div>
          <h2 className="mb-4">Secure Coding Environment</h2>
          <p className="mb-5">
            You are about to enter a proctored assessment. Fullscreen mode will be enabled, and tab switching is monitored.
          </p>
          <button className="ide-btn ide-btn-submit w-100 py-3" onClick={startTest}>
            Initialize Lab Environment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ide-root coding-scope">
      <ToastContainer theme="dark" />
      
      {/* CAMERA PROCTORING */}
      <div className="camera-proctor-box">
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
        <div className="camera-status">
          <div className="pulse"></div> PROCTORING ACTIVE
        </div>
      </div>

      <aside className="ide-sidebar">
        <div className="ide-sidebar-content">
          <div className={`ide-difficulty ${questionData?.difficulty?.toLowerCase() || 'medium'}`}>
            {questionData?.difficulty || 'Intermediate'}
          </div>
          <h4>{questionData?.title || 'Coding Challenge'}</h4>
          <div className="ide-desc">
            {questionData?.description || 'Loading challenge parameters...'}
          </div>
          
          <div className="mt-5 pt-4 border-top border-secondary">
            <h6 className="text-white fw-bold mb-3">Constraints</h6>
            <div className="ide-constraints-list">
              • Time Limit: 2.0s<br/>
              • Memory: 256MB<br/>
              • Standard Input Support
            </div>
          </div>

          {/* --- AI HINT SECTION --- */}
          <div className="mt-4 pt-4 border-top border-secondary">
            <button 
              className="w-100 py-2"
              onClick={() => setShowHint(!showHint)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: showHint ? '#a855f7' : 'rgba(168, 85, 247, 0.1)',
                color: showHint ? '#ffffff' : '#a855f7',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
            >
              <FaLightbulb /> {showHint ? 'Hide AI Hint' : 'Ask AI for Hint'}
            </button>

            {showHint && (
              <div 
                className="mt-3 p-3 rounded"
                style={{
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  fontSize: '0.9rem',
                  color: '#cbd5e1',
                  lineHeight: '1.6'
                }}
              >
                <div style={{ color: '#a855f7', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaRobot size={16} /> AI Assistant
                </div>
                <div>
                  <strong>Suggestion:</strong> {generateProgrammingHint(questionData?.title, questionData?.description)}
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>

      <main className="ide-main">
        <header className="ide-toolbar">
          <div className="d-flex align-items-center gap-4">
            <div className="ide-status-pill">
              <div className="pulse"></div> SECURE LAB ACTIVE
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
              <FaClock /> <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <select 
              className="bg-transparent border-0 text-white fw-bold" 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="java" className="bg-dark">Java 17</option>
              <option value="python" className="bg-dark">Python 3.10</option>
              <option value="c" className="bg-dark">C (GCC 11)</option>
            </select>
          </div>
        </header>

        <div className="ide-editor-container">
          <MonacoEditor
            height="100%"
            theme="vs-dark"
            language={selectedLanguage}
            value={sourceCode}
            onChange={(val) => setSourceCode(val)}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              padding: { top: 20 }
            }}
          />
        </div>

        <div className="ide-controls">
          <button className="ide-btn ide-btn-run" onClick={handleCompile} disabled={isCompiling}>
            {isCompiling ? "Executing..." : <><FaPlay size={12} /> Run Code</>}
          </button>
          <button className="ide-btn ide-btn-submit" onClick={() => toast.success("Submission logic activated")}>
            <FaPaperPlane size={12} /> Submit Solution
          </button>
        </div>

        <div className="ide-console">
          <div className="ide-console-tabs">
            <div className={`ide-console-tab ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>
              <FaTerminal className="me-2" /> Terminal
            </div>
            <div className={`ide-console-tab ${activeTab === 'testcases' ? 'active' : ''}`} onClick={() => setActiveTab('testcases')}>
              <FaCheckCircle className="me-2" /> Test Cases
            </div>
          </div>
          <div className="ide-console-output">
            <pre className="m-0">{output || 'Waiting for execution...'}</pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionPage;