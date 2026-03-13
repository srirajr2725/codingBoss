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
  const [pasteAttemptCount, setPasteAttemptCount] = useState(0);
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
        setQuestionData(data[0]);
        if (data[0]?.test_cases_count) {
          setTotalCases(data[0].test_cases_count);
        }
      } catch (err) {
        toast.error('Error fetching question details');
      }
    };

    fetchLanguages();
    if (questionId) {
      fetchQuestionData();
    }
  }, [questionId]);

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
      paste_attempts: pasteAttemptCount,
      terminated: true, // flag
    };

    await apiClient("compiler/run-test/", "POST", submissionData);

  } catch (err) {
    console.error("Force close error:", err);
  }
  setTimeout(() => {
    navigate("/Userdashboard");
  }, 2000);
};

const handleTabSwitch = useCallback(() => {

  if (isTestSubmitted) return;

  setTabSwitchCount((prev) => {

    const newCount = prev + 1;

    trackActivity("tab_switch");

    // 🚨 If limit reached
    if (newCount >= 5) {

      toast.error("🚫 Maximum tab switches reached. Test terminated!", {
        position: "top-center",
        autoClose: 4000,
      });

      // Auto close test
      setTimeout(() => {
        forceCloseTest();
      }, 1500);

    } else {

      toast.warning(`⚠️ Tab switch detected (${newCount}/5)`, {
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
      typeof response?.passed_cases === "number" &&
      typeof response?.total_cases === "number"
    ) {

      setPassedCases(response.passed_cases);
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
        time_taken: timeTaken,
        tab_switches: tabSwitchCount,
        paste_attempts: pasteAttemptCount
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
        testcases: testCaseResults?.test_results || []
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
        navigate('/TestResults', { state: { results } });
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
                  <h4>{questionData?.title || question?.title || 'Coding Challenge'}</h4>
                  <span className={`difficulty-badge ${questionData?.difficulty?.toLowerCase()}`}>
                    {questionData?.difficulty || 'Medium'}
                  </span>
                </div>
                
                <div className="question-description">
                  <h5>Problem Statement</h5>
                  <p>{questionData?.question || 'No question available'}</p>
                </div>
                
                <div className="question-description">
                  <h5>Description</h5>
                  <p>{questionData?.description || 'No description available'}</p>
                </div>
                
                {questionData?.constraints && (
                  <div className="question-constraints">
                    <h5>Constraints</h5>
                    <p>{questionData.constraints}</p>
                  </div>
                )}
                
                {questionData?.examples && questionData.examples.length > 0 && (
                  <div className="question-examples">
                    <h5>Examples</h5>
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
               disabled={isCompiling || tabSwitchCount >= 5}
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
                disabled={isRunningTests || tabSwitchCount >= 5}
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
               disabled={isSubmitting || isTestSubmitted || tabSwitchCount >= 5}
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
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 4,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'selection',
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
                        {testCaseResults.test_results?.map((test, idx) => (
                          <div 
                            key={idx} 
                            className={`test-case-card ${test.status}`}
                          >
                            <div className="test-case-header">
                              <span className="test-number">Test Case #{idx + 1}</span>
                              <span className={`status-badge ${test.status}`}>
                                {test.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                              </span>
                            </div>
                            
                            {test.status === 'failed' && (
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
                                  <code className="detail-value actual">{test.actual_output}</code>
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
                        ))}
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