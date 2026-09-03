import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaArrowLeft, FaDownload, FaGamepad, FaSearch,
  FaBook, FaBriefcase, FaRocket, FaStar, FaCode, FaCheckCircle,
  FaUserGraduate, FaTrophy, FaLaptopCode, FaChartLine, FaPlay,
  FaQuoteLeft, FaWhatsapp, FaLock, FaProjectDiagram, FaJava,
  FaPython, FaReact, FaJsSquare, FaLeaf, FaCube
} from 'react-icons/fa';
import './CourseCard.css';
import slider1 from './images/slider1.png';
import slider2 from './images/slider2.png';
import slider3 from './images/slider3.png';

import courseCImg from './images/course_c.png';
import courseJsImg from './images/course_js.png';
import courseReactImg from './images/course_react.png';
import coursePythonImg from './images/course_python.png';
import courseJavaImg from './images/course_java.png';

/* ─── Scroll-Reveal Hook ─── */
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Animated Counter ─── */
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 24);
    return () => clearInterval(timer);
  }, [visible, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function CourseCard({ setSelectedTab }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('main');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const SLIDE_INTERVAL = 4500;

  // Auto-progress timer for slider
  useEffect(() => {
    setProgress(0);
    const step = 100 / (SLIDE_INTERVAL / 50);
    const progTimer = setInterval(() => setProgress(p => Math.min(p + step, 100)), 50);
    const slideTimer = setTimeout(() => {
      setCurrentAdIndex(p => (p + 1) % ads.length);
    }, SLIDE_INTERVAL);
    return () => { clearInterval(progTimer); clearTimeout(slideTimer); };
  // eslint-disable-next-line
  }, [currentAdIndex]);

  /* ── DATA ── */
  const ads = [
    { id: 1, title: "🚀 Python Masterclass — 50% Off!", sub: "Master Python from scratch to advanced. Enroll before the weekend.", btn: "Claim Offer", img: slider1, accent: "#4f46e5" },
    { id: 2, title: "🔥 Next.js Premium Internship", sub: "Work on real-world production apps with expert industry mentors.", btn: "Apply Now", img: slider2, accent: "#0ea5e9" },
    { id: 3, title: "🏆 Become a Certified Java Engineer", sub: "Unlock high-paying roles at top-tier software companies worldwide.", btn: "Get Certified", img: slider3, accent: "#f59e0b" },
  ];

  const courses = [
    { id: 1, title: "C Programming Masterclass", icon: <FaCode />, image: courseCImg, description: "Master the foundation of all modern programming languages. Learn pointers, memory management, and build robust CLI applications.", color: "#3b82f6", level: "Beginner to Pro", duration: "6 weeks", pdfUrl: "/Clang.pdf", topics: ["Variables & Data Types", "Pointers & Memory", "Structures & Unions", "File I/O", "Data Structures Basics"] },
    { id: 2, title: "JavaScript ES6+ & Async", icon: <FaJsSquare />, image: courseJsImg, description: "Deep dive into the language of the web. Master closures, async/await, DOM APIs, and advanced functional programming concepts.", color: "#f59e0b", level: "Intermediate", duration: "8 weeks", pdfUrl: "/javascript.pdf", topics: ["ES6+ Syntax", "Async/Await", "DOM Manipulation", "REST APIs", "Event Loop Mechanics"] },
    { id: 3, title: "React.js Production Level", icon: <FaReact />, image: courseReactImg, description: "Build scalable, high-performance web applications using modern React Hooks, Context API, Redux Toolkit, and Next.js foundations.", color: "#06b6d4", level: "Advanced", duration: "10 weeks", pdfUrl: "/dummy.pdf", topics: ["Components & JSX", "Custom Hooks", "React Router", "Redux Toolkit", "Performance Optimization"] },
    { id: 4, title: "Python for Data & Web", icon: <FaPython />, image: coursePythonImg, description: "A comprehensive journey through Python. Automate tasks, build REST APIs with Django, and analyze data with Pandas.", color: "#10b981", level: "Beginner to Pro", duration: "8 weeks", pdfUrl: "/PythonCB.pdf", topics: ["Syntax & OOP", "File Handling", "Django Basics", "Data Libraries", "Web Scraping"] },
    { id: 5, title: "Enterprise Java & Spring Boot", icon: <FaJava />, image: courseJavaImg, description: "Become an enterprise-ready engineer. Learn Core Java OOP principles, Multithreading, and build microservices with Spring Boot.", color: "#ef4444", level: "Intermediate", duration: "10 weeks", pdfUrl: "/java.pdf", topics: ["OOP & Collections", "Exception Handling", "Multithreading", "Spring Boot", "JPA & Hibernate"] },
  ];

  const features = [
    { icon: <FaBriefcase />, title: 'Premium Internships', description: 'Hands-on experience at top companies with expert mentors.', stats: '500+', label: 'Companies', color: '#6366f1', action: () => setCurrentView('internships') },
    { icon: <FaBook />, title: 'Certified Courses', description: 'Master in-demand tech with industry-proven curriculum.', stats: '50+', label: 'Courses', color: '#f59e0b', action: () => setCurrentView('courses') },
    { icon: <FaRocket />, title: 'Live Projects', description: 'Build production-ready apps for your portfolio.', stats: '100+', label: 'Projects', color: '#10b981', action: () => setCurrentView('projects') },
    { icon: <FaSearch />, title: 'ATS Resume Scanner', description: 'AI-powered resume optimization and job-match scoring.', stats: 'AI', label: 'Powered', color: '#ef4444', action: () => setCurrentView('ats') },
    { icon: <FaGamepad />, title: 'Code Bug Hunter', description: 'Sharpen debugging skills with interactive challenges.', stats: '50+', label: 'Challenges', color: '#8b5cf6', action: () => setCurrentView('game') }
  ];

  const roadmap = [
    { step: "01", title: "Pick Your Track", desc: "Choose from Java, Python, C, JavaScript or React based on your goal.", icon: <FaBook />, color: "#6366f1" },
    { step: "02", title: "Learn with Projects", desc: "Every module includes hands-on mini-projects to reinforce concepts.", icon: <FaCode />, color: "#f59e0b" },
    { step: "03", title: "Take Live Tests", desc: "Proctored MCQ and coding exams mirror real placement assessments.", icon: <FaLaptopCode />, color: "#10b981" },
    { step: "04", title: "Get Certified", desc: "Earn an industry-recognized certificate upon course completion.", icon: <FaTrophy />, color: "#ef4444" },
    { step: "05", title: "Land Your Job", desc: "Access our placement network: 500+ partner companies hiring now.", icon: <FaChartLine />, color: "#8b5cf6" },
  ];

  const testimonials = [
    { name: "Priya S.", role: "SDE @ Infosys", text: "CodingBoss transformed my career. The live projects are real-world grade.", rating: 5, avatar: "P" },
    { name: "Karthik M.", role: "Java Dev @ TCS", text: "The proctored tests prepared me for actual placement exams perfectly.", rating: 5, avatar: "K" },
    { name: "Divya R.", role: "Frontend @ Wipro", text: "React curriculum is the most practical I've encountered. Highly recommend!", rating: 5, avatar: "D" },
    { name: "Arun T.", role: "Python Dev @ HCL", text: "Got placed within 2 months of completing the Python track. Incredible!", rating: 5, avatar: "A" },
  ];

  const techStack = [
    { name: "Java", icon: <FaJava />, color: "#f59e0b" }, { name: "Python", icon: <FaPython />, color: "#10b981" },
    { name: "React", icon: <FaReact />, color: "#6366f1" }, { name: "C / C++", icon: <FaCode />, color: "#ef4444" },
    { name: "JavaScript", icon: <FaJsSquare />, color: "#eab308" }, { name: "Spring Boot", icon: <FaLeaf />, color: "#22c55e" },
    { name: "Django", icon: <FaCube />, color: "#0ea5e9" }, { name: "DSA", icon: <FaProjectDiagram />, color: "#8b5cf6" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIndex(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleEnroll = (course) => {
    let enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    if (!enrolled.some(c => c.id === course.id)) {
      enrolled.push(course);
      localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
    }
    alert(`✅ Successfully Enrolled in ${course.title}!`);
  };

  /* ── RENDER MAIN ── */
  const renderMain = () => (
    <div className="cc-animate">
 {/* ── HERO ── */}
      <div className="cc-hero">
        <motion.div className="cc-tag" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span>⚡</span> Accelerate Your Tech Career
        </motion.div>
        <motion.h1 className="cc-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Elevate Your Skills with <span>CodingBoss</span>
        </motion.h1>
        <motion.p className="cc-desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Join thousands of developers mastering cutting-edge technologies through
          <b> premium internships</b>, <b> industry-certified courses</b>, and <b> production-grade projects</b>.
        </motion.p>
        <motion.div className="cc-hero-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button className="cc-feature-btn" onClick={() => setCurrentView('courses')}>
            Explore Courses <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>
        </motion.div>
      </div>

           {/* ── DUAL PILLAR SECTION: COURSES VS ASSESSMENT ── */}
      <div className="cc-section-header">
        <span className="cc-eyebrow">CHOOSE YOUR PATH</span>
        <h2 className="cc-section-title">Mastery <span>&</span> Evaluation</h2>
      </div>
      
      <div className="cc-dual-pillars">
        {/* LEARNING PILLAR */}
        <motion.div 
          className="cc-pillar-card learning-pillar"
          whileHover={{ y: -10 }}
          onClick={() => { if (setSelectedTab) setSelectedTab('Courses'); else navigate('/courses'); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="cc-pillar-badge">ACADEMY</div>
          <div className="cc-pillar-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <FaBook className="cc-pillar-icon" style={{ color: '#6366f1' }} />
          </div>
          <h3 className="cc-pillar-title">Certified <span>Courses</span></h3>
          <p className="cc-pillar-desc">
            Explore our professional curriculum in Java, Python, React, and C. 
            Build production-grade projects and earn industry certifications.
          </p>
          <ul className="cc-pillar-list">
            <li><FaCheckCircle /> 50+ Specialized Modules</li>
            <li><FaCheckCircle /> Production-Grade Projects</li>
            <li><FaCheckCircle /> Industry Mentorship</li>
          </ul>
          <button className="cc-pillar-btn learning-btn">
            Explore Academy <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>
        </motion.div>

        {/* ASSESSMENT PILLAR */}
        <motion.div 
          className="cc-pillar-card assessment-pillar"
          whileHover={{ y: -10 }}
          onClick={() => setSelectedTab ? setSelectedTab('Task') : navigate('/AssessmentCenter')}
        >
          <div className="cc-pillar-badge">EVALUATION</div>
          <div className="cc-pillar-icon-wrapper" style={{ background: 'rgba(255, 160, 3, 0.1)' }}>
            <FaLaptopCode className="cc-pillar-icon" style={{ color: '#FFA003' }} />
          </div>
          <h3 className="cc-pillar-title">Assessment <span>Center</span></h3>
          <p className="cc-pillar-desc">
            Validate your skills with our proctored MCQ tests and high-fidelity Code Labs. 
            Track your percentile and placement readiness.
          </p>
          <ul className="cc-pillar-list">
            <li><FaCheckCircle /> Proctored MCQ Exams</li>
            <li><FaCheckCircle /> Real-time Code Labs</li>
            <li><FaCheckCircle /> Performance Analytics</li>
          </ul>
          <button className="cc-pillar-btn assessment-btn">
            Start Assessment <FaArrowRight />
          </button>
        </motion.div>
      </div>


      {/* ── TECH STACK TICKER ── */}
      <div className="cc-ticker-wrapper">
        <div className="cc-ticker">
          {[...techStack, ...techStack].map((t, i) => (
            <div key={i} className="cc-ticker-item" style={{ '--tc': t.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem', display: 'flex', color: t.color }}>{t.icon}</span> <span style={{ fontWeight: 700 }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* ── TECH STACK TICKER ── */}

      {/* ── CERTIFIED COURSES (DIRECTLY ON MAIN PAGE) ── */}
      <div className="cc-section-header" style={{ marginTop: '40px' }}>
        <span className="cc-eyebrow">Top Rated</span>
        <h2 className="cc-section-title">Premium <span>Courses</span></h2>
      </div>
      <div className="cc-feature-grid">
        {courses.map(course => (
          <motion.div
            key={course.id}
            className="cc-feature-card"
            style={{ '--card-color': course.color, '--card-bg': `${course.color}1a`, cursor: 'pointer' }}
            whileHover={{ y: -8 }}
            onClick={() => { setSelectedCourse(course); setCurrentView('pdf'); }}
          >
            <div className="cc-card-inner" style={{ padding: '24px' }}>
              <div className="cc-card-image" style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
                <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="cc-card-stat-pill" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <FaPlay /> Preview
                </div>
              </div>
              <h3 className="cc-card-title">{course.title}</h3>
              <p className="cc-card-desc" style={{ marginBottom: '16px' }}>{course.description}</p>
              
              <div className="cc-topic-list">
                {course.topics.slice(0, 3).map((t, i) => (
                  <div key={i} className="cc-topic-row">
                    <FaCheckCircle style={{ color: course.color }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="cc-card-footer" style={{ marginTop: 'auto' }}>
                <span className="cc-card-explore">Start Course — {course.duration} <FaArrowRight /></span>
                <div className="cc-card-arrow"><FaPlay /></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── STATS ── */}
      <div className="cc-stats-band">
        <div className="cc-stat-item">
          <div className="cc-stat-num"><Counter end={5000} suffix="+" /></div>
          <div className="cc-stat-label">Students Trained</div>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat-item">
          <div className="cc-stat-num"><Counter end={500} suffix="+" /></div>
          <div className="cc-stat-label">Hiring Companies</div>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat-item">
          <div className="cc-stat-num"><Counter end={95} suffix="%" /></div>
          <div className="cc-stat-label">Placement Rate</div>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat-item">
          <div className="cc-stat-num"><Counter end={50} suffix="+" /></div>
          <div className="cc-stat-label">Certifications</div>
        </div>
      </div>

      {/* ── LEARNING ROADMAP ── */}
      <div className="cc-section-header">
        <span className="cc-eyebrow">Your Journey</span>
        <h2 className="cc-section-title">Learning <span>Roadmap</span></h2>
      </div>
      <div className="cc-roadmap">
        {roadmap.map((r, i) => (
          <motion.div key={i} className="cc-roadmap-step"
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}>
            <div className="cc-roadmap-num" style={{ background: r.color }}>{r.step}</div>
            <div className="cc-roadmap-icon" style={{ color: r.color }}>{r.icon}</div>
            <h4 className="cc-roadmap-title">{r.title}</h4>
            <p className="cc-roadmap-desc">{r.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* ── COURSE PREVIEW TABS ── */}
      <div className="cc-section-header">
        <span className="cc-eyebrow">Curriculum</span>
        <h2 className="cc-section-title">What You'll <span>Learn</span></h2>
      </div>
      <div className="cc-tabs">
        <div className="cc-tab-nav">
          {courses.map((c, i) => (
            <button key={i} className={`cc-tab-btn ${activeTab === i ? 'active' : ''}`}
              style={{ '--tc': c.color }} onClick={() => setActiveTab(i)}>
              {c.icon} {c.title}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} className="cc-tab-content"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
            <div className="cc-tab-left">
              <div className="cc-tab-badge" style={{ color: courses[activeTab].color }}>
                {courses[activeTab].level} · {courses[activeTab].duration}
              </div>
              <h3 className="cc-tab-title">{courses[activeTab].title}</h3>
              <p className="cc-tab-desc">{courses[activeTab].description}</p>
              <button className="cc-feature-btn" onClick={() => { setSelectedCourse(courses[activeTab]); setCurrentView('pdf'); }}>
                Preview Course <FaPlay style={{ marginLeft: '8px' }} />
              </button>
            </div>
            <div className="cc-tab-right">
              <h4 className="cc-tab-topics-title">Topics Covered</h4>
              {courses[activeTab].topics.map((t, i) => (
                <div key={i} className="cc-topic-row">
                  <FaCheckCircle style={{ color: courses[activeTab].color }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="cc-section-header">
        <span className="cc-eyebrow">Success Stories</span>
        <h2 className="cc-section-title">What Our <span>Students Say</span></h2>
      </div>
      <div className="cc-testimonials">
        <AnimatePresence mode="wait">
          <motion.div key={testimonialIndex} className="cc-testimonial-card"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.4 }}>
            <FaQuoteLeft className="cc-quote-icon" />
            <p className="cc-testimonial-text">"{testimonials[testimonialIndex].text}"</p>
            <div className="cc-testimonial-stars">
              {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => <FaStar key={i} />)}
            </div>
            <div className="cc-testimonial-author">
              <div className="cc-testimonial-avatar">{testimonials[testimonialIndex].avatar}</div>
              <div>
                <div className="cc-testimonial-name">{testimonials[testimonialIndex].name}</div>
                <div className="cc-testimonial-role">{testimonials[testimonialIndex].role}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="cc-ad-dots" style={{ marginTop: 24 }}>
          {testimonials.map((_, i) => (
            <div key={i} className={`cc-ad-dot ${i === testimonialIndex ? 'active' : ''}`} onClick={() => setTestimonialIndex(i)} />
          ))}
        </div>
      </div>

      {/* ── PREMIUM CTA BAND ── */}
      <div className="cc-cta-band">
        <div className="cc-cta-inner">
          <FaUserGraduate className="cc-cta-icon" />
          <h3 className="cc-cta-title">
            Ready to Launch Your <span>Engineering Career?</span>
          </h3>
          <p className="cc-cta-sub">Join 5,000+ students already on the path to top tech roles.</p>

          <div className="cc-cta-btns">
            <button className="cc-cta-primary" onClick={() => setCurrentView('courses')}>
              Join Academy <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
          </div>

          <div className="cc-cta-trust">
            <div className="cc-cta-trust-item">✅ No Credit Card Required</div>
            <div className="cc-cta-trust-dot" />
            <div className="cc-cta-trust-item">🎓 Certificate on Completion</div>
            <div className="cc-cta-trust-dot" />
            <div className="cc-cta-trust-item">💼 Placement Support</div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderCourses = () => (
    <div className="cc-animate">
      <button className="cc-back-btn" onClick={() => setCurrentView('main')}>
        <FaArrowLeft /> Back to Home
      </button>
      <h2 className="cc-title" style={{ fontSize: '3rem' }}>Certified <span>Courses</span></h2>
      <div className="cc-feature-grid">
        {courses.map(course => (
          <motion.div
            key={course.id}
            className="cc-feature-card"
            style={{ '--card-color': course.color, '--card-bg': `${course.color}1a`, cursor: 'pointer' }}
            whileHover={{ y: -8 }}
            onClick={() => { setSelectedCourse(course); setCurrentView('pdf'); }}
          >
            <div className="cc-card-inner" style={{ padding: '24px' }}>
              <div className="cc-card-image" style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
                <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="cc-card-stat-pill" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <FaPlay /> Preview
                </div>
              </div>
              <h3 className="cc-card-title">{course.title}</h3>
              <p className="cc-card-desc" style={{ marginBottom: '16px' }}>{course.description}</p>
              
              <div className="cc-topic-list">
                {course.topics.slice(0, 3).map((t, i) => (
                  <div key={i} className="cc-topic-row">
                    <FaCheckCircle style={{ color: course.color }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="cc-card-footer" style={{ marginTop: 'auto' }}>
                <span className="cc-card-explore">Start Course — {course.duration} <FaArrowRight /></span>
                <div className="cc-card-arrow"><FaPlay /></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPdf = () => (
    <div className="cc-animate" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: '#0f172a' }}>
        <button className="cc-back-btn" style={{ marginBottom: 0, color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setCurrentView('courses')}>
          <FaArrowLeft /> Close Viewer
        </button>
        <h3 style={{ fontWeight: 900, color: 'white', margin: 0 }}>{selectedCourse?.icon} {selectedCourse?.title}</h3>
        <button className="cc-feature-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => handleEnroll(selectedCourse)}>
          ✅ Enroll Now
        </button>
      </div>
      <iframe src={selectedCourse?.pdfUrl} style={{ flex: 1, width: '100%', border: 'none' }} title="course-pdf" />
    </div>
  );

  return (
    <div className="cc-container">
      <div className="cc-content">
        {currentView === 'main' && renderMain()}
        {currentView === 'courses' && renderCourses()}
        {currentView === 'pdf' && renderPdf()}
        {['ats', 'game', 'internships', 'projects'].includes(currentView) && (
          <div className="cc-animate text-center" style={{ padding: '100px 0' }}>
            <div style={{ fontSize: '5rem', marginBottom: 24 }}>🔨</div>
            <h2 className="cc-title">Coming <span>Soon</span></h2>
            <p className="cc-desc">We're building something incredible. Stay tuned!</p>
            <button className="cc-back-btn" onClick={() => setCurrentView('main')}>
              <FaArrowLeft /> Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
