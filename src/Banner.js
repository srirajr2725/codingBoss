import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRocket, FaPlay, FaCheckCircle, FaWhatsapp, FaChevronDown,
  FaBriefcase, FaLaptopCode, FaTrophy, FaCode, FaUserGraduate
} from "react-icons/fa";
import "./Banner.css";

/* ── Typing Effect ── */
function TypedText({ words }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[index % words.length];
    let t;
    if (!deleting && displayed.length < word.length)
      t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    else if (!deleting && displayed.length === word.length)
      t = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && displayed.length > 0)
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    else { setDeleting(false); setIndex(i => i + 1); }
    return () => clearTimeout(t);
  }, [displayed, deleting, index, words]);
  return <span className="bn-typed">{displayed}<span className="bn-cursor">|</span></span>;
}

const bottomCards = [
  {
    icon: <FaLaptopCode />, color: "#6366f1",
    title: "Industry Courses",
    desc: "Java, Python, React, C++ — curriculum built with top engineers.",
    tag: "50+ Courses"
  },
  {
    icon: <FaBriefcase />, color: "#f59e0b",
    title: "Premium Internships",
    desc: "Work on real projects with 500+ hiring partner companies.",
    tag: "500+ Companies"
  },
  {
    icon: <FaTrophy />, color: "#10b981",
    title: "Proctored Exams",
    desc: "AI-monitored MCQ and coding tests that mirror placement rounds.",
    tag: "98% Pass Rate"
  },
  {
    icon: <FaUserGraduate />, color: "#ef4444",
    title: "Placement Support",
    desc: "Resume building, mock interviews, and direct HR connects.",
    tag: "Guaranteed"
  },
  {
    icon: <FaCode />, color: "#8b5cf6",
    title: "AI Mentor",
    desc: "24/7 voice-powered AI tutor to explain code and concepts.",
    tag: "Always On"
  },
];

const Banner = ({ isLoggedIn }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const bannerRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (!bannerRef.current) return;
      const r = bannerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <div className="bn-container" ref={bannerRef}>
      {/* Mouse glow */}
      <div className="bn-mouse-glow" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="bn-mesh" />
      <div className="bn-orb bn-orb-1" />
      <div className="bn-orb bn-orb-2" />

      {/* ── HERO CONTENT (centered) ── */}
      <div className="bn-hero-center">
        <motion.div className="bn-badge"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <FaRocket className="bn-badge-icon" /> India's #1 Engineering Placement Platform
        </motion.div>

        <motion.h1 className="bn-h1"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          Master <TypedText words={["Java", "Python", "React", "C++", "DSA"]} /><br />
          <span className="bn-gradient-text">Land Your Dream Job</span>
        </motion.h1>

        <motion.p className="bn-sub"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Industry-certified courses, proctored exams, live projects, and direct placement support
          at <strong>500+ top companies</strong> — all in one elite platform.
        </motion.p>

        <motion.div className="bn-pills"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {["Placement Guarantee", "AI Mentor", "Live Projects", "Proctored Exams"].map((p, i) => (
            <div key={i} className="bn-pill"><FaCheckCircle className="bn-pill-icon" />{p}</div>
          ))}
        </motion.div>

        <motion.div className="bn-btns"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Link to="/LoginPage" className="bn-primary-btn">
            <FaPlay /> Start Learning Free
          </Link>
        </motion.div>

        <motion.div className="bn-stats-row"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {[{ val: "15K+", lbl: "Students" }, { val: "500+", lbl: "Companies" }, { val: "98%", lbl: "Placement" }, { val: "50+", lbl: "Certifications" }].map((s, i) => (
            <div key={i} className="bn-stat-mini">
              <span className="bn-stat-mini-val">{s.val}</span>
              <span className="bn-stat-mini-lbl">{s.lbl}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── BOTTOM CARDS ── */}
      <div className="bn-cards-section">
        {bottomCards.map((c, i) => (
          <motion.div
            key={i}
            className="bn-bottom-card"
            style={{ '--cc': c.color }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 150 }}
            whileHover={{ y: -10, scale: 1.03 }}
          >
            <div className="bn-bottom-card-icon">{c.icon}</div>
            <div className="bn-bottom-card-tag">{c.tag}</div>
            <h4 className="bn-bottom-card-title">{c.title}</h4>
            <p className="bn-bottom-card-desc">{c.desc}</p>
            <div className="bn-bottom-card-arrow">Explore</div>
          </motion.div>
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div className="bn-scroll-hint"
        animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <FaChevronDown />
      </motion.div>
    </div>
  );
};

export default Banner;
