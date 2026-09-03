import React, { useState } from 'react';
import './DebugChallenge.css';
import { 
  FaBug, 
  FaPlay, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTerminal, 
  FaListUl,
  FaChevronDown,
  FaCode,
  FaAngleDown
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const debugProblems = [
  {
    id: 1,
    title: 'Array Out of Bounds',
    difficulty: 'Easy',
    description: 'The function is intended to print all elements of an array. However, it throws an ArrayIndexOutOfBoundsException when executed.',
    symptoms: `Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5\n    at Main.printArray(Main.java:4)`,
    languages: {
      'Java': `public class Main {
    public static void printArray(int[] arr) {
        for (int i = 0; i <= arr.length; i++) {
            System.out.println(arr[i]);
        }
    }
}`,
      'Python': `def print_array(arr):
    for i in range(len(arr) + 1):
        print(arr[i])

# IndexError: list index out of range`,
      'C': `#include <stdio.h>

void printArray(int arr[], int size) {
    for (int i = 0; i <= size; i++) {
        printf("%d\\n", arr[i]);
    }
}`
    }
  },
  {
    id: 2,
    title: 'Infinite Loop',
    difficulty: 'Medium',
    description: 'The function should return the sum of all digits in a number. But it gets stuck in an infinite loop for positive numbers.',
    symptoms: 'Timeout Error: Execution exceeded 5000ms. The process was killed.',
    languages: {
      'Python': `def sum_digits(n):
    total = 0
    while n > 0:
        total += n % 10
        # BUG: Missing division to reduce n
    return total`,
      'Java': `public class Main {
    public static int sumDigits(int n) {
        int total = 0;
        while (n > 0) {
            total += n % 10;
        }
        return total;
    }
}`,
      'C++': `int sumDigits(int n) {
    int total = 0;
    while (n > 0) {
        total += n % 10;
    }
    return total;
}`
    }
  },
  {
    id: 3,
    title: 'Null Pointer Dereference',
    difficulty: 'Medium',
    description: 'The function is supposed to safely return the value pointed to by a pointer, or -1 if the pointer is null. Instead, it crashes with a segmentation fault.',
    symptoms: 'Segmentation fault (core dumped)',
    languages: {
      'C': `#include <stdio.h>

int getValue(int* ptr) {
    int value = *ptr;
    if (ptr == NULL) {
        return -1;
    }
    return value;
}`,
      'C++': `int getValue(int* ptr) {
    int value = *ptr;
    if (ptr == nullptr) {
        return -1;
    }
    return value;
}`,
      'Java': `public class Main {
    public static int getValue(Integer ptr) {
        int value = ptr;
        if (ptr == null) {
            return -1;
        }
        return value;
    }
}`
    }
  }
];

const DebugChallenge = () => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const problem = debugProblems[selectedProblemIndex];
  
  const availableLanguages = Object.keys(problem.languages);
  const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages[0]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const [code, setCode] = useState(problem.languages[selectedLanguage]);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleSelectProblem = (index) => {
    const newProblem = debugProblems[index];
    const newLang = Object.keys(newProblem.languages)[0];
    
    setSelectedProblemIndex(index);
    setSelectedLanguage(newLang);
    setCode(newProblem.languages[newLang]);
    setHasRun(false);
    setShowDropdown(false);
    setTestResults(null);
  };

  const handleSelectLanguage = (lang) => {
    setSelectedLanguage(lang);
    setCode(problem.languages[lang]);
    setShowLangDropdown(false);
    setHasRun(false);
    setTestResults(null);
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setHasRun(false);
    setTestResults(null);
    
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
      
      const defaultCodeForLang = problem.languages[selectedLanguage];
      if (code !== defaultCodeForLang) {
        setTestResults({ passed: true });
        toast.success('All tests passed! Bug fixed.', { theme: "colored" });
      } else {
        setTestResults({ passed: false });
        toast.error('Tests failed! The bug is still present.', { theme: "colored" });
      }
    }, 1200);
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return '#10b981'; // emerald
    if (diff === 'Medium') return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  return (
    <div className="debug-container animate-fade-in">
      <ToastContainer />
      
      {/* LEFT PANE */}
      <div className="debug-left-pane">
        <div className="debug-problem-selector">
          <div className="debug-selector-active" onClick={() => setShowDropdown(!showDropdown)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaListUl className="debug-selector-icon" />
              <span className="debug-selector-text">Debug Library</span>
            </div>
            <FaChevronDown className="debug-chevron-icon" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
          </div>
          
          {showDropdown && (
            <div className="debug-dropdown-menu">
              {debugProblems.map((prob, idx) => (
                <div 
                  key={prob.id} 
                  className={`debug-dropdown-item ${idx === selectedProblemIndex ? 'active' : ''}`}
                  onClick={() => handleSelectProblem(idx)}
                >
                  <span>{prob.id}. {prob.title}</span>
                  <span style={{ fontSize: '0.75rem', color: getDifficultyColor(prob.difficulty), fontWeight: 700 }}>
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="debug-header">
          <h1 className="debug-title">
            <div className="debug-title-icon-wrapper">
              <FaBug />
            </div>
            {problem.id}. {problem.title}
          </h1>
          <div className="debug-badges">
            <span className="debug-badge" style={{ color: getDifficultyColor(problem.difficulty), background: `${getDifficultyColor(problem.difficulty)}20`, border: `1px solid ${getDifficultyColor(problem.difficulty)}40` }}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="debug-content">
          <p className="debug-description">
            {problem.description}
          </p>

          <h3 className="debug-section-title">
            <FaTerminal className="debug-section-icon" /> Error Symptoms
          </h3>
          
          <div className="debug-bug-symptoms">
            {problem.symptoms.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="debug-right-pane">
        
        {/* Editor Area */}
        <div className="debug-editor-container">
          <div className="debug-editor-header">
            
            {/* MODERN LANGUAGE SELECTOR */}
            <div className="debug-lang-selector-wrapper">
              <div 
                className="debug-lang-selector" 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
              >
                <FaCode style={{ color: '#3b82f6' }} />
                <span>{selectedLanguage}</span>
                <FaAngleDown style={{ fontSize: '0.8rem', color: '#64748b', transform: showLangDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
              </div>
              
              {showLangDropdown && (
                <div className="debug-lang-dropdown">
                  {availableLanguages.map(lang => (
                    <div 
                      key={lang}
                      className={`debug-lang-option ${lang === selectedLanguage ? 'active' : ''}`}
                      onClick={() => handleSelectLanguage(lang)}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className={`debug-run-btn ${isRunning ? 'running' : ''}`} onClick={handleRunTests} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : <><FaPlay /> Run Tests</>}
            </button>
          </div>
          
          <textarea 
            className="debug-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Results Area */}
        <div className="debug-results-container">
          <div className="debug-results-header">
            <FaTerminal className="debug-header-icon" /> Terminal Output
          </div>
          
          <div className="debug-results-content">
            {!hasRun ? (
              <span className="debug-placeholder-text">$ Waiting for execution... Select a language and click 'Run Tests'.</span>
            ) : (
              <div>
                <div className="test-line">$ Running test suite for {selectedLanguage}...</div>
                {testResults?.passed ? (
                  <>
                    <div className="test-line test-pass" style={{ marginTop: '12px' }}>
                      <FaCheckCircle /> Test Case 1: PASSED
                    </div>
                    <div className="test-line test-pass">
                      <FaCheckCircle /> Test Case 2: PASSED
                    </div>
                    <div className="test-line test-pass" style={{ marginTop: '12px', fontWeight: 'bold' }}>
                      SUCCESS: The bug has been resolved!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="test-line test-pass" style={{ marginTop: '12px' }}>
                      <FaCheckCircle /> Test Case 1: PASSED (Trivial Case)
                    </div>
                    <div className="test-line test-fail">
                      <FaTimesCircle /> Test Case 2: FAILED
                    </div>
                    <div className="test-line" style={{ marginTop: '8px', color: '#fecaca' }}>
                      {problem.symptoms.split('\n')[0]}
                    </div>
                    <div className="test-line test-fail" style={{ marginTop: '12px', fontWeight: 'bold' }}>
                      FAILURE: The bug still exists in the {selectedLanguage} code.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DebugChallenge;
