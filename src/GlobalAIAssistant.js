import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaMagic, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import './GlobalAIAssistant.css';

const GlobalAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hello! I am your AI Mentor. I'm actively monitoring your progress and I'm here to guide you." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const isListeningRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

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
      // Optionally pop open the chat briefly to show the user we noticed
      setIsOpen(true);
      setTimeout(() => setIsOpen(false), 5000); // Auto-close after 5s unless they interact
    }
  }, [location.pathname]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    // Text-to-Speech Helper
    const speakVoice = (text) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // stop previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    };
    
    // Attach to window so processAIRequest can use it
    window.speakAIVoice = speakVoice;

    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // PSEUDO-CONTINUOUS MODE IS MUCH MORE RELIABLE
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("🎤 [AI Voice Debug] Heard:", transcript);
        
        // Wake Word Logic
        if (transcript.includes("hey coding") || transcript.includes("coding boss") || transcript.includes("codingboss")) {
          console.log("🚀 [AI Voice Debug] WAKE WORD DETECTED!");
          setIsOpen(true);
          setMessages(prev => [...prev, { type: 'user', text: "Hey CodingBoss" }]);
          setTimeout(() => {
            speakVoice("I'm here. What would you like to do?");
            setMessages(prev => [...prev, { type: 'ai', text: "I'm here. What would you like to do?", isContextual: true }]);
          }, 500);
        } else if (isOpenRef.current) {
          console.log("🧠 [AI Voice Debug] Processing Command:", transcript);
          setInputValue(transcript);
          if (window.triggerAIRequest) {
            window.triggerAIRequest(transcript);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("🎤 [AI Voice Debug] Error:", event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🎤 [AI Voice Debug] Stopped listening. Auto-restarting in 1s...");
        // Auto-restart aggressively for true hands-free background listening!
        if (isListeningRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch(e) {}
          }, 1000); // 1 second delay to prevent infinite crash loop
        }
      };

      // === AUTO-START ON MOUNT FOR HANDS-FREE ===
      try {
        isListeningRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
        console.log("🎤 [AI Voice Debug] Auto-started listening on mount.");
      } catch (err) {
        console.error("🎤 [AI Voice Debug] Auto-start failed:", err);
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      isListeningRef.current = true;
      try { recognitionRef.current?.start(); } catch(e) {}
      setIsListening(true);
    }
  };

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

      // --- Siri-like Wake Word ---
      const hasWakeWord = currentInput.includes("hey codingboss");
      let prefix = hasWakeWord ? "I'm here! " : "";

      // --- NLP Navigation Intents ---
      if (currentInput === "hey codingboss") {
        aiResponse = "Yes? I'm listening. How can I help you accelerate your coding journey today?";
      } else if (currentInput.includes("java") && (currentInput.includes("learn") || currentInput.includes("course") || currentInput.includes("want"))) {
        aiResponse = prefix + "Absolutely! Navigating you to the Java masterclass now. Get ready to dive deep into the JVM!";
        navigateTo = "/courses";
      } else if (currentInput.includes("python") && (currentInput.includes("learn") || currentInput.includes("course"))) {
        aiResponse = prefix + "Python is a great choice! Taking you to the Python course now...";
        navigateTo = "/courses";
      } else if (currentInput.includes("test") || currentInput.includes("mcq")) {
        aiResponse = prefix + "Setting up your testing environment... Redirecting you to the MCQ tests.";
        navigateTo = "/McqTestPage";
      } else if (currentInput.includes("code") || currentInput.includes("ide") || currentInput.includes("programming")) {
        aiResponse = prefix + "Opening the Coding IDE. Let's write some flawless logic!";
        navigateTo = "/ProgrammingTestPage";
      } else if (currentInput.includes("dashboard") || currentInput.includes("home")) {
        aiResponse = prefix + "Taking you back to your central dashboard.";
        navigateTo = "/UserDashboard";
      }
      
      // --- NLP Q&A Intents ---
      else if (currentInput.includes("what is") && currentInput.includes("array")) {
        aiResponse = prefix + "An array is a data structure consisting of a collection of elements, each identified by at least one index. They are incredibly fast for O(1) random access!";
      } else if (currentInput.includes("how") && currentInput.includes("java")) {
        aiResponse = prefix + "Java works on the 'Write Once, Run Anywhere' principle. Your code is compiled into bytecode, which is then interpreted by the Java Virtual Machine (JVM) on any OS.";
      } else if (currentInput.includes("hello") || currentInput.includes("hi")) {
        aiResponse = prefix + "Hello there! How can I assist you today? I can answer coding questions or navigate you anywhere on the platform.";
      } else {
        aiResponse = prefix + "I am processing your request. As your AI Mentor, I can guide you through the optimal solution or navigate you to the right tools.";
      }

      // Trigger AI Voice
      if (window.speakAIVoice) {
        window.speakAIVoice(aiResponse.replace("I'm here! ", "")); // Don't re-say wake word part out loud
      }
      
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse, isContextual: navigateTo !== null }]);

      // Trigger auto-navigation if a route was matched
      if (navigateTo) {
        setTimeout(() => {
          navigate(navigateTo);
          setTimeout(() => setIsOpen(false), 3000); 
        }, 1800);
      }
    }, 800);
  };
  
  // Expose to window for the onresult closure
  window.triggerAIRequest = processAIRequest;

  const handleSend = (e) => {
    e.preventDefault();
    processAIRequest(inputValue);
  };

  const path = location.pathname.toLowerCase();
  if (path.includes('course') || path.includes('learn')) {
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
              <button 
                type="button" 
                className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListen}
                title="Voice Command"
              >
                {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <input
                type="text"
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
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
