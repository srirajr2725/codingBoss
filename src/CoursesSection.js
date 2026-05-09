import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaPlay, FaGraduationCap } from 'react-icons/fa';
import "./CoursesSection.css";
import javaLogo from "../src/images/Jaava.png";
import courseImage from "../src/images/coding.png";

const courses = [
  { name: "DSA", duration: "3 Months", chapters: "12 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png" },
  { name: "AI & ML", duration: "4 Months", chapters: "15 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/2103/2103533.png" },
  { name: "Blockchain", duration: "3 Months", chapters: "10 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png" },
  { name: "C Programming", duration: "2 Months", chapters: "8 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/3665/3665923.png" },
  { name: "Cloud Computing", duration: "3 Months", chapters: "12 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/1162/1162456.png" },
  { name: "Cybersecurity", duration: "4 Months", chapters: "14 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png" },
  { name: "Full Stack Java", duration: "6 Months", chapters: "24 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/226/226773.png" },
  { name: "Python Expert", duration: "3 Months", chapters: "12 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png" },
  { name: "React Mastery", duration: "2 Months", chapters: "10 Chapters", icon: "https://cdn-icons-png.flaticon.com/512/1126/1126012.png" },
];

const CoursesSection = ({ setSelectedTab }) => {
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3;
  const navigate = useNavigate();

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const updateIndex = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const index = Math.round((scrollLeft / (scrollWidth - clientWidth)) * (courses.length - visibleCards));
        setCurrentIndex(index);
      }
    };
    sliderRef.current?.addEventListener("scroll", updateIndex);
    return () => sliderRef.current?.removeEventListener("scroll", updateIndex);
  }, []);

  const handleStartCourse = () => {
    if (setSelectedTab) {
      setSelectedTab('Start Learn');
    } else {
      navigate('/Learn');
    }
  };

  return (
    <div className="courses-section">
      <div className="future-container">
        <div className="future-text">
          <div className="d-flex align-items-center gap-2 mb-3" style={{ color: '#FFA003' }}>
            <FaGraduationCap size={24} />
            <span style={{ fontWeight: 800, letterSpacing: 2 }}>ELITE CURRICULUM</span>
          </div>
          <h2 className="title">Built for the <br/>Next <span className="glow">Generation</span></h2>
          <p>
            At <span className="glow">CodingBoss</span>, we bridge the gap between academic theory and industry reality. Our courses are crafted by top-tier engineers for students who aim for excellence.
          </p>
          <p>
            Master <span className="glow">Software Development</span>, <span className="glow">AI</span>, and <span className="glow">Cloud Architecture</span> with hands-on labs and real-world projects.
          </p>
        </div>

        <div className="future-image">
          <img src={courseImage} alt="Future" className="course-img" />
        </div>
      </div>

      <motion.div
        className="courses-offering-container"
        ref={titleRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <h2 className="courses-title">Explore Our <span>Specializations</span></h2>
      </motion.div>

      <div className="courses-slider-container">
        <button className="arrow left-arrow" onClick={scrollLeft}><FaChevronLeft /></button>
        
        <div className="courses-container" ref={sliderRef}>
          {courses.map((course, index) => (
            <motion.div
              key={index}
              className="course-card"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="course-image-container">
                <img src={course.icon} alt={course.name} className="course-image" />
              </div>
              <div className="course-title">{course.name}</div>
              <div className="course-details">⚡ {course.duration} Intensive</div>
              <div className="course-details">📚 {course.chapters} Curriculum</div>
              <button className="start-course-btn" onClick={handleStartCourse}>
                Access Course <FaPlay style={{ fontSize: '0.7rem', marginLeft: 8 }} />
              </button>
            </motion.div>
          ))}
        </div>

        <button className="arrow right-arrow" onClick={scrollRight}><FaChevronRight /></button>
      </div>

      <div className="pagination-dots">
        {Array.from({ length: Math.ceil(courses.length / 2) }).map((_, index) => (
          <span key={index} className={`dot ${index === Math.floor(currentIndex / 2) ? "active" : ""}`}></span>
        ))}
      </div>
    </div>
  );
};

export default CoursesSection;
