import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaCode, FaArrowRight, FaRocket, FaLightbulb } from 'react-icons/fa';
import './Test.css';

// Local Image Imports
import mcqImg from './images/mcq-test.png';
import progImg from './images/programming-test.png';

const Test = () => {
  const navigate = useNavigate();

  return (
    <div className="task-container">
      <header className="task-header">
        <h1 className="task-title">Assessment <span>Center</span></h1>
        <p className="task-subtitle">Challenge your skills and track your technical progress through our specialized testing modules.</p>
      </header>

      <div className="task-grid">
        {/* MCQ TEST CARD */}
        <div className="task-card">
          <div className="task-badge">KNOWLEDGE CHECK</div>
          <div className="task-img-wrapper">
            <img 
              className="task-img" 
              src={mcqImg} 
              alt="MCQ Test" 
            />
          </div>
          <FaClipboardList size={32} color="#FFA003" style={{ marginBottom: '16px' }} />
          <h2>MCQ Mastery</h2>
          <p>
            Evaluate your theoretical understanding of core concepts. This multiple-choice assessment covers advanced syntax, logic, and architecture.
          </p>
          <button className="task-btn task-btn-mcq" onClick={() => navigate('/TestPage')}>
            Start MCQ Assessment <FaArrowRight />
          </button>
        </div>

        {/* PROGRAMMING TEST CARD */}
        <div className="task-card">
          <div className="task-badge">PRACTICAL SKILLS</div>
          <div className="task-img-wrapper">
            <img 
              className="task-img" 
              src={progImg} 
              alt="Programming Test" 
            />
          </div>
          <FaCode size={32} color="#FFA003" style={{ marginBottom: '16px' }} />
          <h2>Code Lab Challenge</h2>
          <p>
            Bridge the gap between theory and practice. Solve real-world programming challenges and write production-grade code in our live environment.
          </p>
          <button className="task-btn task-btn-code" onClick={() => navigate('/ProgrammingTestPage')}>
            Launch Code Lab <FaRocket />
          </button>
        </div>
      </div>

      <div className="mt-5 p-4 glass" style={{ borderRadius: '24px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <div className="d-flex align-items-center gap-3">
          <FaLightbulb color="#FFA003" size={24} />
          <div>
            <h6 className="mb-1" style={{ fontWeight: 800 }}>Pro Tip:</h6>
            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
              Ensure you have a stable internet connection and at least 30 minutes of focused time before starting an assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;