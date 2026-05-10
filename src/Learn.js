import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
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

import javaData from './data/java.json';
import cData from './data/c.json';
import pythonData from './data/python.json';
import JavaLogo from './images/Java.png';
import PythonLogo from './images/python.png';
import CLogo from './images/c_program.png';

// Slider Assets
import slider1 from './images/slider1.png';
import slider2 from './images/slider2.png';
import slider3 from './images/slider3.png';

javaData.imageUrl = JavaLogo;
pythonData.imageUrl = PythonLogo;
cData.imageUrl = CLogo;

const courses = [javaData, pythonData, cData];

const Learn = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('chapter');
  const [lessonProgress, setLessonProgress] = useState({});
  const [viewMode, setViewMode] = useState('listing'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // SLIDER STATES
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: slider1,
      title: "Master Modern Software Engineering",
      subtitle: "Learn industrial-grade patterns used by tech giants.",
      badge: "PLATINUM CONTENT",
      color: "#6366f1"
    },
    {
      image: slider2,
      title: "AI-Powered Personal Mentor",
      subtitle: "Real-time code review and interactive problem solving.",
      badge: "AI INTEGRATED",
      color: "#f59e0b"
    },
    {
      image: slider3,
      title: "Build Production-Ready Portfolios",
      subtitle: "Complete real-world projects and get industry certified.",
      badge: "JOB READY",
      color: "#10b981"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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

  useEffect(() => {
    if (aiResponse && aiResponse.code) {
      setDisplayedCode("");
      let i = 0;
      const code = aiResponse.code;
      const interval = setInterval(() => {
        if (i < code.length) {
          setDisplayedCode((prev) => prev + code[i]);
          i++;
        } else { clearInterval(interval); }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [aiResponse]);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Voice recognition is not supported."); return; }
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => { setIsListening(true); toast.info("Listening..."); };
    recognition.onresult = (event) => { setAiQuery(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); toast.error("Could not hear clearly."); };
    recognition.start();
  };

  const utteranceRef = useRef(null);

  const speakResponse = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = 0.8;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) utteranceRef.current.voice = voices.find(v => v.name.includes('Google US English')) || voices[0];
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utteranceRef.current);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const filteredCourses = courses.filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const saved = localStorage.getItem('cb_learn_progress');
    if (saved) setLessonProgress(JSON.parse(saved));
  }, []);

  const startSecureLearning = async (course) => {
    try {
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      setSelectedCourse(course);
      setActiveLesson(course.curriculum[0]);
      setViewMode('dashboard');
      setIsProctored(true);
      setShowAIBot(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { toast.error("❌ Fullscreen required!"); }
  };

  const handleAISubmit = useCallback(() => {
    if (!aiQuery.trim()) return;
    setAiResponse(null);
    setIsBotThinking(true);
    setTimeout(() => {
      const matchedLesson = selectedCourse?.curriculum.find(l => l.title.toLowerCase().includes(aiQuery.toLowerCase()));
      if (matchedLesson) {
        const resp = { title: matchedLesson.title, explanation: matchedLesson.title + " is a vital concept in software development.", code: "// Sample code for " + matchedLesson.title, codeLang: "java", codeExplanation: "Professional code structure.", studentTask: "Extend this logic.", lessonId: matchedLesson.id };
        setAiResponse(resp);
        speakResponse(resp.explanation);
      } else {
        const resp = { title: "AI Insight", explanation: "I've analyzed your query about " + aiQuery + ". Here's a professional implementation.", code: "// General implementation", codeLang: "javascript", codeExplanation: "Master this pattern.", studentTask: "Try building a similar module." };
        setAiResponse(resp);
        speakResponse(resp.explanation);
      }
      setIsBotThinking(false);
    }, 1000);
  }, [aiQuery, selectedCourse]);

  const handleExitCourse = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    setIsProctored(false);
    setSelectedCourse(null);
    setViewMode('listing');
  }, []);

  const toggleLessonComplete = (lessonId) => {
    const updated = { ...lessonProgress, [lessonId]: !lessonProgress[lessonId] };
    setLessonProgress(updated);
    localStorage.setItem('cb_learn_progress', JSON.stringify(updated));
  };

  return (
    <div className="lrn-master-wrapper">
      <ToastContainer theme="dark" position="top-center" />
      {showAIBot && (
        <div className="cb-ai-portal">
          <div className="cb-ai-glass-card animate-scale-up">
            <div className="cb-ai-glass-header">
              <div className="cb-ai-bot-visual"><FaRobot /></div>
              <div className="cb-ai-header-info"><h3>AI Mentor</h3></div>
              <button className="cb-ai-close-btn" onClick={() => { stopSpeaking(); setShowAIBot(false); }}><FaTimesCircle /></button>
            </div>
            <div className="cb-ai-glass-body">
              {!aiResponse ? (
                <div className="cb-ai-welcome-state">
                  <div className="cb-ai-search-wrapper">
                    <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAISubmit()} placeholder="Ask AI anything..." />
                    <button onClick={handleAISubmit}><FaPlay /></button>
                  </div>
                </div>
              ) : (
                <div className="cb-ai-result-state animate-fade-in">
                  <h4>{aiResponse.title}</h4>
                  <p>{aiResponse.explanation}</p>
                  <pre><code>{displayedCode}</code></pre>
                  <button onClick={() => setAiResponse(null)}>Ask More</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'listing' ? (
        <div className="lrn-root">
          {/* ── TOP AUTO SLIDER ── */}
          <div className="lrn-top-slider">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="lrn-slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="lrn-slide-image">
                  <img src={slides[currentSlide].image} alt="" />
                  <div className="lrn-slide-overlay" style={{ background: `linear-gradient(to right, ${slides[currentSlide].color}dd, transparent)` }}></div>
                </div>
                <div className="lrn-slide-content">
                  <span className="lrn-slide-badge" style={{ backgroundColor: slides[currentSlide].color }}>{slides[currentSlide].badge}</span>
                  <h1 className="lrn-slide-title">{slides[currentSlide].title}</h1>
                  <p className="lrn-slide-sub">{slides[currentSlide].subtitle}</p>
                  <button className="lrn-slide-btn" style={{ background: slides[currentSlide].color }}>Get Started Now <FaChevronRight /></button>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="lrn-slider-dots">
              {slides.map((_, i) => (
                <div key={i} className={`lrn-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} style={{ backgroundColor: i === currentSlide ? slides[i].color : '#e2e8f0' }}></div>
              ))}
            </div>
          </div>

          <header className="lrn-hero-ultra">
            <div className="lrn-container">
              <div className="lrn-hero-content">
                <span className="lrn-badge-premium"><span className="lrn-badge-dot"></span>Secure Learning Environment</span>
                <h1 className="lrn-hero-h1">Master <span className="lrn-gradient">Engineering</span> Skills</h1>
                <p className="lrn-hero-p">Professional grade tracks designed for deep technical mastery.</p>
              </div>
            </div>
          </header>

          <section className="lrn-section">
            <div className="lrn-container">
              <div className="lrn-section-header">
                <div><p className="lrn-section-eyebrow">Engineering Tracks</p><h2 className="lrn-section-title">Professional Curriculum</h2></div>
                <div className="lrn-search-box"><FaCode /><input type="text" placeholder="Search tracks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              </div>
              <div className="lrn-card-grid">
                {filteredCourses.map(course => (
                  <div key={course.id} className="lrn-course-card" onClick={() => startSecureLearning(course)}>
                    <div className="lrn-card-band" style={{ background: course.color }}></div>
                    <div className="lrn-card-body-inner">
                      <div className="lrn-card-icon-row">
                        <div className="lrn-card-icon-box" style={{ background: `${course.color}12` }}><img src={course.imageUrl} alt="" /></div>
                        <span className="lrn-card-badge" style={{ background: course.color }}>{course.badge}</span>
                      </div>
                      <h3 className="lrn-card-h3">{course.title}</h3>
                      <p className="lrn-card-desc">{course.description}</p>
                      <div className="lrn-card-footer-row">
                        <div className="lrn-card-rating"><FaStar /> <span>{course.rating}</span></div>
                        <button className="lrn-enroll-btn" style={{ color: course.color }}>Start Secure Learning <FaChevronRight /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="lrn-dashboard animate-fade-in">
          <aside className="lrn-db-sidebar">
            <div className="lrn-db-sidebar-header">
              <button className="lrn-db-back-btn" onClick={handleExitCourse}><FaArrowLeft /> Exit</button>
              <h3 className="lrn-db-course-title">{selectedCourse?.title}</h3>
            </div>
            <nav className="lrn-db-nav">
              {selectedCourse?.curriculum.map((item, idx) => (
                <div key={item.id} className={`lrn-db-nav-item ${activeLesson?.id === item.id ? 'active' : ''}`} onClick={() => setActiveLesson(item)}>
                  <span>{idx + 1}. {item.title}</span>
                  {lessonProgress[item.id] && <FaCheckCircle style={{ color: selectedCourse.color }} />}
                </div>
              ))}
            </nav>
          </aside>
          <main className="lrn-db-main">
            <header className="lrn-db-topbar">
              <div className="lrn-db-breadcrumb">Lessons / {activeLesson?.title}</div>
              <button onClick={() => toggleLessonComplete(activeLesson.id)}>{lessonProgress[activeLesson?.id] ? 'Completed' : 'Mark as Done'}</button>
            </header>
            <div className="lrn-db-viewport">
              <div className="lrn-content-container">
                <h2>{activeLesson?.title}</h2>
                <p>Welcome to this high-performance learning module. Focus and achieve mastery.</p>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Learn;
