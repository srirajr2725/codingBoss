import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLock, FaCheckCircle, FaStar, FaRocket,
  FaGraduationCap, FaShieldAlt, FaWhatsapp, FaInfoCircle,
  FaCode, FaClipboardList, FaArrowLeft, FaChevronRight,
  FaLightbulb, FaBookOpen, FaLayerGroup, FaQuoteLeft,
  FaClock, FaSignal, FaTrophy, FaPlay, FaChevronLeft, FaTimesCircle, FaExclamationTriangle, FaRobot, FaVolumeUp, FaVolumeMute, FaMicrophone, FaTimes, FaPaperPlane
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
import CourseAI from './CourseAI';

const humanizeKey = (key = "") =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isPlainValue = (value) =>
  value === null || ['string', 'number', 'boolean'].includes(typeof value);

const compactText = (value) => {
  if (value === null || value === undefined) return "";
  if (isPlainValue(value)) return String(value);
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => key !== 'code')
      .map(([key, val]) => {
        const text = compactText(val);
        return text ? `${humanizeKey(key)}: ${text}` : "";
      })
      .filter(Boolean)
      .join(' | ');
  }
  return "";
};

const findNestedCode = (value) => {
  if (!value) return "";
  if (typeof value === 'object' && !Array.isArray(value) && typeof value.code === 'string') return value.code;
  if (Array.isArray(value)) {
    for (const item of value) {
      const code = findNestedCode(item);
      if (code) return code;
    }
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      const code = findNestedCode(item);
      if (code) return code;
    }
  }
  return "";
};

const normalizeListItems = (items) =>
  (items || []).map((item) => {
    if (isPlainValue(item)) return { label: "", text: String(item) };
    const label = item.name || item.type || item.fullForm || item.title || "";
    const details = [
      item.explanation,
      item.description,
      item.usage,
      item.size && `Size: ${item.size}`,
      item.range && `Range: ${item.range}`,
      item.example && `Example: ${compactText(item.example)}`
    ].filter(Boolean).join(' ');
    return { label, text: details || compactText(item) };
  }).filter((item) => item.text || item.label);

const addObjectContentBlocks = (blocks, value, title = "") => {
  if (!value) return;

  if (typeof value === 'string') {
    blocks.push({ type: 'text', value, title });
    return;
  }

  if (Array.isArray(value)) {
    blocks.push({ type: 'list', title, items: normalizeListItems(value) });
    return;
  }

  Object.entries(value).forEach(([key, val]) => {
    if (key === 'code' || key === 'example') return;
    const sectionTitle = humanizeKey(key);

    if (Array.isArray(val)) {
      blocks.push({ type: 'list', title: sectionTitle, items: normalizeListItems(val) });
      return;
    }

    if (isPlainValue(val)) {
      blocks.push({ type: 'point', label: sectionTitle, value: String(val) });
      return;
    }

    const entries = Object.entries(val || {});
    const allSimple = entries.every(([, nestedValue]) => isPlainValue(nestedValue) || Array.isArray(nestedValue));

    if (allSimple) {
      blocks.push({ type: 'point', label: sectionTitle, value: compactText(val) });
      return;
    }

    blocks.push({ type: 'subtopic', title: sectionTitle });
    addObjectContentBlocks(blocks, val, sectionTitle);
  });
};

