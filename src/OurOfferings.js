import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import "./OurOfferings.css";

// Import new ultra images
import learnImg from "../src/images/ultra_learning_ad.png";
import practiceImg from "../src/images/ultra_practice_ad.png";
import testImg from "../src/images/ultra_testing_ad.png";

const eliteFeatures = [
  { 
    name: "Advanced Learning", 
    img: learnImg, 
    tag: "CURRICULUM", 
    desc: "Master industry-standard technologies with our deep-dive modules." 
  },
  { 
    name: "Infinite Practice", 
    img: practiceImg, 
    tag: "STUDIO", 
    desc: "Refine your coding logic in our high-performance virtual labs." 
  },
  { 
    name: "Secure Testing", 
    img: testImg, 
    tag: "PROCTORING", 
    desc: "Validate your skills with AI-monitored industrial examinations." 
  },
];

const OurOfferings = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className="offerings-container">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div className="scroll-progress" style={{ height: `${scrollProgress}%` }}></div>
      </div>

      <div className="category-header">
        <span className="category-title">Elite Ecosystem</span>
        <span className="category-tag for-students">Next-Gen Education</span>
      </div>

      <div className="offerings-list elite-grid">
        {eliteFeatures.map((feature, index) => {
          const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
          return (
            <motion.div
              key={index}
              ref={ref}
              className={`project-card feature-ad-card ${inView ? "visible" : ""}`}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <div className="project-image-wrapper static-ad">
                <img src={feature.img} alt={feature.name} className="project-image ad-img" />
                <div className="ad-overlay">
                  <span className="ad-tag">{feature.tag}</span>
                </div>
              </div>
              <div className="project-info ad-info">
                <h3>{feature.name}</h3>
                <p className="ad-description">{feature.desc}</p>
                <div className="ad-status-pill">Feature Active</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OurOfferings;
