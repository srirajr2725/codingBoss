import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from "framer-motion";
import "./CoursesSection.css";
import javaLogo from "../src/images/Jaava.png";
import courseImage from "../src/images/coding.png";

const courses = [
  { name: "DSA", duration: "3 Months", chapters: "10 Chapters" },
  { name: "AI & ML", duration: "3 Months", chapters: "10 Chapters" },
  { name: "Blockchain", duration: "3 Months", chapters: "10 Chapters" },
  { name: "C Programming", duration: "3 Months", chapters: "10 Chapters" },
  { name: "Cloud Computing", duration: "3 Months", chapters: "10 Chapters" },
  { name: "Cybersecurity", duration: "3 Months", chapters: "10 Chapters" },
  { name: "Java", duration: "3 Months", chapters: "10 Chapters" },
  { name: "Laravel", duration: "3 Months", chapters: "10 Chapters" },
  { name: "Python", duration: "3 Months", chapters: "10 Chapters" },
  { name: "React", duration: "3 Months", chapters: "10 Chapters" },
];

const CoursesSection = () => {
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-100px" });

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3; // Number of visible cards at a time
  const navigate = useNavigate();

  // Scroll Functions
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -250, behavior: "smooth" });
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 250, behavior: "smooth" });
      setCurrentIndex((prev) => Math.min(prev + 1, courses.length - visibleCards));
    }
  };

  // Automatically update dots based on scroll position
  useEffect(() => {
    const updateIndex = () => {
      if (sliderRef.current) {
        const scrollLeft = sliderRef.current.scrollLeft;
        const totalWidth = sliderRef.current.scrollWidth;
        const cardWidth = totalWidth / courses.length;
        const newIndex = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(newIndex);
      }
    };

    sliderRef.current?.addEventListener("scroll", updateIndex);
    return () => sliderRef.current?.removeEventListener("scroll", updateIndex);
  }, []);

  return (
    <div className="courses-section">
      {/* ✅ "Built for the Future" Section */}
      <div className="future-container">
        <div className="future-text">
          <h2 className="title">Built for the Future</h2>
          <p>
            At <span className="glow">CodingBoss</span>, we are committed to providing 
            <span className="glow"> high-quality</span>, <span className="glow"> industry-relevant   
            </span> courses designed specifically for <span className="glow">college students</span> eager to 
            enhance their skills and launch successful careers in <span className="glow">technology</span>.
          </p>
          <p>
            Our comprehensive programs cover a wide array of topics, from 
            <span className="glow"> foundational concepts</span> to 
            <span className="glow"> advanced technologies</span>. Whether you're looking to specialize in 
            <span className="glow"> software development</span>, <span className="glow"> data science</span>, 
            or <span className="glow"> cloud computing</span>, we have a course that fits your needs.
          </p>
        </div>

        <div className="future-image">
          <img src={courseImage} alt="Course Illustration" className="course-img" />
        </div>
      </div>

      {/* ✅ "Courses We Are Offering" Section */}
      <motion.div
        className="courses-offering-container"
        ref={titleRef}
        initial={{ opacity: 0, x: -100 }}
        animate={isTitleInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h2 className="courses-title">Courses We Are Offering</h2>
      </motion.div>

      {/* ✅ Horizontal Scrolling Courses with Navigation Arrows & Pagination */}
      <div className="courses-slider-container">
        <button className="arrow left-arrow" onClick={scrollLeft}>
          &#10094;
        </button>

        <div className="courses-container" ref={sliderRef}>
          {courses.map((course, index) => (
            <motion.div
              key={index}
              className="course-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="course-image-container">
                <img src={javaLogo} alt="Course Logo" className="course-image" />
              </div>
              <div className="course-title">{course.name}</div>
              <div className="course-details">Duration: {course.duration}</div>
              <div className="course-details">Topics: {course.chapters}</div>
              <button className="start-course-btn" onClick={() => navigate('/LoginPage')}
              >
               Start Course
             </button>
            </motion.div>
          ))}
        </div>

        <button className="arrow right-arrow" onClick={scrollRight}>
          &#10095;
        </button>
      </div>

      {/* ✅ Pagination Dots for Navigation */}
      <div className="pagination-dots">
        {courses.slice(0, courses.length - visibleCards + 1).map((_, index) => (
          <span key={index} className={`dot ${index === currentIndex ? "active" : ""}`}></span>
        ))}
      </div>
    </div>
  );
};

export default CoursesSection;
