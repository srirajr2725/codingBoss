import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaLock, FaCheckCircle, FaStar, FaRocket,
  FaGraduationCap, FaShieldAlt, FaWhatsapp, FaInfoCircle,
  FaCode, FaClipboardList, FaArrowLeft, FaChevronRight,
  FaLightbulb, FaBookOpen, FaLayerGroup, FaQuoteLeft,
  FaClock, FaSignal, FaTrophy, FaPlay, FaChevronLeft, FaTimesCircle, FaExclamationTriangle, FaRobot, FaVolumeUp, FaVolumeMute, FaMicrophone
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Learn.css';

/* ══════════════════════════════════════════════
   EXTENSIVE CHAPTER DATA (Java, C, Python)
   Providing a "Proper Learning Website" experience
 ══════════════════════════════════════════════ */
import javaData from './data/java.json';
import cData from './data/c.json';
import pythonData from './data/python.json';

// Import local logos for high-fidelity UI
import JavaLogo from './images/Java.png';
import PythonLogo from './images/python.png';
import CLogo from './images/c_program.png';

// Inject logos into course data
javaData.imageUrl = JavaLogo;
pythonData.imageUrl = PythonLogo;
cData.imageUrl = CLogo;

const courses = [javaData, pythonData, cData];
const Learn = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('chapter');
  const [lessonProgress, setLessonProgress] = useState({});
  const [viewMode, setViewMode] = useState('listing'); // listing, dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // PROCTORING STATES
  const [isProctored, setIsProctored] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // AI BOT STATES
  const [showAIBot, setShowAIBot] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [displayedCode, setDisplayedCode] = useState("");
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [isTaskIDE, setIsTaskIDE] = useState(false);
  const [taskEvaluation, setTaskEvaluation] = useState(null);

  // Auto-typing effect for Code
  useEffect(() => {
    if (aiResponse && aiResponse.code) {
      setDisplayedCode("");
      let i = 0;
      const code = aiResponse.code;
      const interval = setInterval(() => {
        if (i < code.length) {
          setDisplayedCode((prev) => prev + code[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [aiResponse]);

  // Speech Recognition Logic
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak your topic now.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAiQuery(transcript);
      setIsListening(false);
      // Auto-trigger search if it's a clear command
      if (transcript.length > 2) {
        toast.success(`Heard: "${transcript}"`);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
      toast.error("Could not hear clearly. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const utteranceRef = useRef(null);

  useEffect(() => {
    // Pre-load voices
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Greet student when AI Bot opens
  useEffect(() => {
    if (showAIBot && !aiResponse) {
      const greeting = `Hi! I am your CodingBoss AI Mentor. What type of topics would you like to learn today?`;
      speakResponse(greeting);
    }
  }, [showAIBot, aiResponse]);

  const speakResponse = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text) return;

    // Create new utterance and store in ref to prevent GC
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = 0.75;  // Slow & clear — ideal for students learning tech
    utteranceRef.current.pitch = 1.05; // Slightly warm, friendly tone

    // Select a premium sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer Google US English or similar
      const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
      utteranceRef.current.voice = preferredVoice;
    }

    utteranceRef.current.onstart = () => {
      console.log("AI speaking...");
      setIsSpeaking(true);
    };

    utteranceRef.current.onend = () => {
      console.log("AI finished speaking.");
      setIsSpeaking(false);
    };

    utteranceRef.current.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utteranceRef.current);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cb_learn_progress');
    if (saved) setLessonProgress(JSON.parse(saved));
  }, []);

  const saveProgress = (newProgress) => {
    setLessonProgress(newProgress);
    localStorage.setItem('cb_learn_progress', JSON.stringify(newProgress));
  };

  const startSecureLearning = async (course) => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }

      setSelectedCourse(course);
      setActiveLesson(course.curriculum[0]);
      setActiveTab(course.curriculum[0].type);
      setShowExplanation(false);
      setSelectedOption(null);
      setViewMode('dashboard');
      setIsProctored(true);
      setTabSwitchCount(0);
      setShowAIBot(true); // 🔥 Trigger AI Bot on entry
      setAiResponse(null);
      setAiQuery("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error("❌ Fullscreen is required for Secure Learning Mode!");
    }
  };

  const handleAISubmit = useCallback(() => {
    if (!aiQuery.trim()) return;

    if (isTaskMode) {
      setIsBotThinking(true);
      setTimeout(() => {
        const studentCode = aiQuery.toLowerCase();
        // Simple evaluation logic for the "shutdown" task
        const hasShutdown = studentCode.includes('void shutdown') || studentCode.includes('public void shutdown');
        const setsInactive = studentCode.includes('isactive = false');

        if (hasShutdown && setsInactive) {
          setTaskEvaluation({
            status: 'SUCCESS',
            message: "Outstanding! You've perfectly implemented the shutdown method. You've correctly used the private state variable to manage the system lifecycle."
          });
          speakResponse("Outstanding! You've perfectly implemented the shutdown method. Your logic is clean and secure.");
          setIsTaskMode(false);
        } else {
          setTaskEvaluation({
            status: 'ERROR',
            message: "Not quite there. Make sure you define 'void shutdown()' and set 'isActive = false' inside it. Check your syntax and try again!"
          });
          speakResponse("Not quite there yet. Remember to define the shutdown method and correctly update the is active state. Try again, you can do it!");
        }
        setIsBotThinking(false);
      }, 1000);
      return;
    }

    // Clear previous and show thinking
    setAiResponse(null);
    setTaskEvaluation(null);
    setIsBotThinking(true);

    // Simulate AI Search in curriculum
    setTimeout(() => {
      if (!selectedCourse || !selectedCourse.curriculum) {
        setIsBotThinking(false);
        return;
      }

      const query = aiQuery.toLowerCase().trim();
      const matchedLesson = selectedCourse.curriculum.find(l =>
        l.title.toLowerCase().includes(query) ||
        (l.contentBlocks && l.contentBlocks.some(b => b.value && b.value.toLowerCase().includes(query)))
      );

      if (matchedLesson) {
        // AGGREGATE ALL BLOCKS FOR A "FULL COMPLETE" ANSWER
        const allDefs = matchedLesson.contentBlocks?.filter(b => b.type === 'definition').map(b => `${b.term}: ${b.value}`).join(' ') || "";
        const allText = matchedLesson.contentBlocks?.filter(b => b.type === 'text' && !b.value.includes('###')).map(b => b.value).join(' ') || "";
        const codeBlock = matchedLesson.contentBlocks?.find(b => b.type === 'code');
        const tipBlock = matchedLesson.contentBlocks?.find(b => b.type === 'tip');

        const resp = {
          title: matchedLesson.title,
          explanation: `${allText} ${allDefs}`,
          example: tipBlock ? tipBlock.value : "This concept is foundational to high-performance engineering.",
          code: codeBlock ? codeBlock.value :
            `// Professional ${matchedLesson.title} Architecture\n` +
            `public class ${matchedLesson.title.split(' ').pop().replace(/\W/g, '')}Service {\n` +
            `    // 1. Internal state management\n` +
            `    private String moduleName = "${matchedLesson.title}";\n` +
            `    private boolean isActive = false;\n\n` +
            `    // 2. Main execution entry point\n` +
            `    public void initialize() {\n` +
            `        this.isActive = true;\n` +
            `        System.out.println("System [" + moduleName + "] is now ACTIVE.");\n` +
            `        runCoreDiagnostics();\n` +
            `    }\n\n` +
            `    // 3. Private implementation detail\n` +
            `    private void runCoreDiagnostics() {\n` +
            `        if(isActive) {\n` +
            `            System.out.println("Running security handshake...");\n` +
            `            System.out.println("Status: ALL SYSTEMS NOMINAL");\n` +
            `        }\n` +
            `    }\n` +
            `}`,
          codeLang: codeBlock ? codeBlock.lang : "java",
          codeExplanation: `This program defines a specialized Service class. First, we initialize private state variables to ensure encapsulation. The initialize method then sets the system to active and triggers a series of internal diagnostics. This structure ensures that implementation details remain hidden while providing a clean public interface.`,
          studentTask: `Try to extend this class by adding a 'shutdown()' method that sets isActive to false and prints a farewell message. Use the private access modifiers to maintain security!`,
          lessonId: matchedLesson.id
        };
        setAiResponse(resp);
        const voiceText = `Here is your full breakdown of ${resp.title}. ${resp.explanation}. I am now writing a professional program for you. Let's walk through it line-by-line. ${resp.codeExplanation} Now, here is a challenge for you: ${resp.studentTask}. Finally, a professional tip: ${resp.example}`;
        speakResponse(voiceText);
      } else {
        const resp = {
          title: "Engineering Insight",
          explanation: `While "${aiQuery}" is a broad concept, in ${selectedCourse.title} it typically represents a core logical pattern.`,
          example: "Think of this as the master blueprint for your data flow.",
          code:
            `/**\n * Master Architecture: ${aiQuery}\n */\n` +
            `class ${aiQuery.replace(/\W/g, '')}Manager {\n` +
            `    constructor() {\n` +
            `        this.engineReady = true;\n` +
            `        console.log("Manager Initialized for: ${aiQuery}");\n` +
            `    }\n\n` +
            `    // Execute high-priority task\n` +
            `    process() {\n` +
            `        if(this.engineReady) {\n` +
            `            console.log("Executing ${aiQuery} logic...");\n` +
            `            return { status: 'COMPLETE' };\n` +
            `        }\n` +
            `    }\n` +
            `}\n\n` +
            `const manager = new ${aiQuery.replace(/\W/g, '')}Manager();\n` +
            `manager.process();`,
          codeLang: "javascript",
          codeExplanation: "This implementation uses a modern Class-based approach. The constructor sets up the initial state, while the process method handles the actual logic conditionally. This pattern is essential for building scalable tools.",
          studentTask: `Add a 'reset()' method to the Manager class that logs a message and ensures engineReady is set back to true.`
        };
        setAiResponse(resp);
        const voiceText = `${resp.explanation} Let's analyze the code implementation. ${resp.codeExplanation}. I've also prepared a task for you: ${resp.studentTask}`;
        speakResponse(voiceText);
      }
      setIsBotThinking(false);
    }, 1200);
  }, [aiQuery, selectedCourse, isTaskMode]);

  const handleExitCourse = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
    setIsProctored(false);
    setSelectedCourse(null);
    setActiveLesson(null);
    setViewMode('listing');
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isProctored && viewMode === 'dashboard' && !isCompleted) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            toast.error("🚫 Excessive tab switching detected! Redirecting to home...", { position: "top-center" });
            handleExitCourse();
          } else {
            toast.warning(`⚠️ Attention! Tab switch detected (${next}/3). Stay focused!`, { position: "top-center" });
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isProctored, viewMode, isCompleted, handleExitCourse]);

  // 🔥 FORCE FULLSCREEN INTEGRITY
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isProctored && !isCompleted) {
        toast.error("🚫 Secure Learning Mode requires Fullscreen. Session terminated.");
        handleExitCourse();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isProctored, isCompleted, handleExitCourse]);


  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setActiveLesson(null);
    setViewMode('listing');
  };


  const handleNextLesson = () => {
    const currentIndex = selectedCourse.curriculum.findIndex(l => l.id === activeLesson.id);
    if (currentIndex < selectedCourse.curriculum.length - 1) {
      const next = selectedCourse.curriculum[currentIndex + 1];
      setActiveLesson(next);
      setActiveTab(next.type);
      setShowExplanation(false);
      setSelectedOption(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsCompleted(true);
    }
  };

  const toggleLessonComplete = (lessonId) => {
    const updated = { ...lessonProgress, [lessonId]: !lessonProgress[lessonId] };
    saveProgress(updated);
  };

  /* ══════════════════════════════════════════════
     RENDER: LISTING VIEW
  ══════════════════════════════════════════════ */
  return (
    <div className="lrn-master-wrapper">
      <ToastContainer theme="dark" position="top-center" autoClose={3000} />

      {/* ── HIGH-FIDELITY AI MENTOR OVERLAY ── */}
      {showAIBot && (
        <div className="cb-ai-portal">
          <div className="cb-ai-glass-card animate-scale-up">

            {/* Header with Glass Gradient */}
            <div className="cb-ai-glass-header">
              <div className="cb-ai-bot-visual">
                <div className="cb-ai-glow"></div>
                <FaRobot />
                {isSpeaking && <div className="cb-ai-voice-rings">
                  <span></span><span></span><span></span>
                </div>}
              </div>
              <div className="cb-ai-header-info">
                <h3 className="cb-ai-title">CodingBoss AI Mentor</h3>
                <div className={`cb-ai-status-pill ${isSpeaking ? 'speaking' : 'online'}`}>
                  <span className="cb-status-dot"></span>
                  {isSpeaking ? 'Explaining Topic...' : `Mentor for ${selectedCourse?.title || 'your path'}`}
                </div>
              </div>
              <button className="cb-ai-close-btn" onClick={() => { stopSpeaking(); setShowAIBot(false); }}>
                <FaTimesCircle />
              </button>
            </div>

            <div className="cb-ai-glass-body">
              {!aiResponse ? (
                <div className="cb-ai-welcome-state">
                  <div className="cb-ai-welcome-content">
                    <h2 className="cb-ai-welcome-h2">What would you like to <span className="cb-text-gradient">master</span> today?</h2>
                    <p className="cb-ai-welcome-p">I can explain complex engineering concepts, provide production-ready code, and show real-world examples.</p>
                  </div>

                  <div className="cb-ai-search-wrapper">
                    <div className="cb-ai-input-box">
                      <FaLightbulb className="cb-input-icon" />
                      <input
                        type="text"
                        placeholder={isTaskMode ? "Write your solution here..." : (isListening ? "Listening..." : "Ask me about OOPS, Variables, Arrays...")}
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAISubmit()}
                      />
                      <button
                        className={`cb-ai-mic-btn ${isListening ? 'active' : ''}`}
                        onClick={toggleListening}
                        title="Ask with voice"
                      >
                        <FaMicrophone />
                      </button>
                      <button className="cb-ai-ask-btn" onClick={handleAISubmit} disabled={isBotThinking}>
                        {isBotThinking ? <div className="lrn-spinner-mini"></div> : <>{isTaskMode ? <><FaCode /> Submit</> : <><FaPlay /> Ask AI</>}</>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cb-ai-result-state animate-fade-in">

                  {/* Evaluation Result */}
                  {taskEvaluation && (
                    <div className={`cb-ai-eval-card ${taskEvaluation.status.toLowerCase()} animate-slide-up`}>
                      <div className="cb-ai-eval-header">
                        {taskEvaluation.status === 'SUCCESS' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{taskEvaluation.status === 'SUCCESS' ? 'SOLVED' : 'ERROR FOUND'}</span>
                      </div>
                      <p className="cb-ai-eval-p">{taskEvaluation.message}</p>
                    </div>
                  )}
                  <div className="cb-ai-card-premium explanation">
                    <div className="cb-ai-card-tag">EXPLANATION</div>
                    <h4 className="cb-ai-card-h4">{aiResponse.title}</h4>
                    <p className="cb-ai-card-p">{aiResponse.explanation}</p>
                    {isSpeaking && (
                      <button className="cb-ai-voice-stop-btn" onClick={stopSpeaking}>
                        <FaVolumeMute /> Stop Narration
                      </button>
                    )}
                  </div>

                  {/* Code implementation */}
                  <div className="cb-ai-card-premium code-block">
                    <div className="cb-ai-card-tag">IMPLEMENTATION</div>
                    <div className="cb-ai-code-header">
                      <span>{aiResponse.codeLang.toUpperCase()}</span>
                    </div>
                    <pre className="cb-ai-pre">
                      <code>{displayedCode}</code>
                      <span className="cb-ai-typing-cursor">|</span>
                    </pre>
                    <div className="cb-ai-code-walkthrough">
                      <h5>Code Walkthrough</h5>
                      <p>{aiResponse.codeExplanation}</p>
                    </div>
                  </div>

                  {/* Example & Tip */}
                  <div className="cb-ai-card-premium insight">
                    <div className="cb-ai-card-tag">PRO INSIGHT</div>
                    <div className="cb-ai-insight-content">
                      <FaRocket className="cb-insight-icon" />
                      <p>{aiResponse.example}</p>
                    </div>
                  </div>

                  <div className="cb-ai-actions-footer">
                    <button className="cb-ai-secondary-btn" onClick={() => { setAiResponse(null); setAiQuery(""); stopSpeaking(); }}>
                      Ask Another Topic
                    </button>
                    {aiResponse.studentTask && (
                      <div className="cb-ai-student-task-card animate-slide-up">
                        <div className="cb-ai-task-header">
                          <FaClipboardList /> <span>Your Turn: Practical Challenge</span>
                        </div>
                        <p className="cb-ai-task-p">{aiResponse.studentTask}</p>
                        {!isTaskMode && (
                          <button className="cb-ai-start-task-btn" onClick={() => {
                            setIsTaskIDE(true);
                            setAiQuery("");
                            setTaskEvaluation(null);
                          }}>
                            Start Coding Challenge <FaCode />
                          </button>
                        )}
                      </div>
                    )}
                    <button className="cb-ai-primary-btn" onClick={() => {
                      if (aiResponse.lessonId) {
                        const lesson = selectedCourse.curriculum.find(l => l.id === aiResponse.lessonId);
                        setActiveLesson(lesson);
                        setActiveTab(lesson.type);
                      }
                      setShowAIBot(false);
                      stopSpeaking();
                    }}>
                      Go to Full Lesson <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI IDE BIG SCREEN OVERLAY ── */}
      {isTaskIDE && (
        <div className="cb-ai-ide-overlay animate-fade-in">
          <div className="cb-ai-ide-container">
            <aside className="cb-ai-ide-sidebar">
              <div className="cb-ai-ide-side-header">
                <FaRobot /> <span>AI Mentor IDE</span>
              </div>
              <div className="cb-ai-ide-instructions">
                <h3 className="cb-ai-ide-task-title">{aiResponse?.title}</h3>
                <p className="cb-ai-ide-task-desc">{aiResponse?.studentTask}</p>
                <div className="cb-ai-ide-hint">
                  <FaLightbulb />
                  <span><strong>Line-by-Line Goal:</strong> Define a method and update internal state correctly.</span>
                </div>
              </div>

              {taskEvaluation && (
                <div className={`cb-ai-ide-feedback ${taskEvaluation.status.toLowerCase()}`}>
                  <div className="cb-ai-eval-header">
                    {taskEvaluation.status === 'SUCCESS' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span>{taskEvaluation.status === 'SUCCESS' ? 'SOLVED' : 'LINE-BY-LINE ANALYSIS'}</span>
                  </div>
                  <p className="cb-ai-eval-p">{taskEvaluation.message}</p>
                  {taskEvaluation.status === 'ERROR' && (
                    <div className="cb-ai-ide-critique">
                      <strong>Mentor Insight:</strong> Check if you've initialized the method signature exactly as requested.
                    </div>
                  )}
                </div>
              )}
            </aside>

            <main className="cb-ai-ide-editor">
              <div className="cb-ai-ide-editor-header">
                <div className="cb-ai-ide-tabs">
                  <div className="cb-ai-ide-tab active">{aiResponse?.codeLang.toUpperCase()} SOURCE</div>
                </div>
                <div className="cb-ai-ide-editor-actions">
                  <button className="cb-ai-ide-exit" onClick={() => { setIsTaskIDE(false); setIsTaskMode(false); }}>Exit</button>
                  <button className="cb-ai-ide-submit" onClick={handleAISubmit} disabled={isBotThinking}>
                    {isBotThinking ? "Analyzing..." : "Submit for Review"}
                  </button>
                </div>
              </div>
              <div className="cb-ai-ide-editor-body">
                <div className="cb-ai-ide-line-nums">
                  {Array.from({ length: 25 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea
                  className="cb-ai-ide-textarea"
                  spellCheck="false"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="// Enter your solution code here..."
                ></textarea>
              </div>
            </main>
          </div>
        </div>
      )}

      {viewMode === 'listing' ? (
        <div className="lrn-root">
          {/* ── HERO ── */}
          <header className="lrn-hero-ultra">
            <div className="lrn-container">
              <div className="lrn-hero-row">
                <div className="lrn-hero-content">
                  <span className="lrn-badge-premium">
                    <span className="lrn-badge-dot"></span>
                    Secure Learning Environment
                  </span>
                  <h1 className="lrn-hero-h1">
                    Master <span className="lrn-gradient">Engineering</span> Skills
                  </h1>
                  <p className="lrn-hero-p">
                    Professional grade tracks designed for deep technical mastery.
                    Enter a distraction-free environment to accelerate your learning.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* ── COURSES ── */}
          <section className="lrn-section">
            <div className="lrn-container">
              <div className="lrn-section-header">
                <div className="lrn-header-left">
                  <p className="lrn-section-eyebrow">Engineering Tracks</p>
                  <h2 className="lrn-section-title">Professional Curriculum</h2>
                </div>
                <div className="lrn-search-container">
                  <div className="lrn-search-box">
                    <FaCode />
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="lrn-card-grid">
                {filteredCourses.map(course => (
                  <div key={course.id} className="lrn-course-card" onClick={() => startSecureLearning(course)}>
                    <div className="lrn-card-band" style={{ background: course.color }}></div>
                    <div className="lrn-card-body-inner">
                      <div className="lrn-card-icon-row">
                        <div className="lrn-card-icon-box" style={{ background: `${course.color}12` }}>
                          <img src={course.imageUrl} alt={course.title} />
                        </div>
                        <div className="lrn-badge-group">
                          <span className="lrn-card-badge" style={{ background: course.color }}>
                            {course.badge}
                          </span>
                        </div>
                      </div>

                      <h3 className="lrn-card-h3">{course.title}</h3>
                      <p className="lrn-card-desc">{course.description}</p>

                      <div className="lrn-card-meta">
                        <span><FaClock /> {course.duration}</span>
                        <span><FaSignal /> {course.level}</span>
                      </div>

                      <div className="lrn-card-footer-row">
                        <div className="lrn-card-rating">
                          <FaStar /> <span>{course.rating}</span>
                        </div>
                        <button className="lrn-enroll-btn" style={{ color: course.color }}>
                          Initialize Secure Learning <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FOOTER ── */}
          <section className="lrn-cta-section">
            <div className="lrn-container">
              <div className="lrn-cta-inner">
                <h2>Need Mentor Support?</h2>
                <p>Connect with our engineering mentors directly for doubt clearance and career guidance.</p>
                <a href="https://wa.me/919159247730" className="lrn-wa-btn">
                  <FaWhatsapp /> Chat with Mentor
                </a>
              </div>
            </div>
          </section>

        </div>
      ) : (
        <div className="lrn-dashboard animate-fade-in">

          {/* ── SIDEBAR NAVIGATION ── */}
          <aside className="lrn-db-sidebar">
            <div className="lrn-db-sidebar-header">
              {isCompleted ? (
                <button className="lrn-db-back-btn" onClick={handleExitCourse}>
                  <FaArrowLeft /> Exit Course
                </button>
              ) : (
                <div className="lrn-db-lock-notice">
                  <FaLock /> Secure Mode Active
                </div>
              )}
              <div className="lrn-db-course-card">
                <div className="lrn-db-course-icon" style={{ background: `${selectedCourse.color}12` }}>
                  <img src={selectedCourse.imageUrl} alt="" />
                </div>
                <div className="lrn-db-course-info">
                  <h3 className="lrn-db-course-title">{selectedCourse.title}</h3>
                  <div className="lrn-db-progress-mini">
                    <div className="lrn-db-progress-bar">
                      <div
                        className="lrn-db-progress-fill"
                        style={{
                          width: `${(Object.keys(lessonProgress).length / selectedCourse.curriculum.length) * 100}%`,
                          backgroundColor: selectedCourse.color
                        }}
                      ></div>
                    </div>
                    <span>{Math.round((Object.keys(lessonProgress).length / selectedCourse.curriculum.length) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="lrn-db-nav">
              <div className="lrn-nav-label">Course Curriculum</div>
              <div className="lrn-db-lesson-list">
                {selectedCourse.curriculum.map((item, index) => (
                  <div
                    key={item.id}
                    className={`lrn-db-nav-item ${activeLesson?.id === item.id ? 'active' : ''} ${lessonProgress[item.id] ? 'completed' : ''}`}
                    onClick={() => {
                      setActiveLesson(item);
                      setActiveTab(item.type);
                      setShowExplanation(false);
                      setSelectedOption(null);
                    }}
                  >
                    <div className="lrn-db-nav-num">{index + 1}</div>
                    <div className="lrn-db-nav-content">
                      <h4>{item.title}</h4>
                      <div className="lrn-db-lesson-meta">
                        {item.type === 'chapter' ? <FaPlay /> : (item.type === 'test' ? <FaClipboardList /> : <FaCode />)}
                        <span>{item.dur}</span>
                      </div>
                    </div>
                    {lessonProgress[item.id] && <FaCheckCircle className="lrn-completed-icon" style={{ color: selectedCourse.color }} />}
                  </div>
                ))}
              </div>
            </nav>
          </aside>

          {/* ── MAIN CONTENT AREA ── */}
          <main className="lrn-db-main">
            <header className="lrn-db-topbar">
              <div className="lrn-db-breadcrumb">
                Lessons / {activeLesson?.title}
              </div>
              <div className="lrn-db-top-actions">
                <button className="lrn-share-btn" onClick={() => setShowAIBot(true)}>
                  <FaRobot /> AI Mentor
                </button>
                <button className="lrn-finish-btn" onClick={() => toggleLessonComplete(activeLesson.id)}>
                  {lessonProgress[activeLesson?.id] ? 'Completed' : 'Mark as Done'}
                </button>
              </div>
            </header>

            <div className="lrn-db-content">
              <div className="lrn-content-container">
                {isCompleted ? (
                  <div className="lrn-completion-view animate-slide-up">
                    <div className="lrn-completion-card">
                      <div className="lrn-confetti-box">🎉</div>
                      <h2 className="lrn-comp-title">Track Completed!</h2>
                      <p className="lrn-comp-desc">
                        Congratulations! You've successfully finished <strong>{selectedCourse.title}</strong>.
                        You've mastered the core concepts and passed all assessments.
                      </p>
                      <div className="lrn-comp-stats">
                        <div className="lrn-comp-stat">
                          <span>Lessons</span>
                          <strong>{selectedCourse.curriculum.length}</strong>
                        </div>
                        <div className="lrn-comp-stat">
                          <span>Assessments</span>
                          <strong>{selectedCourse.curriculum.filter(i => i.type === 'test').length}</strong>
                        </div>
                      </div>
                      <button className="lrn-comp-back-btn" onClick={() => {
                        setIsCompleted(false);
                        handleExitCourse();
                      }}>
                        Back to All Tracks
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeTab === 'chapter' && (
                      <article className="lrn-article animate-slide-up">
                        <header className="lrn-article-header">
                          <h1 className="lrn-article-h1">{activeLesson?.title}</h1>
                          <div className="lrn-article-meta">
                            <span>Published by CodingBoss Academy</span>
                            <span>•</span>
                            <span>{activeLesson?.dur} Reading Time</span>
                          </div>
                        </header>

                        <div className="lrn-article-body">
                          {activeLesson?.contentBlocks?.map((block, i) => {
                            if (block.type === 'text') {
                              if (block.value.startsWith('### Mastery Summary')) {
                                return (
                                  <div key={i} className="lrn-mastery-box">
                                    <div className="lrn-mastery-header">
                                      <FaTrophy /> <span>Mastery Summary: The Full Answer</span>
                                    </div>
                                    <p className="lrn-mastery-p">{block.value.replace('### Mastery Summary: The Full Answer', '').trim()}</p>
                                  </div>
                                );
                              }
                              return <p key={i} className="lrn-article-p">{block.value}</p>;
                            }
                            if (block.type === 'step') {
                              return (
                                <div key={i} className="lrn-article-step-card">
                                  <div className="lrn-step-badge">{block.number}</div>
                                  <div className="lrn-step-text">
                                    <h4>{block.title}</h4>
                                    <p>{block.value}</p>
                                  </div>
                                </div>
                              );
                            }
                            if (block.type === 'code') {
                              return (
                                <div key={i} className="lrn-article-code-block">
                                  <div className="lrn-code-header">
                                    <span>{block.lang}</span>
                                    <button className="lrn-copy-btn">Copy</button>
                                  </div>
                                  <pre><code>{block.value}</code></pre>
                                </div>
                              );
                            }
                            if (block.type === 'definition') {
                              return (
                                <div key={i} className="lrn-article-definition">
                                  <div className="lrn-def-header">
                                    <FaBookOpen /> <span>Technical Definition</span>
                                  </div>
                                  <div className="lrn-def-body">
                                    <strong>{block.term}:</strong> {block.value}
                                  </div>
                                </div>
                              );
                            }
                            if (block.type === 'tip') {
                              return (
                                <div key={i} className="lrn-article-inline-tip">
                                  <FaLightbulb />
                                  <p><strong>Pro Tip:</strong> {block.value}</p>
                                </div>
                              );
                            }
                            return null;
                          })}

                          {/* FALLBACK FOR OLD CONTENT FORMAT */}
                          {!activeLesson?.contentBlocks && activeLesson?.content?.split('\n\n').map((para, i) => (
                            <div key={i} className="lrn-article-para">
                              {para.startsWith('###') ? (
                                <h3 className="lrn-article-h3">{para.replace('###', '').trim()}</h3>
                              ) : (
                                <p>{para}</p>
                              )}
                            </div>
                          ))}

                          <div className="lrn-article-objectives">
                            <h4>What we covered:</h4>
                            <ul>
                              {activeLesson?.objectives?.map((obj, i) => (
                                <li key={i}><FaCheckCircle style={{ color: selectedCourse.color }} /> {obj}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <footer className="lrn-article-footer">
                          <button className="lrn-next-lesson-btn" onClick={handleNextLesson}>
                            Continue to Next Lesson <FaChevronRight />
                          </button>
                        </footer>
                      </article>
                    )}

                    {activeTab === 'test' && (
                      <div className="lrn-assessment-view animate-slide-up">
                        <div className="lrn-assessment-card">
                          <div className="lrn-assessment-header">
                            <div className="lrn-as-badge">Assessment</div>
                            <h2 className="lrn-as-title">{activeLesson?.title}</h2>
                            <p className="lrn-as-desc">Select the most appropriate answer to validate your knowledge.</p>
                          </div>

                          <div className="lrn-as-question-box">
                            <h3 className="lrn-as-q">{activeLesson?.question}</h3>
                            <div className="lrn-as-options">
                              {activeLesson?.options?.map((opt, i) => (
                                <label key={i} className={`lrn-as-option ${selectedOption === i ? 'selected' : ''}`}>
                                  <input
                                    type="radio"
                                    name="assessment"
                                    checked={selectedOption === i}
                                    onChange={() => setSelectedOption(i)}
                                  />
                                  <span className="lrn-as-opt-text">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {showExplanation && (
                            <div className={`lrn-as-feedback ${selectedOption === activeLesson.correct ? 'correct' : 'incorrect'}`}>
                              <div className="lrn-feedback-icon">
                                {selectedOption === activeLesson.correct ? <FaCheckCircle /> : <FaTimesCircle />}
                              </div>
                              <div className="lrn-feedback-text">
                                <h5>{selectedOption === activeLesson.correct ? 'Correct Answer!' : 'Incorrect Approach'}</h5>
                                <p>{activeLesson.explanation}</p>
                              </div>
                            </div>
                          )}

                          <div className="lrn-as-footer">
                            {!showExplanation ? (
                              <button
                                className="lrn-as-submit"
                                style={{ background: selectedCourse.color }}
                                onClick={() => setShowExplanation(true)}
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                className="lrn-as-submit"
                                style={{ background: '#10b981' }}
                                onClick={() => {
                                  toggleLessonComplete(activeLesson.id);
                                  setShowExplanation(false);
                                  setSelectedOption(null);
                                  handleNextLesson();
                                }}
                              >
                                Continue to Next Lesson <FaChevronRight />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'practice' && (
                      <div className="lrn-lab-view animate-slide-up">
                        <div className="lrn-lab-container">
                          <div className="lrn-lab-header">
                            <h2 className="lrn-lab-title">{activeLesson?.title}</h2>
                            <p className="lrn-lab-desc">{activeLesson?.problem}</p>
                          </div>

                          <div className="lrn-lab-grid">
                            <div className="lrn-lab-editor-mock">
                              <div className="lrn-lab-toolbar">
                                <span>Exercise Starter Code</span>
                                <button className="lrn-lab-run">Run Code</button>
                              </div>
                              <div className="lrn-lab-code">
                                <pre><code>{activeLesson?.starterCode}</code></pre>
                              </div>
                            </div>

                            <div className="lrn-lab-solution">
                              <div className="lrn-sol-header">
                                <FaLightbulb />
                                <span>Solution Roadmap</span>
                              </div>
                              <div className="lrn-sol-body">
                                {activeLesson?.solutionSteps?.map((step, i) => (
                                  <div key={i} className="lrn-sol-step">
                                    {step}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="lrn-lab-footer">
                            <button className="lrn-next-lesson-btn" onClick={() => {
                              toggleLessonComplete(activeLesson.id);
                              handleNextLesson();
                            }}>
                              Complete Lab & Continue <FaChevronRight />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
      {/* ── FLOATING AI TRIGGER ── */}
      {viewMode === 'dashboard' && !showAIBot && (
        <button
          className="cb-ai-fab animate-bounce-in"
          onClick={() => setShowAIBot(true)}
          title="Open AI Mentor"
        >
          <div className="cb-ai-fab-glow"></div>
          <FaRobot />
          <span className="cb-ai-fab-tooltip">Ask Mentor</span>
        </button>
      )}
    </div>
  );
};

export default Learn;