const normalizeCourse = (data, defaultImage, color, badge) => {
  if (data.course) {
    const c = data.course;
    // Map the new schema to our internal structure
    const title = c.courseTitle || c.title || "Untitled Course";
    const rawModules = c.chapters || c.modules || [];

    return {
      id: title.replace(/\s+/g, '-').toLowerCase(),
      title: title,
      description: c.description || c.subtitle || "",
      imageUrl: defaultImage,
      badge: badge,
      duration: c.courseDuration || "Flexible",
      level: c.courseLevel || "All Levels",
      students: "15k+",
      rating: "4.9",
      color: color,
      curriculum: rawModules.map((mod, i) => {
        if (!mod) return { id: "mod-" + i, title: "Empty Chapter", contentBlocks: [] };

        const modTitle = mod.chapterTitle || mod.moduleTitle || mod.title || `Chapter ${i + 1}`;
        const rawTopics = mod.topics || mod.projects || [];

        return {
          id: "mod-" + i,
          title: modTitle,
          type: "chapter",
          dur: "30m read",
          contentBlocks: rawTopics.flatMap(t => {
            if (!t) return [];
            if (typeof t === 'string') return [{ type: 'text', value: t }];

            const topicTitle = t.topicTitle || t.title || t.name || "";
            const blocks = [];
            const topicIntro = t.description || t.overview || "";

            if (topicTitle || topicIntro) {
              blocks.push({ type: 'topic', title: topicTitle, value: topicIntro });
            }

            // Handle content strings or objects
            if (t.content) {
              if (typeof t.content === 'string') {
                blocks.push({ type: 'text', value: t.content });
              } else {
                addObjectContentBlocks(blocks, t.content);
              }
            }

            // Handle features/types arrays
            [
              ['Features', t.features],
              ['Data Types', t.dataTypes],
              ['Types', t.types],
              ['Operators', t.operators],
              ['Rules', t.rules],
              ['Steps', t.steps]
            ].forEach(([listTitle, list]) => {
              if (list) blocks.push({ type: 'list', title: listTitle, items: normalizeListItems(list) });
            });

            // Handle code examples
            const exampleCode = t.example?.code || findNestedCode(t.content);
            if (exampleCode) {
              blocks.push({ type: 'code', lang: c.language?.toLowerCase() || title.toLowerCase(), value: exampleCode });
            }

            const exampleExplanation = t.example?.explanation || t.content?.example?.explanation;
            if (exampleExplanation) {
              blocks.push({ type: 'list', title: 'Code Explanation', items: normalizeListItems(
                typeof exampleExplanation === 'object'
                  ? Object.entries(exampleExplanation).map(([key, value]) => ({ name: key, explanation: compactText(value) }))
                  : [exampleExplanation]
              ) });
            }

            return blocks.length > 0 ? blocks : [{ type: 'text', value: topicTitle || JSON.stringify(t) }];
          })
        };
      })
    };
  }

  // Fallback for legacy format
  const legacy = { ...data };
  legacy.imageUrl = defaultImage;
  if (!legacy.color) legacy.color = color;
  if (!legacy.badge) legacy.badge = badge;
  if (!legacy.title) legacy.title = "Untitled";
  return legacy;
};

