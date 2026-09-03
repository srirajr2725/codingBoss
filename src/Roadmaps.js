import React, { useState, useEffect } from 'react';
import './Roadmaps.css';
import { 
  FaCode, 
  FaServer, 
  FaDatabase, 
  FaBrain, 
  FaTerminal, 
  FaLaptopCode,
  FaArrowRight,
  FaClock,
  FaLayerGroup,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from './utils/apiClient';

const getIconForRoadmap = (id) => {
  if (id === 'frontend') return <FaLaptopCode />;
  if (id === 'backend') return <FaServer />;
  if (id === 'fullstack') return <FaCode />;
  if (id === 'data-science') return <FaDatabase />;
  if (id === 'ai-ml') return <FaBrain />;
  return <FaTerminal />;
};

const roadmapDetails = {
  'frontend': [
    { title: 'Internet Fundamentals', desc: 'How does the internet work? HTTP, DNS, Browsers, and Hosting.' },
    { title: 'HTML', desc: 'Learn the basics, Semantic HTML, Forms and Validations, Accessibility.' },
    { title: 'CSS', desc: 'Learn the basics, Layouts (Flexbox/Grid), Responsive design, Preprocessors (Sass).' },
    { title: 'JavaScript', desc: 'Syntax, DOM Manipulation, Fetch API/Ajax, ES6+ features, Hoisting, Closures.' },
    { title: 'Version Control', desc: 'Git concepts, GitHub, branching, merging, pull requests.' },
    { title: 'React', desc: 'Components, Hooks, State Management (Redux/Context), Routing.' },
    { title: 'Modern CSS Frameworks', desc: 'Tailwind CSS, Styled Components, Material UI.' },
  ],
  'backend': [
    { title: 'Internet & OS', desc: 'How internet works, basic terminal commands, process management, threads.' },
    { title: 'Programming Language', desc: 'Pick one to master: Node.js, Python, Java, C#, Go or Ruby.' },
    { title: 'Version Control', desc: 'Git usage, repo management, GitHub/GitLab workflows.' },
    { title: 'Relational Databases', desc: 'PostgreSQL, MySQL, SQL commands, Normalization, ACID.' },
    { title: 'NoSQL Databases', desc: 'MongoDB, Redis, Document vs Key-Value stores.' },
    { title: 'APIs', desc: 'REST principles, JSON APIs, Authentication (JWT, OAuth), GraphQL.' },
    { title: 'Caching', desc: 'CDN, Redis, Memcached, Client-side vs Server-side caching.' },
    { title: 'Web Security', desc: 'Hashing algorithms, HTTPS, CORS, mitigating OWASP Top 10 vulnerabilities.' },
  ],
  'fullstack': [
    { title: 'Frontend Basics', desc: 'HTML, CSS, JavaScript, and responsive design principles.' },
    { title: 'Frontend Frameworks', desc: 'React, Vue, or Angular for building interactive UIs.' },
    { title: 'Backend Fundamentals', desc: 'Node.js, Python, or Java for server-side logic.' },
    { title: 'Databases', desc: 'SQL (PostgreSQL) and NoSQL (MongoDB) data modeling.' },
    { title: 'APIs & Integration', desc: 'Building RESTful APIs and connecting frontend to backend.' },
    { title: 'DevOps & Deployment', desc: 'Docker, CI/CD pipelines, AWS/Vercel/Heroku hosting.' },
  ],
  'data-science': [
    { title: 'Programming & Math', desc: 'Python basics, Statistics, Linear Algebra, and Calculus.' },
    { title: 'Data Manipulation', desc: 'Pandas, NumPy, and data cleaning techniques.' },
    { title: 'Data Visualization', desc: 'Matplotlib, Seaborn, Tableau, or PowerBI.' },
    { title: 'Machine Learning', desc: 'Scikit-Learn, Regression, Classification, Clustering.' },
    { title: 'Deep Learning', desc: 'Neural Networks, TensorFlow, or PyTorch basics.' },
    { title: 'Deployment', desc: 'Model serving with Flask/FastAPI, ML Ops basics.' },
  ],
  'ai-ml': [
    { title: 'Prerequisites', desc: 'Advanced Python, Linear Algebra, Probability & Statistics.' },
    { title: 'Machine Learning Algorithms', desc: 'Supervised and Unsupervised learning, Model evaluation.' },
    { title: 'Deep Learning Foundations', desc: 'Perceptrons, Backpropagation, CNNs, and RNNs.' },
    { title: 'Natural Language Processing', desc: 'Text processing, Word Embeddings, Transformers (BERT, GPT).' },
    { title: 'Computer Vision', desc: 'Image processing, Object detection, OpenCV.' },
    { title: 'Production AI', desc: 'TensorRT, ONNX, deploying models at scale.' },
  ],
  'systems': [
    { title: 'C & C++', desc: 'Pointers, manual memory management, templates, OOP in C++.' },
    { title: 'Computer Architecture', desc: 'CPU scheduling, caching mechanisms, instruction sets.' },
    { title: 'Operating Systems', desc: 'Processes, Threads, Concurrency, Mutexes, Deadlocks.' },
    { title: 'Networking', desc: 'TCP/IP stack, Sockets programming, HTTP internals.' },
    { title: 'Linux/Unix internals', desc: 'Bash scripting, system calls, file systems, POSIX.' },
    { title: 'Performance Optimization', desc: 'Profiling tools, assembly basics, parallel computing.' },
  ]
};

const Roadmaps = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [roadmapsData, setRoadmapsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const data = await apiClient('compiler/roadmaps/', 'GET');
        setRoadmapsData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, []);

  const handleRoadmapClick = (roadmap) => {
    if (roadmapDetails[roadmap.id]) {
      setSelectedRoadmap(roadmap);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.info(`🚀 The ${roadmap.title} detailed roadmap is currently under active development. Stay tuned!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  const handleBack = () => {
    setSelectedRoadmap(null);
  };

  if (selectedRoadmap) {
    const details = roadmapDetails[selectedRoadmap.id];
    
    return (
      <div className="roadmaps-container animate-fade-in">
        <button className="rm-back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back to all paths
        </button>
        
        <div className="rm-detail-header">
          <div className={`rm-detail-icon-wrapper ${selectedRoadmap.bgClass}`}>
            {selectedRoadmap.icon}
          </div>
          <div>
            <h1 className="rm-detail-title">{selectedRoadmap.title} Roadmap</h1>
            <p className="rm-detail-desc">{selectedRoadmap.description}</p>
          </div>
        </div>

        <div className="rm-timeline-container">
          {details.map((node, index) => (
            <div key={index} className="rm-timeline-item">
              <div className="rm-timeline-line"></div>
              <div className="rm-timeline-marker">
                <FaCheckCircle />
              </div>
              <div className="rm-timeline-content">
                <h3 className="rm-node-title">{node.title}</h3>
                <p className="rm-node-desc">{node.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="roadmaps-container animate-fade-in">
      <ToastContainer />
      
      <div className="rm-hero">
        <div className="rm-hero-content">
          <h1 className="rm-hero-title">Career Roadmaps</h1>
          <p className="rm-hero-desc">
            Step-by-step learning paths designed by industry experts. Follow a structured curriculum to master new skills and accelerate your career in technology.
          </p>
        </div>
      </div>

      <h2 className="rm-section-header">
        <FaLayerGroup style={{ color: '#3b82f6' }} /> Explore Learning Paths
      </h2>

      <div className="rm-grid">
        {loading ? (
          <div style={{ padding: '20px', color: '#64748b' }}>Loading roadmaps...</div>
        ) : roadmapsData.length > 0 ? (
          roadmapsData.map((roadmap) => (
            <div 
              key={roadmap.id} 
              className="rm-card"
              onClick={() => handleRoadmapClick(roadmap)}
            >
              <div className={`rm-card-accent ${roadmap.accent || 'accent-blue'}`}></div>
              
              <div className={`rm-card-icon-wrapper ${roadmap.bgClass || 'bg-blue'}`}>
                {roadmap.icon || getIconForRoadmap(roadmap.id)}
              </div>
              
              <h3 className="rm-card-title">{roadmap.title}</h3>
              <p className="rm-card-desc">{roadmap.description}</p>
              
              <div className="rm-card-meta">
                <div className="rm-meta-item">
                  <FaLayerGroup /> {roadmap.modules} Modules
                </div>
                <div className="rm-meta-item">
                  <FaClock /> {roadmap.time}
                </div>
                <div className="rm-meta-item" style={{ marginLeft: 'auto', color: '#3b82f6' }}>
                  View Path <FaArrowRight style={{ color: '#3b82f6' }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', color: '#64748b' }}>No roadmaps available.</div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
