import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight, FaArrowLeft, FaDownload, FaGamepad, FaSearch,
  FaBook, FaBriefcase, FaRocket, FaStar, FaCode, FaCheckCircle,
  FaUserGraduate, FaTrophy, FaLaptopCode, FaChartLine, FaPlay,
  FaQuoteLeft, FaWhatsapp
} from 'react-icons/fa';
import './CourseCard.css';
import banner1 from './images/Banner1.png';
import banner2 from './images/Banner2.png';
import courseImg from './images/course.png';

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

/* ─── Floating Particles Background ─── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 8,
  }));
  return (
    <div className="cc-particles" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} className="cc-particle" style={{
          width: p.size, height: p.size,
          left: `${p.x}%`, top: `${p.y}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
        }} />
      ))}
    </div>
  );
}

export default function CourseCard() {
  const [currentView, setCurrentView] = useState('main');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse glow effect
  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  /* ── DATA ── */
  const ads = [
    { id: 1, title: "🚀 Limited Time: 50% Off Python Masterclass!", sub: "Enroll before the weekend to lock in this exclusive offer.", btn: "Claim Offer", img: banner1, color: "#4f46e5" },
    { id: 2, title: "🔥 Next.js Premium Internship Starting Soon!", sub: "Work on real-world production apps with expert mentors.", btn: "Apply Now", img: banner2, color: "#0ea5e9" },
    { id: 3, title: "🏆 Become a Certified Java Engineer Today", sub: "Unlock high-paying roles at top-tier software companies.", btn: "Get Certified", img: courseImg, color: "#f59e0b" }
  ];

  const courses = [
    { id: 1, title: "C Programming", icon: "📘", description: "Learn fundamentals of C including pointers & memory management.", color: "#ef4444", level: "Beginner", duration: "6 weeks", pdfUrl: "/Clang.pdf", topics: ["Variables & Data Types", "Pointers & Memory", "Structures & Unions", "File I/O"] },
    { id: 2, title: "JavaScript Mastery", icon: "⚡", description: "Master modern JS, async programming, closures and APIs.", color: "#f59e0b", level: "Intermediate", duration: "8 weeks", pdfUrl: "/javascript.pdf", topics: ["ES6+ Syntax", "Async/Await", "DOM Manipulation", "REST APIs"] },
    { id: 3, title: "React Development", icon: "⚛️", description: "Build scalable frontend apps with React Hooks & Context.", color: "#6366f1", level: "Advanced", duration: "10 weeks", pdfUrl: "/dummy.pdf", topics: ["Components & JSX", "Hooks & Context", "React Router", "Redux Toolkit"] },
    { id: 4, title: "Python Programming", icon: "🐍", description: "From basics to automation, data science and web development.", color: "#10b981", level: "Beginner", duration: "6 weeks", pdfUrl: "/PythonCB.pdf", topics: ["Syntax & OOP", "File Handling", "Django Basics", "Data Libraries"] },
    { id: 5, title: "Java Programming", icon: "☕", description: "Core Java, OOP principles, collections, and Spring Boot APIs.", color: "#0ea5e9", level: "Intermediate", duration: "9 weeks", pdfUrl: "/java.pdf", topics: ["OOP & Collections", "Exception Handling", "Spring Boot", "JPA & Hibernate"] },
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
    { name: "Java", emoji: "☕", color: "#f59e0b" }, { name: "Python", emoji: "🐍", color: "#10b981" },
    { name: "React", emoji: "⚛️", color: "#6366f1" }, { name: "C / C++", emoji: "📘", color: "#ef4444" },
    { name: "JavaScript", emoji: "⚡", color: "#eab308" }, { name: "Spring Boot", emoji: "🌱", color: "#22c55e" },
    { name: "Django", emoji: "🎸", color: "#0ea5e9" }, { name: "DSA", emoji: "🔗", color: "#8b5cf6" },
  ];

  /* ── EFFECTS ── */
  useEffect(() => {
    const timer = setInterval(() => setCurrentAdIndex(p => (p + 1) % ads.length), 4000);
    return () => clearInterval(timer);
  }, [ads.length]);

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

      {/* ── AD BANNER ── */}
      <div className="cc-ad-container">
        <AnimatePresence mode="wait">
          <motion.div key={currentAdIndex} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="cc-ad-banner">
            <div className="cc-ad-image-bg">
              <img src={ads[currentAdIndex].img} alt={ads[currentAdIndex].title} />
              <div className="cc-ad-overlay" style={{ background: `linear-gradient(to bottom, transparent 0%, ${ads[currentAdIndex].color}dd 90%)` }}></div>
            </div>
            <div className="cc-ad-content">
              <div className="cc-ad-badge">⭐ PREMIUM OFFER</div>
              <h2 className="cc-ad-title">{ads[currentAdIndex].title}</h2>
              <p className="cc-ad-sub">{ads[currentAdIndex].sub}</p>
            </div>
            <button className="cc-ad-btn">{ads[currentAdIndex].btn} <FaArrowRight /></button>
          </motion.div>
        </AnimatePresence>
        <div className="cc-ad-dots">
          {ads.map((_, i) => <div key={i} className={`cc-ad-dot ${i === currentAdIndex ? 'active' : ''}`} onClick={() => setCurrentAdIndex(i)} />)}
        </div>
      </div>

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
            <FaPlay /> Start Learning Free
          </button>
        </motion.div>
      </div>

      {/* ── TECH STACK TICKER ── */}
      <div className="cc-ticker-wrapper">
        <div className="cc-ticker">
          {[...techStack, ...techStack].map((t, i) => (
            <div key={i} className="cc-ticker-item" style={{ '--tc': t.color }}>
              <span>{t.emoji}</span> {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div className="cc-section-header">
        <span className="cc-eyebrow">What We Offer</span>
        <h2 className="cc-section-title">Everything You Need to <span>Succeed</span></h2>
      </div>
      <div className="cc-feature-grid">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="cc-feature-card"
            style={{ '--card-color': f.color, '--card-bg': `${f.color}15` }}
            onClick={f.action}
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="cc-card-inner">
              <div className="cc-card-top-row">
                <div className="cc-card-icon">{f.icon}</div>
                <div className="cc-card-stat-pill">{f.stats} {f.label}</div>
              </div>
              <h3 className="cc-card-title">{f.title}</h3>
              <p className="cc-card-desc">{f.description}</p>
              <div className="cc-card-footer">
                <span className="cc-card-explore">Explore Now <FaArrowRight /></span>
                <div className="cc-card-arrow"><FaArrowRight /></div>
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
              <button className="cc-feature-btn" style={{ background: courses[activeTab].color }}
                onClick={() => { setSelectedCourse(courses[activeTab]); setCurrentView('pdf'); }}>
                <FaPlay /> Preview Course
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
              <FaPlay /> Get Started Free
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
            style={{ '--card-color': course.color, '--card-bg': `${course.color}15` }}
            whileHover={{ y: -10 }}
            onClick={() => { setSelectedCourse(course); setCurrentView('pdf'); }}
          >
            <div className="cc-card-inner">
              <div className="cc-card-top-row">
                <div className="cc-card-icon" style={{ fontSize: '2rem' }}>{course.icon}</div>
                <div className="cc-card-stat-pill">{course.level}</div>
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
      {/* Mouse spotlight glow */}
      <div className="cc-mouse-glow" style={{
        left: mousePos.x,
        top: mousePos.y,
      }} />
      {/* Floating background particles */}
      <FloatingParticles />

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
