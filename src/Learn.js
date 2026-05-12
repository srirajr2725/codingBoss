import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLock, FaCheckCircle, FaStar, FaRocket,
  FaGraduationCap, FaShieldAlt, FaWhatsapp, FaInfoCircle,
  FaCode, FaClipboardList, FaArrowLeft, FaChevronRight,
  FaLightbulb, FaBookOpen, FaLayerGroup, FaQuoteLeft,
  FaClock, FaSignal, FaTrophy, FaPlay, FaChevronLeft, FaTimesCircle, FaExclamationTriangle, FaRobot, FaVolumeUp, FaVolumeMute, FaMicrophone, FaTimes, FaPaperPlane, FaTerminal
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Learn.css';

import javaData from './data/java.json';
import cData from './data/c.json';
import pythonData from './data/python.json';
import JavaLogo from './images/ultra_java_banner.png';
import PythonLogo from './images/ultra_python_banner.png';
import CLogo from './images/ultra_c_banner.png';

// Slider Assets
import slider1 from './images/slider1.png';
import slider2 from './images/slider2.png';
import slider3 from './images/slider3.png';
import CourseAI from './CourseAI';
import Editor from '@monaco-editor/react';

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
              blocks.push({
                type: 'list', title: 'Code Explanation', items: normalizeListItems(
                  typeof exampleExplanation === 'object'
                    ? Object.entries(exampleExplanation).map(([key, value]) => ({ name: key, explanation: compactText(value) }))
                    : [exampleExplanation]
                )
              });
            }

            return blocks.length > 0 ? blocks : [{ type: 'text', value: topicTitle || JSON.stringify(t) }];
          })
        };
      })
    };
  }

  // Handle API format (simplified or new C format)
  if (data.name && data.topics) {
    const title = data.name;
    return {
      id: data.slug || String(data.id),
      title: title,
      description: data.short_description || data.description || "",
      imageUrl: defaultImage,
      badge: badge || data.level || "Expert Track",
      duration: data.duration || "12 weeks",
      level: data.level || "Beginner to Expert",
      students: "15k+",
      rating: "4.9",
      color: color || "#5c6bc0",
      outcomes: data.outcomes || [],
      curriculum: (data.topics || []).map((topicStr, i) => {
        // Split by first newline if exists to separate title and desc
        const parts = topicStr.split('\n');
        const mTitle = parts[0] || `Module ${i + 1}`;
        const mDesc = parts.slice(1).join('\n').trim();

        return {
          id: `topic-${i}`,
          title: mTitle,
          type: "chapter",
          dur: "45m read",
          contentBlocks: [
            { type: 'topic', title: mTitle, value: mDesc || `Explore the core principles of ${mTitle} in this comprehensive session.` },
            { type: 'text', value: mDesc ? "This module covers deep technical concepts and practical implementations." : data.description }
          ]
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

let staticCourses = [];
try {
  staticCourses = [
    normalizeCourse(javaData, JavaLogo, "#f89820", "Comprehensive"),
    normalizeCourse(pythonData, PythonLogo, "#eab308", "AI/Backend Track"),
    normalizeCourse(cData, CLogo, "#5c6bc0", "Hardware Track")
  ].filter(Boolean);
} catch (err) {
  console.error("Failed to normalize static courses", err);
}

const Learn = ({ isLoggedIn, username: usernameProp = '', userRole = '', handleLogout }) => {
  // Resolve username from prop or localStorage fallback
  const username = usernameProp || localStorage.getItem('username') || 'Student';

  const [courses, setCourses] = useState(staticCourses);
  const [isLoading, setIsLoading] = useState(true);
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

  // ── PRACTICE LAB STATES ──
  const [showLab, setShowLab] = useState(false);
  const [labCode, setLabCode] = useState("");
  const [labOutput, setLabOutput] = useState("");
  const [isLabCompiling, setIsLabCompiling] = useState(false);
  const [labLang, setLabLang] = useState("java");
  const [labStdin, setLabStdin] = useState("");

  // ── GLOBAL AI LOCKDOWN ──
  useEffect(() => {
    document.body.classList.add('hide-global-ai');
    return () => document.body.classList.remove('hide-global-ai');
  }, []);

  // ── INLINE RUN STATES ──
  const [inlineOutputs, setInlineOutputs] = useState({});
  const [isInlineCompiling, setIsInlineCompiling] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/course-details/', {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          const apiCourses = data.map(item => {
            let logo = JavaLogo;
            let color = "#3b82f6";
            if (item.slug === 'java') { logo = JavaLogo; color = "#f89820"; }
            if (item.slug === 'python') { logo = PythonLogo; color = "#eab308"; }
            if (item.slug === 'c') { logo = CLogo; color = "#5c6bc0"; }

            return normalizeCourse(item, logo, color, item.level);
          });

          setCourses(apiCourses.length > 0 ? apiCourses : staticCourses);
        }
      } catch (err) {
        console.error("Failed to fetch courses from API", err);
        setCourses(staticCourses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

  const filteredCourses = (courses || []).filter(course =>
    course &&
    course.title &&
    typeof course.title === 'string' &&
    course.title.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  const startSecureLearning = async (course) => {
    try {
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      setSelectedCourse(course);
      setActiveLesson(course.curriculum[0]);
      setViewMode('dashboard');
      setIsProctored(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { toast.error("❌ Fullscreen required!"); }
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



          <section className="lrn-section">
            <div className="lrn-container">
              <motion.div
                className="lrn-section-header"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div>
                  <p className="lrn-section-eyebrow">Engineering Tracks</p>
                  <h2 className="lrn-section-title">Professional Curriculum</h2>
                </div>
                <div className="lrn-search-box">
                  <FaCode />
                  <input
                    type="text"
                    placeholder="Search tracks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </motion.div>

              <div className="lrn-card-grid">
                {isLoading ? (
                  // Skeleton Loaders
                  [1, 2, 3].map(i => (
                    <div key={i} className="lrn-course-card skeleton">
                      <div className="lrn-card-body-inner" style={{ height: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="skeleton-box" style={{ height: '60px', width: '60px', borderRadius: '12px', background: '#e2e8f0' }}></div>
                        <div className="skeleton-box" style={{ height: '30px', width: '70%', background: '#e2e8f0' }}></div>
                        <div className="skeleton-box" style={{ height: '20px', width: '100%', background: '#e2e8f0' }}></div>
                        <div className="skeleton-box" style={{ height: '20px', width: '90%', background: '#e2e8f0' }}></div>
                      </div>
                    </div>
                  ))
                ) : filteredCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    className={`lrn-course-card ultra-card card-${course.id}`}
                    onClick={() => startSecureLearning(course)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="lrn-card-image-wrapper">
                      <img src={course.id === 'java' ? JavaLogo : course.id === 'python' ? PythonLogo : CLogo} alt={course.title} className="lrn-card-banner" />
                      <div className="lrn-card-overlay">
                         <div className="lrn-card-badge">PREMIUM</div>
                      </div>
                    </div>
                    <div className="lrn-card-content">
                      <div className="lrn-card-meta">
                        <span className="lrn-card-level">Beginner to Expert</span>
                        <div className="lrn-card-rating"><FaStar /> 4.9</div>
                      </div>
                      <h3 className="lrn-card-title">{course.title}</h3>
                      <p className="lrn-card-desc">{course.description}</p>
                      <div className="lrn-card-footer">
                        <span className="lrn-card-modules"><FaLayerGroup /> {course.modules?.length || 0} Modules</span>
                        <button className="lrn-card-btn">
                          Start Mastery <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="w3-learn-page">
          {/* ── ULTRA STUDIO TOP NAV ── */}
          <nav className="w3-topnav">
            <div className="w3-topnav-logo">
              <FaCode /> CodingBoss
            </div>
            <span className="w3-topnav-course-name">
              {selectedCourse?.title} Programming Studio
            </span>
            <div className="w3-topnav-actions">
              <button
                className="w3-nav-btn lab-btn"
                onClick={() => {
                  setLabLang(selectedCourse?.id === 'c' ? 'c' : selectedCourse?.id === 'python' ? 'python' : 'java');
                  setShowLab(true);
                }}
              >
                <FaPlay /> RUN CODE
              </button>
              <button className="w3-nav-btn exit-btn" onClick={handleExitCourse}>
                <FaArrowLeft /> Exit
              </button>
            </div>
          </nav>

          {/* ── PROGRESS BAR ── */}
          {(() => {
            const total = selectedCourse?.curriculum?.length || 1;
            const done = Object.values(lessonProgress).filter(Boolean).length;
            const pct = Math.round((done / total) * 100);
            return (
              <div className="w3-progress-bar-track">
                <div className="w3-progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            );
          })()}

          <div className="w3-body-layout">
            <aside className="w3-sidebar">
              <div className="w3-sidebar-header">
                <FaBookOpen />
                {selectedCourse?.id === 'c' ? 'C Programming' : selectedCourse?.title}
              </div>
              <nav className="w3-sidebar-nav">
                <button
                  className="w3-sidebar-run-btn"
                  onClick={() => {
                    setLabLang(selectedCourse?.id === 'c' ? 'c' : selectedCourse?.id === 'python' ? 'python' : 'java');
                    setShowLab(true);
                  }}
                >
                  <FaPlay /> RUN COMPILER
                </button>
                {selectedCourse?.curriculum.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`w3-sidebar-item ${activeLesson?.id === item.id ? 'active' : ''}`}
                    onClick={() => setActiveLesson(item)}
                  >
                    <span className="w3-sidebar-num">{idx + 1}.</span>
                    <span>{item.title}</span>
                    {lessonProgress[item.id] && (
                      <FaCheckCircle className="w3-sidebar-check" />
                    )}
                  </div>
                ))}
              </nav>

              {/* ── PROGRESS FOOTER ── */}
              {(() => {
                const total = selectedCourse?.curriculum?.length || 1;
                const done = Object.values(lessonProgress).filter(Boolean).length;
                const pct = Math.round((done / total) * 100);
                return (
                  <div className="w3-sidebar-progress">
                    <div className="w3-sidebar-progress-label">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w3-sidebar-progress-track">
                      <div className="w3-sidebar-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
            </aside>


            {/* ── MAIN CONTENT ── */}
            <main className="w3-main-content">
              {activeLesson && (
                <>
                  {/* Breadcrumb */}
                  <div className="w3-page-breadcrumb">
                    <button
                      style={{ background: 'none', border: 'none', color: '#04AA6D', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                      onClick={handleExitCourse}
                    >
                      Home
                    </button>
                    <FaChevronRight style={{ fontSize: '0.65rem', color: '#999' }} />
                    <span style={{ color: '#04AA6D', fontWeight: 600 }}>{selectedCourse?.title}</span>
                    <FaChevronRight style={{ fontSize: '0.65rem', color: '#999' }} />
                    <span>{activeLesson.title}</span>
                  </div>

                  <h1 className="w3-page-title">{activeLesson.title}</h1>
                  <hr className="w3-hr" />

                  {/* Course Overview / Outcomes if it's the first lesson */}
                  {activeLesson.id === selectedCourse?.curriculum[0]?.id && selectedCourse?.outcomes?.length > 0 && (
                    <div className="w3-outcomes-box" style={{ background: '#ecfdf5', border: '2px solid #bbf7d0', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
                      <h3 style={{ color: '#064e3b', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                        <FaTrophy /> What you will learn
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {selectedCourse.outcomes.map((outcome, i) => (
                          <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1.05rem', color: '#065f46', fontWeight: 500 }}>
                            <FaCheckCircle style={{ color: '#10b981', marginTop: '4px', flexShrink: 0 }} />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content Blocks */}
                  {activeLesson.contentBlocks?.map((block, idx) => (
                    <div key={idx}>
                      {block.type === 'topic' && (
                        <>
                          <h2 className="w3-content-h2">{block.title}</h2>
                          {block.value && <p className="w3-content-p">{block.value}</p>}
                        </>
                      )}

                      {block.type === 'text' && (
                        <p className="w3-content-p">{block.value}</p>
                      )}

                      {block.type === 'subtopic' && (
                        <h3 className="w3-content-h3">{block.title}</h3>
                      )}

                      {block.type === 'list' && (
                        <>
                          {block.title && <h3 className="w3-content-h3">{block.title}</h3>}
                          <ul className="w3-content-list">
                            {block.items?.map((item, i) => (
                              <li key={i}>
                                {item.label && <strong>{item.label}: </strong>}
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {block.type === 'code' && (
                        <div className="w3-example-box">
                          <div className="w3-example-label">Example</div>
                          <div className="w3-example-code">
                            <pre>{block.value}</pre>
                          </div>
                          <div className="w3-example-actions">
                            <button
                              className={`w3-run-btn ${isInlineCompiling[idx] ? 'loading' : ''}`}
                              onClick={async () => {
                                const blockId = idx;
                                setIsInlineCompiling(prev => ({ ...prev, [blockId]: true }));
                                try {
                                  const response = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/practice-run/', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'ngrok-skip-browser-warning': 'true'
                                    },
                                    body: JSON.stringify({
                                      source_code: block.value,
                                      language: selectedCourse?.id === 'c' ? 'c' : selectedCourse?.id === 'python' ? 'python' : 'java',
                                      stdin: ""
                                    })
                                  });
                                  const data = await response.json();
                                  setInlineOutputs(prev => ({ ...prev, [blockId]: data.stdout || data.stderr || "No output." }));
                                } catch (err) {
                                  setInlineOutputs(prev => ({ ...prev, [blockId]: "❌ Run failed." }));
                                } finally {
                                  setIsInlineCompiling(prev => ({ ...prev, [blockId]: false }));
                                }
                              }}
                            >
                              {isInlineCompiling[idx] ? <div className="spinner" /> : <FaPlay />} Run Code
                            </button>
                            <button
                              className="w3-try-btn"
                              onClick={() => {
                                setLabCode(block.value);
                                setLabLang(selectedCourse?.id === 'c' ? 'c' : selectedCourse?.id === 'python' ? 'python' : 'java');
                                setShowLab(true);
                              }}
                            >
                              <FaLayerGroup style={{ fontSize: '0.7rem' }} /> Open in Lab »
                            </button>
                          </div>
                          {inlineOutputs[idx] && (
                            <div className="w3-inline-output">
                              <div className="w3-output-header">Result:</div>
                              <pre>{inlineOutputs[idx]}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === 'point' && (
                        <div className="w3-note-box">
                          <strong>{block.label}: </strong>{block.value}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* ── BOTTOM NAVIGATION ── */}
                  {(() => {
                    const curr = selectedCourse?.curriculum || [];
                    const currIdx = curr.findIndex(l => l.id === activeLesson.id);
                    const prevLesson = currIdx > 0 ? curr[currIdx - 1] : null;
                    const nextLesson = currIdx < curr.length - 1 ? curr[currIdx + 1] : null;
                    return (
                      <div className="w3-bottom-nav">
                        <button
                          className="w3-bottom-btn"
                          disabled={!prevLesson}
                          onClick={() => prevLesson && setActiveLesson(prevLesson)}
                        >
                          <FaChevronLeft /> Previous
                        </button>

                        <button
                          className="w3-bottom-btn"
                          style={{ background: 'var(--ultra-primary)', color: '#fff' }}
                          onClick={() => {
                            toggleLessonComplete(activeLesson.id);
                            if (nextLesson) {
                              setActiveLesson(nextLesson);
                            } else {
                              toast.success("🎉 Course Completed!");
                              handleExitCourse();
                            }
                          }}
                        >
                          {lessonProgress[activeLesson.id] ? 'Next Lesson' : 'Complete & Next'} <FaChevronRight />
                        </button>
                      </div>
                    );
                  })()}
                </>
              )}
            </main>
          </div>
        </div>
      )}
      {isLoggedIn && userRole === 'member' && <CourseAI activeLesson={activeLesson} courseData={selectedCourse} />}

      {/* ── PRACTICE LAB OVERLAY (using Portal for true full-screen) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showLab && (
            <motion.div
              className="lrn-lab-overlay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="lrn-lab-header">
                <div className="lrn-lab-title">
                  <FaCode /> <span>PRACTICE LAB</span>
                  <span className="lrn-lab-subtitle">Experiment with your logic</span>
                </div>
                <div className="lrn-lab-actions">
                  <button
                    className={`lrn-lab-run ${isLabCompiling ? 'loading' : ''}`}
                    onClick={async () => {
                      if (!labCode.trim()) return toast.warning("Enter some code!");
                      setIsLabCompiling(true);
                      setLabOutput("Compiling and executing...");
                      try {
                        const response = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/practice-run/', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'ngrok-skip-browser-warning': 'true'
                          },
                          body: JSON.stringify({
                            source_code: labCode,
                            language: labLang,
                            stdin: labStdin
                          })
                        });
                        const data = await response.json();
                        setLabOutput(data.stdout || data.stderr || "No output returned.");
                      } catch (err) {
                        setLabOutput("❌ Execution failed. Please check your connection.");
                      } finally {
                        setIsLabCompiling(false);
                      }
                    }}
                  >
                    {isLabCompiling ? <div className="spinner" /> : <FaPlay />} RUN CODE
                  </button>
                  <select
                    className="lrn-lab-select"
                    value={labLang}
                    onChange={(e) => setLabLang(e.target.value)}
                  >
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                  </select>
                  <button className="lrn-lab-close" onClick={() => setShowLab(false)}>
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="lrn-lab-body">
                <div className="lrn-lab-editor">
                  <Editor
                    height="100%"
                    language={labLang === 'c' || labLang === 'cpp' ? 'cpp' : labLang}
                    value={labCode}
                    theme="light"
                    onChange={(val) => setLabCode(val)}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                      lineNumbers: 'on',
                      roundedSelection: true,
                      padding: { top: 20 }
                    }}
                  />
                </div>
                <div className="lrn-lab-console">
                  <div className="lrn-console-header">
                    <span><FaTerminal /> CONSOLE</span>
                    <div className="lrn-console-actions">
                      <button
                        className={`lrn-console-run ${isLabCompiling ? 'loading' : ''}`}
                        onClick={() => document.querySelector('.lrn-lab-run')?.click()}
                      >
                        {isLabCompiling ? <div className="spinner" /> : <FaPlay />} Run
                      </button>
                      <button onClick={() => setLabOutput("")}>Clear</button>
                    </div>
                  </div>

                  <div className="lrn-lab-input-section">
                    <div className="lrn-input-header">STANDARD INPUT (STDIN)</div>
                    <textarea
                      placeholder="Enter program input here... (Ctrl+Enter to Run)"
                      value={labStdin}
                      onChange={(e) => setLabStdin(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          document.querySelector('.lrn-lab-run')?.click();
                        }
                      }}
                    />
                  </div>

                  <div className="lrn-console-body">
                    <pre>{labOutput || "Output will appear here..."}</pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Learn;
