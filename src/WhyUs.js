import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./WhyUs.css";

import { FaCheckCircle, FaLaptopCode, FaTrophy, FaBriefcase, FaChartLine, FaGraduationCap, FaSync } from "react-icons/fa";

const WhyUs = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const contentRefs = useRef([]);
  const lineRef = useRef(null);
  const finalTextRef = useRef(null);
  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isTitleVisible, setIsTitleVisible] = useState(false);

  const features = [
    { icon: <FaCheckCircle />, text: "At Codingboss, we make coding simple and effective" },
    { icon: <FaLaptopCode />, text: "MCQs & Coding Tests – Improve with hands-on practice" },
    { icon: <FaTrophy />, text: "Exam-Ready Prep – Ace interviews and competitions" },
    { icon: <FaBriefcase />, text: "Real-World Challenges – Solve industry-level problems" },
    { icon: <FaChartLine />, text: "Personalized Learning – Track and improve easily" },
    { icon: <FaGraduationCap />, text: "Beginner to Pro – Courses for all skill levels" },
    { icon: <FaSync />, text: "Regular Updates – Stay ahead in coding trends" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setVisibleIndexes((prev) => [...new Set([...prev, index])]);
          }
        });

        if (lineRef.current) {
          const percentage = ((visibleIndexes.length + 1) / contentRefs.current.length) * 100;
          lineRef.current.style.height = `${percentage}%`;
        }
      },
      { threshold: 0.5 }
    );

    contentRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    if (finalTextRef.current) observer.observe(finalTextRef.current);

    return () => {
      contentRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
      if (finalTextRef.current) observer.unobserve(finalTextRef.current);
    };
  }, [visibleIndexes]);

  useEffect(() => {
    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTitleVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (titleRef.current) {
      titleObserver.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        titleObserver.unobserve(titleRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="why-us-section">
      <div className="container">
        <div ref={lineRef} className="progress-line"></div>
        <h2 ref={titleRef} className={`why-us-title ${isTitleVisible ? "visible" : ""}`}>
          WHY US
        </h2>
        <div className="why-us-content">
          <div className="why-us-grid">
            {features.map((item, index) => {
              const textParts = item.text.split(" – ");
              return (
                <div
                  key={index}
                  ref={(el) => (contentRefs.current[index] = el)}
                  className={`why-us-card ${visibleIndexes.includes(index) ? "visible" : ""} 
                    ${hoverIndex === index ? "hovered" : ""}`}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <div className="why-us-icon-wrapper">
                    {item.icon}
                  </div>
                  <div className="fade-in-word">
                    {textParts.length > 1 ? (
                      <>
                        <strong>{textParts[0]}</strong> – {textParts[1]}
                      </>
                    ) : (
                      <strong>{textParts[0]}</strong>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={finalTextRef} className={`why-us-final-cta ${visibleIndexes.includes(7) ? "visible" : ""}`}>
            <h3>Ready to start your journey?</h3>
            <p>Join thousands of students mastering technology today.</p>
            <div className="cta-wrapper">
              <Link to="/signup" className="ultra-btn">Get Started Now</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
