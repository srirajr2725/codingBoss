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
  const [showInputHint, setShowInputHint] = useState(false);

  // Question States
  const { questionId, question } = location.state || {};
  const [questionData, setQuestionData] = useState(question || null);

  // Security States
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'hint' | 'algorithm' | 'example'
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [helpAgreed, setHelpAgreed] = useState(false); // Initial agreement to see options
  const [unlockedHelps, setUnlockedHelps] = useState({ hint: false, algorithm: false, sample: false });
  const [helpToUnlock, setHelpToUnlock] = useState(null); // 'hint' | 'algorithm' | 'sample'
  const [showInitialAgreementModal, setShowInitialAgreementModal] = useState(false);
  const [testCases, setTestCases] = useState([]);

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
      console.log("Visibility Change detected. Hidden:", document.hidden, "Started:", isTestStartedRef.current);
      if (document.hidden && isTestStartedRef.current && !isTestSubmittedRef.current) {
        // triggerWarning("Tab switching is strictly prohibited!", "tab_switch", true);
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('error', handleGlobalError, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const isTrackingRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const isUploadingRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationRef = useRef(null);
  const terminatedRef = useRef(false);
  const isTestStartedRef = useRef(false);
  const isTestSubmittedRef = useRef(false);

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

      await fetch('https://untrumpeted-sallie-shallowly.ngrok-free.dev/api/upload-frame/', {
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
        // Fetch test-cases strictly from ngrok
        fetch(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/test-cases/`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
          .then(res => res.json())
          .then(tcData => {
            // Handle various response structures (results, questions, data, or direct array)
            const allItems = Array.isArray(tcData) ? tcData : (tcData.results || tcData.questions || tcData.data || []);
            const targetId = String(questionId || question?.id || "");

            // Filter by questionId to get ALL matches
            const relevantMatches = allItems.filter(q =>
              String(q.id || q.question_id) === targetId ||
              String(q.question) === targetId
            );

            if (relevantMatches.length > 0) {
              const mainMatch = relevantMatches[0];

              // Map ALL relevant matches to testCases state
              const normalizedTests = relevantMatches.map(tc => ({
                input: tc.input || tc.input_data || "None",
                expected_output: tc.expected_output || tc.output || "None"
              }));
              setTestCases(normalizedTests);

              setQuestionData(prev => ({
                ...prev,
                hints: mainMatch.hints || mainMatch.hint || prev?.hints,
                algorithm: mainMatch.algorithm || mainMatch.algo || prev?.algorithm,
                example_code: mainMatch.example_programs || mainMatch.example_code || mainMatch.code_example || prev?.example_code
              }));
            }
          }).catch((err) => { console.error("Test cases fetch failed:", err); });

        // Sync Primary API info
        const primaryData = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/question/?question_id=${questionId}`, 'GET');
        const base = Array.isArray(primaryData) ? primaryData[0] : primaryData;
        if (base) {
          setQuestionData(prev => ({
            ...prev,
            ...base,
            title: base.question || base.title || prev?.title || "Coding Challenge",
            description: base.description || (base.description !== base.question ? base.question : null) || prev?.description
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
      if (next >= 5) {
        terminatedRef.current = true;
        uploadViolationFrame();
        toast.error("🚫 DISQUALIFIED! Too many violations. Test submitted.");
        setIsTestSubmitted(true);
        setTimeout(() => submitSolution(), 1000); // Use submitSolution instead of just navigate
      } else {
        uploadViolationFrame();
        toast.error(`⚠️ WARNING (${next}/5): ${msg}`);
      }
      return next;
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startTest = async () => {
    try {
      // Attempt fullscreen but don't block if it fails
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fErr) {
        console.warn("Fullscreen request denied or unsupported.");
      }

      setIsTestStarted(true);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Test start failed:", err);
    }
  };

  const handleCompile = async () => {
    if (!sourceCode.trim()) return toast.warning("Enter code first!");
    setIsCompiling(true);
    try {
      const res = await apiClient("https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/compile/", "POST", {
        source_code: sourceCode,
        code: sourceCode,
        language: selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1).toLowerCase(),
        stdin: stdin
      });
      let finalOutput = res.output || res.error || "No output captured.";
      
      const mightNeedInput = /Scanner|cin|input\(|sys\.stdin|scanf|BufferedReader|readLine/i.test(sourceCode);
      if (mightNeedInput && !stdin.trim()) {
        setShowInputHint(true);
      } else {
        setShowInputHint(false);
      }
      setOutput(finalOutput);
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
      const response = await fetch('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/run-test/', {
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

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    toast.warning("Right-click is disabled during the test.");
  }, []);

  const handleCopyPaste = useCallback((e) => {
    e.preventDefault();
    toast.warning("Copy/Paste is disabled during the test.");
  }, []);

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
    <div className="ide-root coding-scope" onContextMenu={handleContextMenu} onCopy={handleCopyPaste} onPaste={handleCopyPaste} onCut={handleCopyPaste}>
      <ToastContainer position="top-center" autoClose={3000} />
      {showInitialAgreementModal && (
        <div className="ide-modal-overlay">
          <div className="ide-modal">
            <FaExclamationTriangle className="ide-modal-icon" />
            <h3>Access Help Options</h3>
            <p>Accessing the help menu will deduct <strong>2 marks</strong> from your score. Do you wish to continue?</p>
            <div className="ide-modal-mark-warning">2 Marks will be reduced</div>
            <div className="ide-modal-actions">
              <button className="ide-btn-cancel" onClick={() => setShowInitialAgreementModal(false)}>Cancel</button>
              <button className="ide-btn-proceed" onClick={() => {
                setHelpAgreed(true);
                setShowInitialAgreementModal(false);
              }}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {helpToUnlock && (
        <div className="ide-modal-overlay">
          <div className="ide-modal">
            <FaExclamationTriangle className="ide-modal-icon" />
            <h3>Unlock Specific Help</h3>
            <p>Unlocking this specific help resource will deduct another <strong>2 marks</strong>. Are you sure?</p>
            <div className="ide-modal-mark-warning">2 Marks will be reduced</div>
            <div className="ide-modal-actions">
              <button className="ide-btn-cancel" onClick={() => setHelpToUnlock(null)}>Cancel</button>
              <button className="ide-btn-proceed" onClick={() => {
                setUnlockedHelps(prev => ({ ...prev, [helpToUnlock]: true }));
                if (helpToUnlock === 'hint') setShowHint(true);
                if (helpToUnlock === 'algorithm') setShowAlgorithm(true);
                if (helpToUnlock === 'sample') setShowExample(true);
                setHelpToUnlock(null);
              }}>Unlock (-2 Marks)</button>
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
      <aside className="ide-sidebar">
        <div className="ide-sidebar-content">
          <div className={`ide-difficulty ${questionData?.difficulty?.toLowerCase() || 'medium'}`}>{questionData?.difficulty || 'Medium'}</div>
          <h4>{questionData?.title || 'Challenge'}</h4>
          <div className="ide-desc">{questionData?.description || questionData?.question || 'Loading...'}</div>

          {/* ── ALWAYS VISIBLE DETAILED TEST CASES ── */}
          {testCases.length > 0 && (
            <div className="ide-test-cases-help detailed-view" style={{ marginTop: '20px', borderLeft: '4px solid #10b981' }}>
              <div className="help-option-label" style={{ marginBottom: '15px', color: '#1e293b', fontSize: '0.85rem' }}>
                <FaCheckCircle style={{ color: '#10b981', marginRight: '8px' }} /> Public Test Cases
              </div>
              <div className="ide-test-cases-scroll" style={{ maxHheight: '300px' }}>
                {testCases.map((tc, idx) => (
                  <div key={idx} className="ide-tc-item detailed">
                    <div className="ide-tc-group">
                      <span className="ide-tc-header">SAMPLE INPUT</span>
                      <pre className="ide-tc-block" style={{ fontSize: '0.75rem', padding: '12px' }}>{tc.input || "None"}</pre>
                    </div>
                    <div className="ide-tc-group">
                      <span className="ide-tc-header expected">EXPECTED OUTPUT</span>
                      <pre className="ide-tc-block expected" style={{ fontSize: '0.75rem', padding: '12px' }}>{tc.expected_output || tc.output || "None"}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ide-extra-info">
            {!helpAgreed ? (
              <div className="ide-need-help-container">
                <span className="ide-need-help-title">Stuck on this challenge?</span>
                <p className="ide-need-help-desc">Access premium guidance to help you solve the problem.</p>
                <button className="ide-ultra-help-btn" onClick={() => setShowInitialAgreementModal(true)}>
                  <FaLightbulb /> Need Help?
                </button>
              </div>
            ) : (
              <div className="help-options-grid">
                <div
                  className={`help-option-card ${showHint ? 'active' : ''}`}
                  onClick={() => {
                    if (unlockedHelps.hint) setShowHint(!showHint);
                    else setHelpToUnlock('hint');
                  }}
                >
                  <div className="help-option-info">
                    <div className="help-option-icon" style={{ background: 'rgba(255, 160, 3, 0.1)', color: '#FFA003' }}>
                      <FaLightbulb />
                    </div>
                    <div>
                      <div className="help-option-label">(Help 1)</div>
                      <div className="help-option-tag">Hint</div>
                    </div>
                  </div>
                  <div className="help-option-arrow">{showHint ? '▲' : '▼'}</div>
                </div>
                {showHint && unlockedHelps.hint && (
                  <div className="help-content-box">
                    {questionData?.hints || "1. Check for edge cases like empty strings.\n2. Think about the most efficient loop structure."}
                  </div>
                )}

                <div
                  className={`help-option-card ${showAlgorithm ? 'active' : ''}`}
                  onClick={() => {
                    if (unlockedHelps.algorithm) setShowAlgorithm(!showAlgorithm);
                    else setHelpToUnlock('algorithm');
                  }}
                >
                  <div className="help-option-info">
                    <div className="help-option-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                      <FaBrain />
                    </div>
                    <div>
                      <div className="help-option-label">(Help 2)</div>
                      <div className="help-option-tag">Algorithm</div>
                    </div>
                  </div>
                  <div className="help-option-arrow">{showAlgorithm ? '▲' : '▼'}</div>
                </div>
                {showAlgorithm && unlockedHelps.algorithm && (
                  <div className="help-content-box">
                    {questionData?.algorithm || "1. Initialize variables.\n2. Process input data using a loop or recursion.\n3. Apply core logic.\n4. Return result."}
                  </div>
                )}

                <div
                  className={`help-option-card ${showExample ? 'active' : ''}`}
                  onClick={() => {
                    if (unlockedHelps.sample) setShowExample(!showExample);
                    else setHelpToUnlock('sample');
                  }}
                >
                  <div className="help-option-info">
                    <div className="help-option-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <FaCode />
                    </div>
                    <div>
                      <div className="help-option-label">(Help 3)</div>
                      <div className="help-option-tag">Sample Program</div>
                    </div>
                  </div>
                  <div className="help-option-arrow">{showExample ? '▲' : '▼'}</div>
                </div>
                {showExample && unlockedHelps.sample && (
                  <div className="help-content-box example-code-container">
                    <pre className="ide-sample-pre">
                      <code>{questionData?.example_code || "// Solution template\npublic class Solution {\n    public static void main(String[] args) {\n        // Code goes here\n    }\n}"}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
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
          <MonacoEditor height="100%" theme="light" language={monacoLang} value={sourceCode} onChange={(val) => setSourceCode(val)} options={{ fontSize: 14, minimap: { enabled: false }, contextmenu: false }} />
          <div className="ide-controls">
            <button className="ide-btn ide-btn-run" onClick={handleCompile} disabled={isCompiling}>{isCompiling ? "Compiling..." : "Run Code"}</button>
            <button className="ide-btn ide-btn-submit" onClick={submitSolution} disabled={isCompiling}>Submit Solution</button>
          </div>
        </div>
        <div className="ide-console">
          <div className="ide-console-header" style={{ padding: 0 }}>
            <span className="console-tab" style={{ flex: 1, borderRight: '1px solid var(--ide-border)', justifyContent: 'center', cursor: 'default', color: 'var(--ide-text-main)' }}>
              <FaRobot /> Input
            </span>
            <span className="console-tab" style={{ flex: 1, justifyContent: 'center', cursor: 'default', color: 'var(--ide-text-main)' }}>
              <FaTerminal /> Output
            </span>
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
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{output || 'Execution results...'}</pre>
              {showInputHint && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '4px', color: '#b45309', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <strong>💡 HINT:</strong> It looks like your program expects input.<br/>
                  Please type your input in the <strong>STANDARD INPUT (STDIN)</strong> section on the left before running your code. Do not type here in the output section.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionPage;