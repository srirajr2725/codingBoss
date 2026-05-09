import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import "./CounterSection.css"; // Import CSS file

const CounterSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { label: "Learners", count: 2350 },
    { label: "Mentors", count: 60 },
  ];

  const percentages = [
    { label: "of Learners complete their courses within 3 months", percent: 72 },
    { label: "of Learners could recollect the concepts faster", percent: 78 },
    { label: "of Learners have better understanding over complex topics", percent: 84 },
  ];

  return (
    <div ref={ref} className="counter-section">
      <h2 className="section-title">We are <span>proud of...</span></h2>

      {/* Number Stats */}
      <div className="stats-container">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <h3 className="stat-number">
              {inView ? <CountUp start={0} end={item.count} duration={3} /> : "0"}
            </h3>
            <p className="stat-label">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Percentage Stats */}
      <div className="percentage-container">
        {percentages.map((item, index) => (
          <motion.div
            key={index}
            className="percentage-card"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.3 }}
          >
            <div className="percentage-chart">
              <svg className="circle-svg" width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="circle-bg" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="circle-progress"
                  strokeDasharray="251"
                  strokeDashoffset={inView ? 251 - (251 * item.percent) / 100 : 251}
                  transition={{ duration: 1 }}
                />
              </svg>
              {/* Centered Percentage Value */}
              <p className="percentage-value">
                {inView ? <CountUp start={0} end={item.percent} duration={3} /> : "0"}%
              </p>
            </div>
            <p className="percentage-text">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CounterSection;
