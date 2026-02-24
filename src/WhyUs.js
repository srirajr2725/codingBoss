import React, { useEffect, useRef, useState } from "react";
import "./WhyUs.css";

const WhyUs = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const contentRefs = useRef([]);
  const lineRef = useRef(null);
  const finalTextRef = useRef(null);
  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isTitleVisible, setIsTitleVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setVisibleIndexes((prev) => [...new Set([...prev, index])]);
          }
        });

        // Adjust progress line height dynamically
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

  // Separate observer for title visibility
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
          {[
            "At Codingboss, we make coding simple and effective.",
            "MCQs & Coding Tests – Improve with hands-on practice.",
            "Exam-Ready Prep – Ace interviews and competitions.",
            "Real-World Challenges – Solve industry-level problems.",
            "Personalized Learning – Track and improve easily.",
            "Beginner to Pro – Courses for all skill levels.",
            "Regular Updates – Stay ahead in coding trends."
          ].map((text, index) => (
            <div
              key={index}
              ref={(el) => (contentRefs.current[index] = el)}
              className={`why-us-card ${visibleIndexes.includes(index) ? "visible" : ""} 
                ${hoverIndex === index ? "hovered" : ""}`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {text.split(".").map((word, i) => (
                <span key={i} className="fade-in-word">
                  {word}
                </span>
              ))}
            </div>
          ))}
          <p ref={finalTextRef} className={`why-us-final-text ${visibleIndexes.includes(7) ? "visible" : ""}`}>
            {"Start your journey with Codingboss today!".split(" ").map((word, i) => (
              <span key={i} className="fade-in-word">{word}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
