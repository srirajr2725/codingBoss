import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaCode, FaArrowRight, FaRocket, FaLightbulb, FaLock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Test.css';

// Local Image Imports
import mcqImg from './images/mcq-test.png';
import progImg from './images/programming-test.png';

const Test = () => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = React.useState(false);

  const handleLaunchCodeLab = () => {
    setIsLaunching(true);

    // Premium delay for the 'Ultra' experience
    setTimeout(() => {
      navigate('/ProgrammingTestPage');
    }, 2000);
  };

  return (
    <>
      {/* ELITE ULTRA LAUNCH OVERLAY */}
      {isLaunching && (
        <div className="elite-launch-overlay">
          <div className="elite-launch-content">
            <div className="elite-rocket-glow">
              <FaRocket className="elite-rocket-icon" />
            </div>
            <h1 className="elite-launch-title"> CODE <span> THE </span> FUTURE</h1>
            <p className="elite-launch-subtitle">Securing your professional coding environment...</p>
            <div className="elite-loading-bar-container">
              <div className="elite-loading-bar-progress"></div>
            </div>
          </div>
        </div>
      )}
      <div className="task-container">
        {/* Light Mode Ultra UI Animated Background */}
        <div className="task-glow-light task-glow-1"></div>
        <div className="task-glow-light task-glow-2"></div>

        <div className="task-content-wrapper">
          <header className="task-header">
            <div className="task-tag">🚀 Ready to Level Up?</div>
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
              <div className="task-card-content">
                <div className="task-icon-box" style={{ background: 'rgba(255, 160, 3, 0.1)' }}>
                  <FaClipboardList size={28} color="#FFA003" />
                </div>
                <h2>OneMark Hub</h2>
                <p>
                  Evaluate your theoretical understanding of core concepts. This multiple-choice assessment covers advanced syntax, logic, and architecture.
                </p>
                <button className="task-btn task-btn-mcq" onClick={() => navigate('/TestPage')}>
                  Start OneMark Hub Assessment <FaArrowRight />
                </button>
              </div>
            </div>

            {/* PROGRAMMING TEST CARD */}
            <div className="task-card">
              <div className="task-badge">LIVE LAB</div>
              <div className="task-img-wrapper">
                <img
                  className="task-img"
                  src={progImg}
                  alt="Programming Test"
                />
              </div>
              <div className="task-card-content">
                <div className="task-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <FaCode size={28} color="#6366f1" />
                </div>
                <h2>Code Practice Challenge</h2>
                <p>
                  Bridge the gap between theory and practice. Solve real-world programming challenges and write production-grade code in our live environment.
                </p>
                <button className="task-btn task-btn-code" onClick={handleLaunchCodeLab}>
                  Launch Code Lab <FaRocket style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
          </div>

          <div className="task-pro-tip glass-light">
            <div className="d-flex align-items-center gap-3">
              <div className="pro-tip-icon">
                <FaLightbulb color="#FFA003" size={24} />
              </div>
              <div>
                <h6 className="mb-1" style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>Pro Tip:</h6>
                <p className="mb-0" style={{ fontSize: '0.95rem', color: '#64748b' }}>
                  Ensure you have a stable internet connection and at least 30 minutes of focused time before starting an assessment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Test;
