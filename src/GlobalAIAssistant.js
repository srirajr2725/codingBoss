import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaMagic, FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import './GlobalAIAssistant.css';

const GlobalAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hello! I'm your Global AI Assistant. How can I help you today?" }
  ]);
  const [isLearnMounted, setIsLearnMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processAIRequest(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Text to Speech Function
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      synth.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Auto-open on mount (after login)
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Contextual monitoring based on route changes!
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let contextualMessage = "";

    if (path === '/' || path.includes('login') || path.includes('signup')) {
      contextualMessage = "Welcome to CodingBoss! Need help logging in or finding the right portal?";
    } else if (path.includes('mcq')) {
      contextualMessage = "I see you're in the MCQ Testing environment! I'll be monitoring your logic. Let me know if you need hints on specific topics.";
    } else if (path.includes('ide') || path.includes('programming') || path.includes('question')) {
      contextualMessage = "Entering the Coding IDE. I am actively analyzing your code structure. Ask me if you hit any syntax errors!";
    } else if (path.includes('course') || path.includes('learn')) {
      contextualMessage = "You're exploring courses! The Java & JVM Architecture masterclass is highly recommended for backend roles.";
    } else if (path.includes('dashboard')) {
      contextualMessage = "Welcome to your Dashboard. From here you can track your progress, access tasks, and review assignments.";
    }

    if (contextualMessage) {
      setMessages(prev => [...prev, { type: 'ai', text: contextualMessage, isContextual: true }]);
      setIsOpen(true);
      // Removed auto-close as per user request
    }
  }, [location.pathname]);

  const processAIRequest = (inputText) => {
    if (!inputText.trim()) return;

    const currentInput = inputText.toLowerCase();
    const userMsg = { type: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Simulate AI thinking and NLP parsing
    setTimeout(() => {
      let aiResponse = "";
      let navigateTo = null;

      // --- NLP Navigation Intents ---
      if (currentInput.includes("java") && (currentInput.includes("learn") || currentInput.includes("course") || currentInput.includes("want"))) {
        aiResponse = "Absolutely! Navigating you to the Java masterclass now. Get ready to dive deep into the JVM!";
        navigateTo = "/courses";
      } else if (currentInput.includes("python") && (currentInput.includes("learn") || currentInput.includes("course"))) {
        aiResponse = "Python is a great choice! Taking you to the Python course now...";
        navigateTo = "/courses";
      } else if (currentInput.includes("test") || currentInput.includes("mcq")) {
        aiResponse = "Setting up your testing environment... Redirecting you to the MCQ tests.";
        navigateTo = "/McqTestPage";
      } else if (currentInput.includes("code") || currentInput.includes("ide") || currentInput.includes("programming")) {
        aiResponse = "Opening the Coding IDE. Let's write some flawless logic!";
        navigateTo = "/ProgrammingTestPage";
      } else if (currentInput.includes("dashboard") || currentInput.includes("home")) {
        aiResponse = "Taking you back to your central dashboard.";
        navigateTo = "/UserDashboard";
      }
      
      // --- NLP Q&A Intents ---
      else if (currentInput.includes("what is") && currentInput.includes("array")) {
        aiResponse = "An array is a data structure consisting of a collection of elements, each identified by at least one index. They are incredibly fast for O(1) random access!";
      } else if (currentInput.includes("how") && currentInput.includes("java")) {
        aiResponse = "Java works on the 'Write Once, Run Anywhere' principle. Your code is compiled into bytecode, which is then interpreted by the Java Virtual Machine (JVM) on any OS.";
      } else if (currentInput.includes("hello") || currentInput.includes("hi")) {
        aiResponse = "Hello there! How can I assist you today? I can answer coding questions or navigate you anywhere on the platform.";
      } else {
        aiResponse = "I am processing your request. As your AI Mentor, I can guide you through the optimal solution or navigate you to the right tools.";
      }

      setMessages(prev => [...prev, { type: 'ai', text: aiResponse, isContextual: navigateTo !== null }]);
      speak(aiResponse); // AI speaks back

      // Trigger auto-navigation if a route was matched
      if (navigateTo) {
        setTimeout(() => {
          navigate(navigateTo);
          // Removed auto-close
        }, 1800);
      }
    }, 800);
  };

  const handleSend = (e) => {
    e.preventDefault();
    processAIRequest(inputValue);
  };

  // Strictly hide on Course/Learn pages and Tests
  const path = location.pathname.toLowerCase();
  const isCourseRelated = path.includes('course') || path.includes('learn');
  const isTestRelated = path.includes('test') || path.includes('mcq') || path.includes('question');

  if (isCourseRelated || isTestRelated) {
    return null;
  }

  return (
    <div className="global-ai-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="ai-chat-window"
          >
            <div className="ai-chat-header">
              <div className="ai-header-left">
                <div className="ai-avatar-container">
                  <FaRobot size={20} color="#fff" />
                  <div className="ai-pulse-dot"></div>
                </div>
                <div>
                  <h4 className="ai-title">AI Mentor</h4>
                  <p className="ai-status">Active & Monitoring...</p>
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="ai-chat-body">
              {messages.map((msg, idx) => (
                <div key={idx} className={`ai-msg-row ${msg.type}`}>
                  {msg.type === 'ai' && (
                    <div className="ai-msg-icon">
                      {msg.isContextual ? <FaMagic size={12} color="#f59e0b" /> : <FaRobot size={14} />}
                    </div>
                  )}
                  <div className={`ai-bubble ${msg.type} ${msg.isContextual ? 'contextual' : ''}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="ai-chat-footer" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="button" 
                className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
              >
                <FaMicrophone />
              </button>
              <button type="submit" disabled={!inputValue.trim()} className="ai-send-btn">
                <FaPaperPlane />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="ai-fab"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaRobot size={24} />
        <span className="ai-fab-badge">1</span>
      </motion.button>
    </div>
  );
};

export default GlobalAIAssistant;
