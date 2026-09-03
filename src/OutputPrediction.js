import React, { useState, useEffect } from 'react';
import './OutputPrediction.css';
import { 
  FaLightbulb,
  FaChevronDown,
  FaTerminal,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from './utils/apiClient';

const outputProblems = [
  {
    id: 1,
    title: 'Closure Trap',
    difficulty: 'Medium',
    language: 'JavaScript',
    description: 'Analyze the following JavaScript code using `var` inside a `setTimeout` loop. What will be logged to the console?',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}`,
    expectedOutput: '3\n3\n3',
    explanation: 'Because `var` does not have block scope, by the time the `setTimeout` callbacks run, the loop has already finished and `i` is 3. It will log "3" three times.'
  },
  {
    id: 2,
    title: 'Mutable Default Arguments',
    difficulty: 'Hard',
    language: 'Python',
    description: 'Examine this Python function which uses a list as a default argument. What is printed?',
    code: `def append_to(element, target=[]):
    target.append(element)
    return target

print(append_to(1))
print(append_to(2))`,
    expectedOutput: '[1]\n[1, 2]',
    explanation: 'In Python, default arguments are evaluated only once at function definition. The same list `target` is modified on subsequent calls.'
  },
  {
    id: 3,
    title: 'Type Coercion',
    difficulty: 'Easy',
    language: 'JavaScript',
    description: 'JavaScript is infamous for its implicit type coercion. What does this code output?',
    code: `console.log(1 + "2" + "2");
console.log(1 + +"2" + "2");
console.log(1 + -"1" + "2");`,
    expectedOutput: '122\n32\n02',
    explanation: 'First: `1 + "2"` = "12", then `"12" + "2"` = "122". Second: `+"2"` is evaluated as number 2, so `1 + 2` = 3, then `"3" + "2"` = "32". Third: `-"1"` is number -1, `1 + -1` = 0, then `"0" + "2"` = "02".'
  },
  {
    id: 4,
    title: 'Post-Increment vs Pre-Increment',
    difficulty: 'Easy',
    language: 'C++',
    description: 'C++ has subtle differences between pre-increment and post-increment. Predict the exact output.',
    code: `#include <iostream>
using namespace std;

int main() {
    int a = 5;
    int b = a++;
    int c = ++a;
    cout << b << " " << c << endl;
    return 0;
}`,
    expectedOutput: '5 7',
    explanation: '`b = a++` assigns 5 to `b` then increments `a` to 6. `c = ++a` increments `a` to 7 then assigns 7 to `c`. Output is "5 7".'
  }
];

const OutputPrediction = () => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const problem = outputProblems[selectedProblemIndex];
  
  const [prediction, setPrediction] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Clear feedback when selecting a new problem
  useEffect(() => {
    setPrediction('');
    setFeedback(null);
  }, [selectedProblemIndex]);

  const handleSelectProblem = (index) => {
    setSelectedProblemIndex(index);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!prediction.trim()) {
      toast.error('Please enter a prediction first!', { theme: "colored" });
      return;
    }

    try {
      const response = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/challenges/predict/submit/', 'POST', {
        challenge_id: problem.id,
        prediction: prediction.trim()
      });

      // Backend returns { is_correct: true/false, explanation: "..." }
      const isCorrect = response?.is_correct !== undefined 
        ? response.is_correct 
        : (prediction.trim() === problem.expectedOutput);

      if (isCorrect) {
        setFeedback({ success: true, message: response?.explanation || problem.explanation });
        toast.success('Perfect prediction!', { theme: "colored" });
      } else {
        setFeedback({ success: false, message: response?.explanation || 'Incorrect. Try tracing the execution step-by-step or reviewing syntax rules.' });
        toast.error('Prediction failed.', { theme: "colored" });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit prediction. Please try again later.", { theme: "colored" });
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return '#10b981'; 
    if (diff === 'Medium') return '#f59e0b'; 
    return '#ef4444'; 
  };

  return (
    <div className="op-focus-container">
      <ToastContainer position="top-center" />
      
      {/* FLOATING HEADER */}
      <div className="op-header">
        <div className="op-title">
          <FaLightbulb className="op-title-icon" />
          Mental Execution
        </div>
        
        <div className="op-selector-wrapper">
          <div className="op-selector-btn" onClick={() => setShowDropdown(!showDropdown)}>
            <span>Challenge: {problem.id}. {problem.title}</span>
            <FaChevronDown style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
          </div>
          
          {showDropdown && (
            <div className="op-dropdown">
              {outputProblems.map((prob, idx) => (
                <div 
                  key={prob.id} 
                  className={`op-dropdown-item ${idx === selectedProblemIndex ? 'active' : ''}`}
                  onClick={() => handleSelectProblem(idx)}
                >
                  <span style={{ fontSize: '0.9rem' }}>{prob.title}</span>
                  <span className="op-diff-badge" style={{ color: getDifficultyColor(prob.difficulty), background: `${getDifficultyColor(prob.difficulty)}20` }}>
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="op-main-content">
        <p className="op-problem-desc">
          {problem.description}
        </p>

        {/* MAC OSX CODE SNAPSHOT */}
        <div className="op-mac-window">
          <div className="op-mac-header">
            <div className="op-mac-dots">
              <div className="op-dot red"></div>
              <div className="op-dot yellow"></div>
              <div className="op-dot green"></div>
            </div>
            <div className="op-mac-title">
              {problem.language} Snippet
            </div>
            <div style={{ width: '44px' }}></div> {/* Spacer for centering */}
          </div>
          <pre className="op-code-body">
            {problem.code}
          </pre>
        </div>

        {/* COMMAND PALETTE INPUT */}
        <div className="op-palette-wrapper">
          <FaTerminal className="op-prompt-icon" />
          <textarea 
            className="op-palette-input"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type expected output..."
            spellCheck="false"
            autoFocus
          />
          <button className="op-submit-btn" onClick={handleSubmit}>
            Check <FaArrowRight />
          </button>
        </div>

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div className={`op-feedback-box ${feedback.success ? 'success' : 'error'}`}>
            <div className="op-feedback-header">
              {feedback.success ? <FaCheckCircle /> : <FaTimesCircle />}
              {feedback.success ? 'Correct!' : 'Wrong Output'}
            </div>
            <div className="op-feedback-message">
              {feedback.message}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OutputPrediction;
