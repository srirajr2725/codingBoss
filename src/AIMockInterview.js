import React, { useState, useEffect, useRef } from 'react';
import './AIMockInterview.css';
import { 
  FaRobot, 
  FaMicrophone, 
  FaStop, 
  FaCode,
  FaServer,
  FaUserTie,
  FaBuilding,
  FaPaperPlane,
  FaLightbulb
} from 'react-icons/fa';

const AIMockInterview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Data Structures');
  const [inputValue, setInputValue] = useState('');

  // state: 'idle', 'listening', 'processing', 'speaking'
  const [interviewState, setInterviewState] = useState('idle');
  const [messages, setMessages] = useState([]);
  
  const chatEndRef = useRef(null);

  // Auto-scroll the floating chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // SMART MOCK ENGINE
  const generateMockResponse = (userInput, topic) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('intro') || input.includes('name is') || input.includes('background') || input.includes('self introduction')) {
      return "It's great to meet you! Your background sounds very relevant. To dive right in, could you tell me about a time you had to overcome a difficult technical challenge?";
    }
    if (input.includes('hash map') || input.includes('dictionary') || input.includes('o(1)')) {
      return "Excellent choice. Hash maps provide O(1) average time complexity for lookups. However, what happens in the worst-case scenario when there are many collisions?";
    }
    if (input.includes('tree') || input.includes('graph') || input.includes('bfs') || input.includes('dfs')) {
      return "Graph and tree traversals are crucial here. Would you prefer a recursive Depth-First Search or an iterative Breadth-First approach for this specific problem, and why?";
    }
    if (input.includes('scale') || input.includes('load balancer') || input.includes('database') || input.includes('cache')) {
      return "Scaling a system requires careful consideration. How would you handle database replication and ensure data consistency across multiple regions under heavy load?";
    }
    if (input.includes('hello') || input.includes('hi') || input.includes('ready')) {
      return "Hello! I am excited to begin. Let's start with a classic question. Can you walk me through your thought process for solving a problem you've never seen before?";
    }
    if (input.includes('not sure') || input.includes('don\'t know') || input.includes('stuck') || input.includes('hint') || input.includes('teach me')) {
      return "That's completely okay! Interviews are about problem-solving, not just memorization. Let's break it down together. What is the most basic, brute-force way you might approach this?";
    }
    if (input.includes('array') || input.includes('list') || input.includes('pointer')) {
      return "Using pointers or array manipulation is a solid start. Can you optimize this to run in a single pass, specifically O(N) time complexity?";
    }
    
    // Fallback logic
    const fallbacks = [
      "That makes a lot of sense. Can you walk me through the space complexity of that approach?",
      "Interesting perspective. How would you handle edge cases, such as null inputs or extremely large datasets?",
      "I see. If we were to deploy this in a production environment, what potential bottlenecks would you look out for?",
      "Could you elaborate a bit more on why you chose that specific approach over the alternatives?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleSendText = () => {
    if (!inputValue.trim()) return;
    triggerResponseFlow(inputValue);
    setInputValue('');
  };

  const handleQuickQuestion = (text) => {
    if (interviewState === 'processing' || interviewState === 'speaking') return;
    triggerResponseFlow(text);
  };

  const triggerResponseFlow = (userText) => {
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInterviewState('processing');
    
    setTimeout(() => {
      setInterviewState('speaking');
      const aiResponse = generateMockResponse(userText, selectedTopic);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

      setTimeout(() => {
        setInterviewState('idle');
      }, 4000);
    }, 1500);
  };

  const handleMicClick = () => {
    if (interviewState === 'idle') {
      setInterviewState('listening');
    } else if (interviewState === 'listening') {
      triggerResponseFlow("I think I would introduce a caching layer to handle the load.");
    }
  };

  const topics = [
    { id: 'Data Structures', icon: <FaCode />, desc: 'Algorithms & Leetcode style questions' },
    { id: 'System Design', icon: <FaServer />, desc: 'Scalability, Architecture & Databases' },
    { id: 'HR & Behavioral', icon: <FaUserTie />, desc: 'Leadership, Conflict, and Culture Fit' },
    { id: 'Company Mock', icon: <FaBuilding />, desc: 'Targeted prep for FAANG companies' }
  ];

  const quickQuestions = [
    "Give self introduction",
    "Teach me interview basics",
    "Give me a hint for this problem",
    "How do I handle system design?",
    "Can we talk about Hash Maps?"
  ];

  const handleStartSession = () => {
    setMessages([
      { sender: 'ai', text: `Hello! I am your AI Interviewer. Today we will be focusing on ${selectedTopic}. I am ready when you are.` }
    ]);
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div className="ai-setup-container">
        <div className="ai-setup-content">
          <h1 className="ai-setup-title">Initialize AI Simulator</h1>
          <p className="ai-setup-subtitle">Select your target interview track to calibrate the AI model before entering the room.</p>
          
          <div className="ai-topic-grid">
            {topics.map(topic => (
              <div 
                key={topic.id} 
                className={`ai-topic-card ${selectedTopic === topic.id ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topic.id)}
              >
                <div className="ai-topic-icon">{topic.icon}</div>
                <h3 className="ai-topic-name">{topic.id}</h3>
                <p className="ai-topic-desc">{topic.desc}</p>
              </div>
            ))}
          </div>

          <button className="ai-start-btn" onClick={handleStartSession}>
            Initialize Simulator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bento-layout-container ${interviewState}`}>
      
      {/* BENTO HEADER */}
      <div className="bento-header">
        <h1 className="bento-title">AI MOCK SIMULATOR</h1>
        <div className="bento-status-badge">
          <div className="status-dot"></div>
          <span>
            {interviewState === 'idle' && 'AI is ready'}
            {interviewState === 'listening' && 'Listening...'}
            {interviewState === 'processing' && 'Thinking...'}
            {interviewState === 'speaking' && 'Speaking'}
          </span>
        </div>
      </div>

      {/* BENTO MAIN GRID */}
      <div className="bento-grid">
        
        {/* CARD 1: AI VISUALIZER */}
        <div className="bento-card ai-visualizer-card">
          <div className="ai-card-header">
            <h2>Interviewer</h2>
            <span className="topic-tag">{selectedTopic}</span>
          </div>
          
          <div className="ai-orb-wrapper">
            <div className="ai-orb-rings r1"></div>
            <div className="ai-orb-rings r2"></div>
            <div className="ai-orb-rings r3"></div>
            <div className="ai-orb">
              <FaRobot />
            </div>
          </div>
          
          <div className="ai-card-controls">
            <button className={`bento-mic-btn ${interviewState === 'listening' ? 'active' : ''}`} onClick={handleMicClick}>
              {interviewState === 'listening' ? <FaStop /> : <FaMicrophone />}
            </button>
            <p className="mic-hint">{interviewState === 'listening' ? 'Click to stop' : 'Click to speak'}</p>
          </div>
        </div>

        {/* CARD 2: CHAT INTERFACE */}
        <div className="bento-card chat-interface-card">
          <div className="chat-transcript">
            {messages.map((msg, idx) => (
              <div key={idx} className={`bento-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {interviewState === 'processing' && (
              <div className="bento-msg ai processing-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              className="bento-text-input" 
              placeholder="Type your response..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
              autoFocus
            />
            <button className="bento-send-btn" onClick={handleSendText}>
              <FaPaperPlane />
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM QUESTIONS DOCK */}
      <div className="bento-bottom-section">
        <h3 className="suggestions-title"><FaLightbulb /> Suggested Questions</h3>
        <div className="suggestions-row">
          {quickQuestions.map((q, idx) => (
            <button 
              key={idx} 
              className="suggestion-card-btn"
              onClick={() => handleQuickQuestion(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AIMockInterview;