let courses = [];
try {
  courses = [
    normalizeCourse(javaData, JavaLogo, "#f89820", "Comprehensive"),
    normalizeCourse(pythonData, PythonLogo, "#eab308", "AI/Backend Track"),
    normalizeCourse(cData, CLogo, "#5c6bc0", "Hardware Track")
  ].filter(Boolean);
} catch (err) {
  console.error("Failed to normalize courses", err);
}

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
      color: "#2563eb",
      metric: "42 modules",
      focus: "Structured paths"
    },
    {
      image: slider2,
      title: "AI-Powered Personal Mentor",
      subtitle: "Real-time code review and interactive problem solving.",
      badge: "AI INTEGRATED",
      color: "#7c3aed",
      metric: "24/7 mentor",
      focus: "Guided practice"
    },
    {
      image: slider3,
      title: "Build Production-Ready Portfolios",
      subtitle: "Complete real-world projects and get industry certified.",
      badge: "JOB READY",
      color: "#059669",
      metric: "18 projects",
      focus: "Career proof"
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

  const [showAIBot, setShowAIBot] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { type: 'ai', text: "Hello! I am your AI Course Mentor. Ask me any doubts about this lesson and I will explain properly!" }
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, showAIBot]);
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [isTaskIDE, setIsTaskIDE] = useState(false);
  const [taskEvaluation, setTaskEvaluation] = useState(null);



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

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();

      // Look for Tamil voice
      const tamilVoice = voices.find(v =>
        v.lang === 'ta-IN' ||
        v.name.toLowerCase().includes('tamil') ||
        v.lang.toLowerCase().includes('ta')
      );

      if (tamilVoice) {
        utterance.voice = tamilVoice;
        utterance.lang = 'ta-IN';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      utteranceRef.current = utterance;
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const filteredCourses = (courses || []).filter(course =>
    course &&
    course.title &&
    typeof course.title === 'string' &&
    course.title.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

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

  const handleAISubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const userQ = aiQuery;
    setAiMessages(prev => [...prev, { type: 'user', text: userQ }]);
    setAiQuery("");
    setIsBotThinking(true);

    setTimeout(() => {
      let aiExplanation = "எனக்கு புரிகிறது. உங்கள் கேள்வியை ஆராய்கிறேன்.";
      let aiCode = "";

      const lowerQuery = userQ.toLowerCase();
      let matchedBlock = null;

      // Check current lesson for context
      if (activeLesson && activeLesson.contentBlocks) {
        matchedBlock = activeLesson.contentBlocks.find(block =>
          (block.term && block.term.toLowerCase().includes(lowerQuery)) ||
          (block.value && block.value.toLowerCase().includes(lowerQuery)) ||
          (block.title && block.title.toLowerCase().includes(lowerQuery))
        );
      }

      if (matchedBlock) {
        if (matchedBlock.type === 'definition') {
          aiExplanation = `இந்த பாடத்தில் ${matchedBlock.term} என்பது மிகவும் முக்கியமானது. ${matchedBlock.value} இதை நன்றாக புரிந்து கொள்ளுங்கள்.`;
        } else if (matchedBlock.type === 'step') {
          aiExplanation = `${matchedBlock.title} க்கான படிமுறை: ${matchedBlock.value}`;
        } else if (matchedBlock.type === 'code') {
          aiExplanation = `இதோ அதற்கான கோட் (Code). இதை கவனித்து பாருங்கள்!`;
          aiCode = matchedBlock.value;
        } else {
          aiExplanation = matchedBlock.value;
        }
      } else if (activeLesson && activeLesson.type === 'test') {
        aiExplanation = `நீங்கள் இப்போது "${activeLesson.question}" என்ற கேள்வியில் உள்ளீர்கள். முந்தைய பாடங்களை நினைத்து பாருங்கள்!`;
      } else {
        // Generic fallback with extensive Tamil logic
        if (selectedCourse?.title.toLowerCase().includes('java')) {
          if (lowerQuery.includes('jvm') || lowerQuery.includes('virtual machine')) {
            aiExplanation = "JVM (Java Virtual Machine) என்பது ஜாவா புரோகிராம்களை இயக்க உதவும் ஒரு இன்ஜின். நீங்கள் எழுதும் ஜாவா கோட் Bytecode ஆக மாறும், அதை JVM தான் கணிப்பொறிக்கு புரியும் Machine Code ஆக மாற்றும்.";
          } else if (lowerQuery.includes('oop') || lowerQuery.includes('object')) {
            aiExplanation = "OOPs (Object Oriented Programming) என்பது நிஜ உலக பொருட்களை (Objects) அடிப்படையாக வைத்து புரோகிராம் எழுதும் முறை. Class என்பது அச்சு (Blueprint), Object என்பது அதிலிருந்து உருவாகும் நிஜ பொருள்.";
          } else if (lowerQuery.includes('inheritance')) {
            aiExplanation = "Inheritance என்பது ஒரு Class-இன் பண்புகளை மற்றொரு Class பெற்றுக்கொள்வது. இது கோட் மறுபயன்பாட்டை (Code Reusability) அதிகரிக்கிறது.";
          } else if (lowerQuery.includes('array')) {
            aiExplanation = "Array என்பது ஒரே வகையான பல டேட்டாக்களை (Data) ஒரே பெயரில் சேமித்து வைக்க உதவும் ஒரு கட்டமைப்பு. இதில் உள்ள ஒவ்வொரு மதிப்பையும் Index மூலம் அணுகலாம்.";
          } else {
            aiExplanation = "ஜாவா (Java) மிகவும் வலிமையான மொழி. நீங்கள் கேட்கும் கேள்வி '" + userQ + "' பற்றி இன்னும் ஆழமாக படிக்க உங்கள் பாடத்திட்டத்தை (Curriculum) கவனமாக படிக்கவும்!";
          }
        } else if (selectedCourse?.title.toLowerCase().includes('python')) {
          if (lowerQuery.includes('list') || lowerQuery.includes('array')) {
            aiExplanation = "பைத்தானில் List என்பது பல மதிப்புகளை ஒரே மாறிக்குள் (Variable) சேமிக்க பயன்படும் ஒரு Data Structure. இது மாற்றக்கூடியது (Mutable).";
          } else if (lowerQuery.includes('dictionary') || lowerQuery.includes('dict')) {
            aiExplanation = "Dictionary என்பது Key-Value ஜோடியாக டேட்டாவை சேமிக்கும் முறை. உதாரணத்திற்கு 'name': 'Arun' என்று சேமித்து வைக்கலாம்.";
          } else if (lowerQuery.includes('function') || lowerQuery.includes('def')) {
            aiExplanation = "Function என்பது ஒரு குறிப்பிட்ட வேலையை செய்ய எழுதப்படும் ஒரு கோட் பிளாக் (Block of Code). பைத்தானில் இதை 'def' என்ற keyword மூலம் உருவாக்கலாம்.";
          } else {
            aiExplanation = "பைத்தான் (Python) மிகவும் எளிமையான மொழி. உங்கள் கேள்வி '" + userQ + "' அருமையானது. தொடர்ந்து பயிற்சி செய்யுங்கள்!";
          }
        } else if (selectedCourse?.title.toLowerCase().includes('c ')) { // C programming
          if (lowerQuery.includes('pointer')) {
            aiExplanation = "பாயிண்டர் (Pointer) என்பது C மொழியில் உள்ள ஒரு சிறப்பு Variable. இது மற்றொரு Variable-இன் மெமரி முகவரியை (Memory Address) சேமிக்க பயன்படுகிறது. இது மிகவும் வேகமானது!";
            aiCode = "int x = 10;\nint *ptr = &x;";
          } else if (lowerQuery.includes('malloc') || lowerQuery.includes('memory')) {
            aiExplanation = "Dynamic Memory Allocation-க்கு malloc() பயன்படுகிறது. இது Heap Memory-ல் உங்களுக்கு தேவையான இடத்தை ஒதுக்கி தரும். பயன்படுத்திய பின் free() செய்ய மறக்காதீர்கள்!";
          } else if (lowerQuery.includes('struct')) {
            aiExplanation = "Structure (struct) என்பது பல வகையான Data type-களை ஒன்றாக இணைத்து ஒரே பெயரில் பயன்படுத்த உதவும் ஒரு வசதி.";
          } else {
            aiExplanation = "C மொழி அனைத்து மொழிகளுக்கும் தாய் (Mother of all languages). மெமரி (Memory) எப்படி வேலை செய்கிறது என்று புரிந்து கொண்டால் இது மிக எளிது!";
          }
        } else {
          aiExplanation = "உங்கள் கேள்வி எனக்கு புரிகிறது. இதை பற்றி மேலும் அறிய உங்கள் பாடத்திட்டத்தின் தற்போதைய பகுதியை கவனமாக படிக்கவும்.";
        }
      }

      const newMsg = { type: 'ai', text: aiExplanation, code: aiCode };
      setAiMessages(prev => [...prev, newMsg]);
      speakResponse(aiExplanation);
      setIsBotThinking(false);
    }, 1500);
  }, [aiQuery, activeLesson, selectedCourse]);

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

      {viewMode === 'listing' ? (
        <div className="lrn-root">
          {/* ── TOP AUTO SLIDER ── */}
          <div className="lrn-top-slider">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="lrn-slide"
                style={{ '--slide-color': slides[currentSlide].color }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="lrn-slide-content">
                  <span className="lrn-slide-badge">
                    <FaRocket />
                    {slides[currentSlide].badge}
                  </span>
                  <h1 className="lrn-slide-title">{slides[currentSlide].title}</h1>
                  <p className="lrn-slide-sub">{slides[currentSlide].subtitle}</p>
                  <div className="lrn-slide-meta">
                    <span><FaBookOpen /> {slides[currentSlide].metric}</span>
                    <span><FaSignal /> {slides[currentSlide].focus}</span>
                  </div>
                  <button
                    className="lrn-slide-btn"
                    onClick={() => document.querySelector('.lrn-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Explore Tracks <FaChevronRight />
                  </button>
                </div>

                <div className="lrn-slide-image">
                  <img src={slides[currentSlide].image} alt="" />
                  <div className="lrn-slide-image-label">
                    <FaPlay />
                    Learning Preview
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button
              className="lrn-slider-arrow lrn-slider-prev"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>
            <button
              className="lrn-slider-arrow lrn-slider-next"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>
            <div className="lrn-slider-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`lrn-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
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
        <div className="lrn-dashboard ultra-modern">
          {/* TOP BAR AS SEEN IN IMAGE */}
          <header className="lrn-db-header">
            <div className="lrn-db-header-left">
              <div className="lrn-db-logo">
                <FaCode />
                <span>Coding<strong>Boss</strong></span>
              </div>
            </div>
            <div className="lrn-db-header-right">
              <div className="lrn-db-user-pill">
                <span className="user-email">sri2@gmail.com</span>
                <div className="user-progress">
                  <span>0%</span>
                  <FaChevronRight />
                </div>
              </div>
            </div>
          </header>

          <div className="lrn-db-layout">
            <aside className="lrn-db-sidebar">
              <nav className="lrn-db-nav">
                {selectedCourse?.curriculum.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`lrn-db-nav-item ${activeLesson?.id === item.id ? 'active' : ''}`}
                    onClick={() => setActiveLesson(item)}
                  >
                    <span className="nav-number">{idx + 1}.</span>
                    <span className="nav-title">{item.title}</span>
                    {lessonProgress[item.id] && <FaCheckCircle className="nav-check" />}
                  </div>
                ))}
              </nav>
            </aside>

            <main className="lrn-db-main">
              <div className="lrn-db-viewport">
                <div className="lrn-content-container">
                  <div className="lrn-article-header">
                    <h1 className="lrn-article-title">{activeLesson?.title}</h1>
                    <div className="lrn-article-meta">
                      <span><FaClock /> 30m read</span>
                      <span><FaLayerGroup /> Chapter</span>
                    </div>
                  </div>

                  <div className="lrn-article-body chatgpt-style" style={{ '--course-color': selectedCourse?.color || '#2563eb' }}>
                    {activeLesson?.type === 'chapter' && activeLesson.contentBlocks && activeLesson.contentBlocks.map((block, idx) => (
                      <div key={idx} className={`lrn-block block-${block.type}`}>
                        {block.type === 'topic' && (
                          <section className="lrn-topic-card">
                            <div className="lrn-topic-icon"><FaRobot /></div>
                            <div>
                              <h2>{block.title}</h2>
                              {block.value && <p>{block.value}</p>}
                            </div>
                          </section>
                        )}

                        {block.type === 'subtopic' && <h3 className="lrn-subtopic-title">{block.title}</h3>}

                        {block.type === 'text' && (
                          <p className="lrn-ai-paragraph">{block.value}</p>
                        )}

                        {block.type === 'point' && (
                          <div className="lrn-ai-point">
                            <span>{block.label}</span>
                            <p>{block.value}</p>
                          </div>
                        )}

                        {block.type === 'list' && (
                          <div className="lrn-ai-list">
                            {block.title && <h3>{block.title}</h3>}
                            <ul>
                              {block.items?.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  {item.label && <strong>{item.label}</strong>}
                                  <span>{item.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'code' && (
                          <div className="lrn-code-wrapper">
                            <div className="lrn-code-title"><FaCode /> Example</div>
                            <pre><code>{block.value}</code></pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
      <CourseAI activeLesson={activeLesson} courseData={selectedCourse} />
    </div>
  );
};

export default Learn;
