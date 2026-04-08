import { useRef, useState, useCallback, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Dropdown, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import './QuestionPage.css';
import Navbar from './NavbarComponent';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuestionPage = ({ isLoggedIn, userRole, setIsLoggedIn, handleLogout, username }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Code Editor States
  const [sourceCode, setSourceCode] = useState("");

  // Input/Output StatesH
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  // Question States
  const { question, questionId } = location.state || {};
  const [questionData, setQuestionData] = useState(null);

  // Language States
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Test Case States
  const [passedCases, setPassedCases] = useState(0);
  const [totalCases, setTotalCases] = useState(0);
  const [testCaseResults, setTestCaseResults] = useState(null);
  const [showTestCases, setShowTestCases] = useState(false);

  // UI States
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [consoleHeight, setConsoleHeight] = useState(300);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  // Loading States
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test/Security States
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // User States
  const [userId, setUserId] = useState("");

  // Editor Ref
  const editorRef = useRef(null);
  const inputEditorRef = useRef(null);

  // Timer States
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ============================================================
  // INITIALIZATION & AUTH
  // ============================================================

  useEffect(() => {
    const storedEncryptedUserID = localStorage.getItem('userID');
    if (storedEncryptedUserID) {
      const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
      const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
      setUserId(decryptedUserId);
    }

    // Start timer
    setStartTime(Date.now());
  }, []);

  // ================= SIMPLE AUTH CHECK =================

  useEffect(() => {
    const email = localStorage.getItem("username");

    // Redirect only if truly not logged in
    if (!email) {
      navigate("/LoginPage");
    }
  }, [navigate]);


  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime && !isTestSubmitted) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isTestSubmitted]);

  // ============================================================
  // DATA FETCHING
  // ============================================================

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await apiClient('compiler/languages/', 'GET');
        if (Array.isArray(data)) {
          setLanguages(data);
        } else {
          toast.error('Failed to load languages');
        }
      } catch (err) {
        toast.error('Error fetching languages');
      }
    };

    const fetchQuestionData = async () => {
      try {
        const data = await apiClient(`compiler/question/?question_id=${questionId}`, 'GET');
        const activeData = Array.isArray(data) ? data[0] : data;
        setQuestionData(activeData);
        if (activeData?.test_cases_count) {
          setTotalCases(activeData.test_cases_count);
        }
      } catch (err) {
        toast.error('Error fetching question details');
      }
    };

    // 🔥 ALREADY COMPLETED CHECK
    try {
      const completedIds = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
      if (questionId && completedIds.includes(questionId)) {
        toast.info("You are already attended");
        setTimeout(() => navigate('/UserDashboard'), 1500);
        return;
      }
    } catch (e) {
      console.error("Error checking completed questions", e);
    }

    fetchLanguages();
    if (questionId) {
      fetchQuestionData();
    }
  }, [questionId, navigate]);

  // ============================================================
  // ANTI-CHEAT MEASURES
  // ============================================================

  const trackActivity = async (activityType) => {
    if (isTestSubmitted) return;

    try {
      await apiClient(
        "compiler/track-activity/",
        "POST",
        JSON.stringify({
          user_id: userId,
          question_id: questionId,
          activity_type: activityType,
          timestamp: new Date().toISOString(),
          metadata: { severity: "medium" }
        }),
        { "Content-Type": "application/json" }
      );
    } catch (err) {
      console.error('Failed to track activity:', err);
    }
  };

  const forceCloseTest = async () => {

    if (isTestSubmitted) return;

    setIsTestSubmitted(true);

    toast.error("🚫 Test closed! You switched tabs 5 times.", {
      position: "top-center",
      autoClose: 4000,
    });

    try {

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const submissionData = {
        user_id: userId,
        question_id: questionId,
        source_code: sourceCode,
        language: selectedLanguage,
        time_taken: timeTaken,
        tab_switches: tabSwitchCount,
        paste_attempts: 0,
        terminated: true, // flag
      };

      await apiClient("compiler/run-test/", "POST", submissionData);

    } catch (err) {
      console.error("Force close error:", err);
    }
    setTimeout(() => {
      navigate("/UserDashboard");
    }, 2000);
  };

  const handleTabSwitch = useCallback(() => {

    if (isTestSubmitted) return;

    setTabSwitchCount((prev) => {

      const newCount = prev + 1;

      trackActivity("tab_switch");

      // 🚨 If limit reached
      if (newCount >= 3) {

        toast.error("🚫 Maximum tab switches reached. Test terminated!", {
          position: "top-center",
          autoClose: 4000,
        });

        // Auto close test
        setTimeout(() => {
          forceCloseTest();
        }, 1500);

      } else {

        toast.warning(`⚠️ Tab switch detected (${newCount}/2 warnings)`, {
          position: "top-center",
          autoClose: 2000,
        });

      }

      return newCount;
    });

  }, [isTestSubmitted]);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isTestSubmitted) {
        handleTabSwitch();
      }
    };

    const handleFocusLost = () => {
      if (!isTestSubmitted) {
        handleTabSwitch();
      }
    };

    window.addEventListener("blur", handleFocusLost);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleFocusLost);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleTabSwitch, isTestSubmitted]);

  // ============================================================
  // STRONG COPY / PASTE / CUT / RIGHT CLICK BLOCK
  // ============================================================

  // ============================================================
  // STRONG COPY / PASTE / CUT / RIGHT CLICK BLOCK
  // ============================================================

  useEffect(() => {

    const preventClipboard = (e) => {
      if (!isTestSubmitted) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("❌ Copy / Paste / Cut is disabled during the test!");
        return false;
      }
    };

    const preventRightClick = (e) => {
      if (!isTestSubmitted) {
        e.preventDefault();
        toast.error("❌ Right click is disabled during the test!");
        return false;
      }
    };

    const preventKeyboardShortcuts = (e) => {
      if (isTestSubmitted) return;

      // Ctrl / Cmd based shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        (
          e.key.toLowerCase() === "c" ||   // Copy
          e.key.toLowerCase() === "v" ||   // Paste
          e.key.toLowerCase() === "x" ||   // Cut
          e.key.toLowerCase() === "a" ||   // Select All
          e.key.toLowerCase() === "s" ||   // Save
          e.key.toLowerCase() === "u"      // View Source
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("❌ Shortcut disabled during the test!");
        return false;
      }

      // F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        toast.error("❌ Developer tools disabled during test!");
        return false;
      }
    };

    // Disable selection
    const disableSelection = () => {
      if (!isTestSubmitted) {
        document.body.style.userSelect = "none";
      }
    };

    const enableSelection = () => {
      document.body.style.userSelect = "auto";
    };

    disableSelection();

    // Add listeners at window level (stronger than document)
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

  }, [isTestSubmitted]);


  const handleCompile = async () => {
    // 1. Initial Validation
    if (!sourceCode?.trim()) {
      toast.error("⚠️ Please enter your code");
      return;
    }
    if (!selectedLanguage) {
      toast.error("⚠️ Please select a language first");
      return;
    }

    // 2. UI Loading State
    setIsCompiling(true);
    setError(null);
    setOutput("");
    setActiveTab("output");
    setIsConsoleExpanded(true);

    // 3. Prepare Payload
    // We send 'input' as it's the most common key for this specific error.
    const requestData = {
      source_code: sourceCode,
      language: selectedLanguage,
      input: input || "",  // Most APIs use 'input'
      stdin: input || ""   // Some APIs use 'stdin'
    };

    try {
      // 4. API Request
      const response = await apiClient(
        "compiler/compile/",
        "POST",
        requestData
      );

      // 5. Handle Logical Errors (Status 200 but Code Crashed)
      if (response?.error) {
        setError({
          title: "Execution Error",
          message: response.error,
          type: response.error_type || "RuntimeError",
          line: response.line_number,
          column: response.column_number
        });

        // Show whatever output was captured before the crash
        setOutput(response.output || "");
        toast.error("❌ Execution failed");

      } else {
        // 6. Handle Success
        setOutput(response?.output || "No Output");
        toast.success("✅ Code Executed");
      }

    } catch (err) {
      // 7. Handle Network/Server Errors (404, 500, etc.)
      toast.error("❌ Compiler Server Error");

      setError({
        title: "Server Error",
        message: err.message || "Compiler not responding",
        type: "ServerError"
      });

    } finally {
      // 8. Stop Loader
      setIsCompiling(false);
    }
  };

  const handleRunTestCases = async () => {

    if (!sourceCode.trim()) {
      toast.error("⚠️ Please enter your code before running tests");
      return;
    }

    if (!selectedLanguage) {
      toast.error("⚠️ Please select a language first");
      return;
    }

    setIsRunningTests(true);
    setTestCaseResults(null);
    setActiveTab("testcases");
    setIsConsoleExpanded(true);

    const requestData = {
      question_id: questionId,
      user_id: userId,
      source_code: sourceCode,
      language: selectedLanguage,
    };

    try {

      const response = await apiClient(
        "compiler/run-test/",
        "POST",
        requestData
      );

      console.log("Run Test Response:", response);
      if (
        typeof response?.passed === "number" &&
        typeof response?.total_cases === "number"
      ) {

        setPassedCases(response.passed);
        setTotalCases(response.total_cases);

        // store full response
        setTestCaseResults(response);

        toast.success("✅ Test cases executed");

      } else {

        toast.error("⚠️ Invalid response from server");
        console.error("Invalid response:", response);

      }

    } catch (err) {

      console.error("Run Test Error:", err);
      toast.error("❌ Error running test cases");

    } finally {

      setIsRunningTests(false);

    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passedCases === 0 && totalCases > 0) {
      toast.warning('⚠️ You haven\'t passed any test cases. Are you sure you want to submit?');
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmission = async (confirmed) => {
    setShowConfirmation(false);

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const scorePercentage = totalCases > 0 ? (passedCases / totalCases) * 100 : 0;

      const submissionData = {
        user_id: userId,
        question_id: questionId,
        source_code: sourceCode,
        language: selectedLanguage,
        // time_taken: timeTaken,
        // tab_switches: tabSwitchCount,
        // paste_attempts: 0
      };

      // Submit to backend
      const response = await apiClient(
        "compiler/run-test/",
        "POST",
        JSON.stringify(submissionData),
        { "Content-Type": "application/json" }
      );

      // Create results object
      const results = {
        testType: 'Coding',
        question: question?.title || 'Programming Question',
        questionId: questionId,
        score: passedCases,
        maxScore: totalCases,
        percentage: Math.round(scorePercentage),
        passedTestcases: passedCases,
        totalTestcases: totalCases,
        language: selectedLanguage,
        sourceCode: sourceCode,
        timeTaken: timeTaken,
        completedAt: new Date().toISOString(),
        submissionId: response?.submission_id,
        grade: response?.grade,
        feedback: response?.feedback,
        testcases: testCaseResults?.results || []
      };

      // Store results
      localStorage.setItem('submitMessage', 'Test Submitted Successfully!');
      localStorage.setItem('testResults', JSON.stringify(results));

      // Track completed questions
      try {
        const completedQuestions = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
        if (!completedQuestions.includes(questionId)) {
          completedQuestions.push(questionId);
          localStorage.setItem('completedQuestions', JSON.strHingify(completedQuestions));
        }
      } catch (e) {
        localStorage.setItem('completedQuestions', JSON.stringify([questionId]));
      }

      setIsTestSubmitted(true);
      toast.success('✅ Test submitted successfully!');

      // Navigate to results
      setTimeout(() => {
        navigate('/UserDashboard');
      }, 1000);

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('❌ Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // LANGUAGE & EDITOR HANDLERS
  // ============================================================

  const handleLanguageChange = (lang) => {

    // 🔥 Backend exact format mapping
    const languageMap = {
      JAVA: "Java",
      PYTHON: "python",
      C: "C"
    };

    const backendLang = languageMap[lang];

    setSelectedLanguage(backendLang);

    setOutput("");
    setError(null);
    setActiveTab("input");

    const templates = {
      Java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your Java code here
    }
}`,
      python: `# Write your Python code here
def main():
    pass

if __name__ == "__main__":
    main()`,
      C: `#include <stdio.h>

int main() {
    // Write your C code here
    return 0;
}`
    };

    const code = templates[backendLang] || "";

    setSourceCode(code);

    if (editorRef.current) {
      editorRef.current.setValue(code);
      editorRef.current.focus();
    }

    toast.success(`Selected ${backendLang}`);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleCompile();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT, () => {
      handleRunTestCases();
    });

    // Anti-cheat: Block Paste from keyboard
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.error("❌ Paste is strongly locked out!");
    });
    
    // Anti-cheat: Undo any paste (e.g. from browser Edit menu)
    editor.onDidPaste(() => {
      toast.error("❌ Paste is strongly locked out!");
      editor.trigger('keyboard', 'undo', null);
    });
  };

  const handleInputEditorDidMount = (editor, monaco) => {
    inputEditorRef.current = editor;
  };

  // ============================================================
  // UI HANDLERS
  // ============================================================

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const toggleConsole = () => {
    setIsConsoleExpanded(prev => !prev);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ============================================================
  // RENDER
  // ============================================================

  const baseTest = questionData?.base_tests?.[0] || question?.base_tests?.[0] || {};
  const displayTitle = questionData?.title || question?.title || baseTest?.title || 'Coding Challenge';
  const displayLevel = questionData?.difficulty || questionData?.level || question?.level || 'Medium';
  const displayContent = questionData?.content || question?.content || baseTest?.content;
  const displayQuestion = questionData?.question || question?.question || baseTest?.question || 'No question available';
  const displayDescription = questionData?.description || question?.description || baseTest?.description || 'No description available';
  const displayInput = questionData?.input_data || question?.input_data || baseTest?.input_data;
  const displayOutput = questionData?.expected_output || question?.expected_output || baseTest?.expected_output;

  return (
    <div className="coding-scope">
      <div className="coding-scroll">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />

        <div className="coding-challenge-container">
          {/* Sidebar - Question Panel */}
          <div className={`question-sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
            {isSidebarVisible ? (
              <div className="sidebar-content">
                <div className="sidebar-header">
                  <h3>Question Details</h3>
                  <button onClick={toggleSidebar} className="sidebar-toggle-btn">
                    <span>‹</span>
                  </button>
                </div>
                <div className="question-details">
                  <div className="question-title">
                    <h4>{displayTitle}</h4>
                    <span className={`difficulty-badge ${displayLevel.toLowerCase()}`}>
                      {displayLevel}
                    </span>
                  </div>

                  {displayContent && (
                    <div className="question-description">
                      <h5>Content</h5>
                      <p>{displayContent}</p>
                    </div>
                  )}

                  <div className="question-description">
                    <h5>Problem Statement</h5>
                    <p>{displayQuestion}</p>
                  </div>

                  <div className="question-description">
                    <h5>Description</h5>
                    <p>{displayDescription}</p>
                  </div>

                  {(displayInput || displayOutput) && (
                    <div className="question-examples">
                      <h5>Sample Input & Output</h5>
                      <div className="example-block">
                        {displayInput && (
                          <div style={{ marginBottom: displayOutput ? '10px' : '0' }}>
                            <strong>Input:</strong>
                            <pre style={{ margin: '5px 0 0 0', padding: '10px', background: 'var(--primary-bg)', borderRadius: '4px', color: '#ce9178', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', fontFamily: "'Consolas', 'Monaco', monospace" }}>{displayInput}</pre>
                          </div>
                        )}
                        {displayOutput && (
                          <div>
                            <strong>Output:</strong>
                            <pre style={{ margin: '5px 0 0 0', padding: '10px', background: 'var(--primary-bg)', borderRadius: '4px', color: '#ce9178', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', fontFamily: "'Consolas', 'Monaco', monospace" }}>{displayOutput}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {questionData?.constraints && (
                    <div className="question-constraints">
                      <h5>Constraints</h5>
                      <p>{questionData.constraints}</p>
                    </div>
                  )}

                  {questionData?.examples && questionData.examples.length > 0 && (
                    <div className="question-examples">
                      <h5>Additional Examples</h5>
                      {questionData.examples.map((example, idx) => (
                        <div key={idx} className="example-block">
                          <p><strong>Input:</strong> <code>{example.input}</code></p>
                          <p><strong>Output:</strong> <code>{example.output}</code></p>
                          {example.explanation && (
                            <p><strong>Explanation:</strong> {example.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={toggleSidebar} className="sidebar-toggle-arrow">
                <span>›</span>
              </button>
            )}
          </div>

          {/* Main Editor Section */}
          <div className="editor-section">
            {/* Header */}
            <div className="editor-header">
              <div className="header-left">
                <Dropdown
                  className="language-dropdown"
                  drop="down"
                  autoClose="outside"
                >
                  <Dropdown.Toggle
                    variant="secondary"
                    id="language-selector"
                    as="button"
                  >
                    <span className="language-icon">💻</span>
                    {selectedLanguage || "Select Language"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>

                    <Dropdown.Item
                      onClick={() => handleLanguageChange("JAVA")}
                      active={selectedLanguage === "JAVA"}
                    >
                      Java
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => handleLanguageChange("PYTHON")}
                      active={selectedLanguage === "PYTHON"}
                    >
                      Python
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => handleLanguageChange("C")}
                      active={selectedLanguage === "C"}
                    >
                      C
                    </Dropdown.Item>

                  </Dropdown.Menu>
                </Dropdown>
              </div>


              <div className="header-center">
                <div className="timer-display">
                  <span className="timer-icon">⏱️</span>
                  <span className="timer-text">{formatTime(elapsedTime)}</span>
                </div>
                {tabSwitchCount > 0 && (
                  <div className="warning-indicator" title={`${tabSwitchCount} tab switches detected`}>
                    <span className="warning-icon">⚠️</span>
                    <span className="warning-count">{tabSwitchCount}</span>
                  </div>
                )}
              </div>

              <div className="header-right">
                <button
                  className="btn-run"
                  onClick={handleCompile}
                  disabled={isCompiling || tabSwitchCount >= 3}
                >
                  {isCompiling ? (
                    <>
                      <span className="spinner-small"></span>
                      Running...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">▶️</span>
                      Run
                    </>
                  )}
                </button>

                <button
                  className="btn-test"
                  onClick={handleRunTestCases}
                  disabled={isRunningTests || tabSwitchCount >= 3}
                >
                  {isRunningTests ? (
                    <>
                      <span className="spinner-small"></span>
                      Testing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      Run Tests
                    </>
                  )}
                </button>

                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isTestSubmitted || tabSwitchCount >= 3}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📤</span>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="code-editor-container">
              <MonacoEditor
                height="100%"
                language={selectedLanguage.toLowerCase()}
                value={sourceCode}
                onChange={(value) => setSourceCode(value)}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: false,
                  formatOnType: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderWhitespace: 'selection',
                  contextmenu: false,
                  bracketPairColorization: {
                    enabled: true
                  }
                }}
              />
            </div>

            {/* Console Panel */}
            <div className={`console-panel ${isConsoleExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="console-header">
                <div className="console-tabs">
                  <button
                    className={`console-tab ${activeTab === 'input' ? 'active' : ''}`}
                    onClick={() => setActiveTab('input')}
                  >
                    <span className="tab-icon">📝</span>
                    Input
                  </button>
                  <button
                    className={`console-tab ${activeTab === 'output' ? 'active' : ''}`}
                    onClick={() => setActiveTab('output')}
                  >
                    <span className="tab-icon">📄</span>
                    Output
                  </button>
                  <button
                    className={`console-tab ${activeTab === 'testcases' ? 'active' : ''}`}
                    onClick={() => setActiveTab('testcases')}
                  >
                    <span className="tab-icon">✓</span>
                    Test Cases
                    {testCaseResults && (
                      <span className="tab-badge">{passedCases}/{totalCases}</span>
                    )}
                  </button>
                  {error && (
                    <button
                      className={`console-tab error-tab ${activeTab === 'errors' ? 'active' : ''}`}
                      onClick={() => setActiveTab('errors')}
                    >
                      <span className="tab-icon">⚠️</span>
                      Errors
                    </button>
                  )}
                </div>
                <button className="console-expand-btn" onClick={toggleConsole}>
                  {isConsoleExpanded ? '▼' : '▲'}
                </button>
              </div>

              <div className="console-content">
                {/* Input Tab */}
                {activeTab === 'input' && (
                  <div className="console-input-section">
                    <div className="input-header">
                      <label>Custom Input</label>
                      <span className="input-hint">Provide your test input here</span>
                    </div>
                    <MonacoEditor
                      height="250px"
                      language="plaintext"
                      value={input}
                      onChange={(value) => setInput(value)}
                      onMount={handleInputEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false
                      }}
                    />
                  </div>
                )}

                {/* Output Tab */}
                {activeTab === 'output' && (
                  <div className="console-output-section">
                    <div className="output-header">
                      <label>Program Output</label>
                      {output && (
                        <button
                          className="btn-clear-output"
                          onClick={() => setOutput('')}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="output-content">
                      {isCompiling ? (
                        <div className="loading-state">
                          <div className="spinner"></div>
                          <p>Compiling and executing your code...</p>
                        </div>
                      ) : output ? (
                        <pre className="output-text">{output}</pre>
                      ) : (
                        <div className="empty-state">
                          <span className="empty-icon">📋</span>
                          <p>Output will appear here after running your code</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Test Cases Tab */}
                {activeTab === 'testcases' && (
                  <div className="console-testcases-section">
                    {isRunningTests ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Running test cases...</p>
                      </div>
                    ) : testCaseResults ? (
                      <div className="test-results">
                        <div className="test-summary">
                          <div className="summary-circle">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#2a2a2a"
                                strokeWidth="8"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#4caf50"
                                strokeWidth="8"
                                strokeDasharray={`${(passedCases / totalCases) * 283} 283`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                              />
                              <text
                                x="50"
                                y="50"
                                textAnchor="middle"
                                dy="7"
                                fill="#fff"
                                fontSize="20"
                                fontWeight="bold"
                              >
                                {Math.round((passedCases / totalCases) * 100)}%
                              </text>
                            </svg>
                          </div>
                          <div className="summary-stats">
                            <h3>{passedCases} / {totalCases} Passed</h3>
                            <p className="summary-subtitle">
                              {passedCases === totalCases
                                ? '🎉 All tests passed!'
                                : `${totalCases - passedCases} test(s) failed`}
                            </p>
                          </div>
                        </div>

                        <div className="test-cases-list">
                          {testCaseResults.results?.map((test, idx) => {
                            const statusStr = test.passed ? 'passed' : 'failed';
                            return (
                              <div
                                key={idx}
                                className={`test-case-card ${statusStr}`}
                              >
                                <div className="test-case-header">
                                  <span className="test-number">Test Case #{idx + 1}</span>
                                  <span className={`status-badge ${statusStr}`}>
                                    {test.passed ? '✓ Passed' : '✗ Failed'}
                                  </span>
                                </div>

                                {!test.passed && (
                                  <div className="test-case-details">
                                    <div className="detail-row">
                                      <span className="detail-label">Input:</span>
                                      <code className="detail-value">{test.input}</code>
                                    </div>
                                    <div className="detail-row">
                                      <span className="detail-label">Expected:</span>
                                      <code className="detail-value expected">{test.expected_output}</code>
                                    </div>
                                    <div className="detail-row">
                                      <span className="detail-label">Got:</span>
                                      <code className="detail-value actual">{test.output || test.actual_output}</code>
                                    </div>
                                    {test.error && (
                                      <div className="detail-row error">
                                        <span className="detail-label">Error:</span>
                                        <span className="detail-value">{test.error}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="test-case-metrics">
                                  <span className="metric">
                                    <span className="metric-icon">⏱️</span>
                                    {test.execution_time || 0}ms
                                  </span>
                                  <span className="metric">
                                    <span className="metric-icon">💾</span>
                                    {formatBytes(test.memory_used || 0)}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <span className="empty-icon">✓</span>
                        <p>Click "Run Tests" to see test case results</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Errors Tab */}
                {activeTab === 'errors' && error && (
                  <div className="console-errors-section">
                    <div className="error-display">
                      <div className="error-header">
                        <span className="error-icon">⚠️</span>
                        <h4>{error.title || 'Error'}</h4>
                      </div>
                      <div className="error-content">
                        <pre className="error-message">{error.message}</pre>
                        {error.line && (
                          <div className="error-location">
                            <span>Line {error.line}</span>
                            {error.column && <span>, Column {error.column}</span>}
                          </div>
                        )}
                        <div className="error-type">
                          <strong>Type:</strong> {error.type}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Confirm Submission</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to submit your solution?</p>
                <div className="submission-summary">
                  <div className="summary-item">
                    <span className="summary-label">Test Cases Passed:</span>
                    <span className="summary-value">{passedCases} / {totalCases}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Score:</span>
                    <span className="summary-value">
                      {totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0}%
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Time Spent:</span>
                    <span className="summary-value">{formatTime(elapsedTime)}</span>
                  </div>
                  {tabSwitchCount > 0 && (
                    <div className="summary-item warning">
                      <span className="summary-label">Tab Switches:</span>
                      <span className="summary-value">{tabSwitchCount}</span>
                    </div>
                  )}
                </div>
                <p className="modal-warning">
                  ⚠️ You cannot change your submission after submitting.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => handleConfirmSubmission(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-confirm"
                  onClick={() => handleConfirmSubmission(true)}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {(isCompiling || isRunningTests || isSubmitting) && (
          <div className="loading-overlay">
            <div className="loading-spinner-container">
              <div className="spinner-large"></div>
              <p className="loading-text">
                {isCompiling && 'Compiling your code...'}
                {isRunningTests && 'Running test cases...'}
                {isSubmitting && 'Submitting your solution...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;