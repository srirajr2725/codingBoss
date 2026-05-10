import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaVrCardboard, FaChartLine, FaShieldAlt, FaRocket, FaGlobe } from 'react-icons/fa';
import './InnovativeLearning.css';

import aiImg from './images/ai.png';
import machineImg from './images/machine.png';
import dataImg from './images/data.png';
import blockchainImg from './images/blockchain.png';
import visionImg from './images/vision.png';
import nlpImg from './images/NLP.png';

const features = [
  {
    icon: <FaBrain />,
    title: "AI-Powered Personalization",
    desc: "Our platform adapts in real-time to your learning pace, identifying gaps and suggesting the most efficient path forward.",
    color: "#a855f7",
    img: aiImg
  },
  {
    icon: <FaVrCardboard />,
    title: "Immersive Virtual Labs",
    desc: "Experience complex architectures and systems in high-fidelity 3D environments that bridge the gap between theory and practice.",
    color: "#6366f1",
    img: machineImg
  },
  {
    icon: <FaChartLine />,
    title: "Predictive Analytics",
    desc: "Advanced data models predict your career success based on project performance, helping you pivot to the highest-demand roles.",
    color: "#10b981",
    img: dataImg
  },
  {
    icon: <FaShieldAlt />,
    title: "Blockchain Certification",
    desc: "Your achievements are secured on the blockchain, providing tamper-proof credentials that are globally recognized by top recruiters.",
    color: "#f59e0b",
    img: blockchainImg
  },
  {
    icon: <FaRocket />,
    title: "Accelerated Sprints",
    desc: "Master industry-ready skills in record time with our proprietary 'Sprint-Based' curriculum designed for peak performance.",
    color: "#ef4444",
    img: visionImg
  },
  {
    icon: <FaGlobe />,
    title: "Global Collaboration",
    desc: "Solve real-world challenges alongside peers and mentors from over 50 countries in our digital-first ecosystem.",
    color: "#0ea5e9",
    img: nlpImg
  }
];

const InnovativeLearning = () => {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="innovative-section">
      <div className="inn-bg-glow"></div>
      <div className="inn-container">
        <div className="inn-header">
          <motion.span 
            className="inn-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            The Future of EdTech
          </motion.span>
          <motion.h2 
            className="inn-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Next-Gen Learning <span className="inn-gradient-text">Ecosystem</span>
          </motion.h2>
          <motion.p 
            className="inn-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Empowering the next generation of engineers with state-of-the-art tools and an innovative pedagogical approach that drives real-world results.
          </motion.p>
        </div>

        <div className="inn-slider-wrapper">
          <button className="inn-nav-btn prev" onClick={() => scroll('left')}>&lt;</button>
          
          <div className="inn-grid" ref={scrollRef}>
            {features.map((f, i) => (
              <motion.div 
                key={i}
                className="inn-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="inn-card-image-bg">
                  <img src={f.img} alt={f.title} />
                  <div className="inn-card-overlay"></div>
                </div>
                
                <div className="inn-card-content">
                  <div className="inn-card-glow" style={{ backgroundColor: f.color }}></div>
                  <div className="inn-icon-wrapper" style={{ '--icon-color': f.color }}>
                    {f.icon}
                  </div>
                  <h3 className="inn-card-title">{f.title}</h3>
                  <p className="inn-card-desc">{f.desc}</p>
                  <div className="inn-card-footer">
                    <span className="inn-learn-more">Experience Innovation</span>
                    <div className="inn-arrow">→</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="inn-nav-btn next" onClick={() => scroll('right')}>&gt;</button>
        </div>

        <motion.div 
          className="inn-cta-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="inn-cta-content">
            <h3>Ready to revolutionize your learning journey?</h3>
            <p>Join 15,000+ students already mastering the future.</p>
          </div>
          <button className="inn-cta-btn">Get Started Now</button>
        </motion.div>
      </div>
    </section>
  );
};

export default InnovativeLearning;
