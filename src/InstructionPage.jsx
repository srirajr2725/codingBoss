import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Clock, 
  FileCheck, 
  Shield, 
  Save,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import Navbar from '../src/NavbarComponent';
import './InstructionPage.css'; // Import the external CSS file

const InstructionPage = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);
  
  // Animation effect when component mounts
  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 300);
    
    // Add animation class to elements sequentially
    const elements = document.querySelectorAll('.animate-in');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('show');
      }, 500 + (index * 150));
    });

    // Scroll listener to handle button animation
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Set a timeout to turn off the scrolling state
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const handleStartAssessment = () => {
    const button = document.querySelector('.start-button');
    button.classList.add('clicked');
    
    setTimeout(() => {
      navigate('/Assignments');
    }, 600);
  };

  return (
    <div className="instruction-page-container">
      <Navbar
        isLoggedIn={isLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <div className={`instruction-content ${isReady ? 'content-ready' : ''}`}>
        <div className="instruction-card">
          {/* Premium glossy header section with refined gradient */}
          <div className="instruction-header">
            <div className="header-pattern"></div>
            <div className="header-content animate-in">
              <h1>Coding Assessment Instructions</h1>
              <p>Please review the following guidelines carefully before beginning your coding challenge</p>
            </div>
          </div>
          {/* Main content with refined styling */}
          <div className="instruction-body">
            {/* Important Guidelines with enhanced styling */}
            <div className="instruction-section animate-in">
              <h2 className="section-title">
                <Shield className="section-icon" size={24} />
                Important Guidelines
              </h2>
              <div className="guidelines-grid">
                <div className="guideline-card blue-card animate-in">
                  <div className="icon-container blue-icon">
                    <Clock size={20} />
                  </div>
                  <div className="guideline-content">
                    <h3>Time Management</h3>
                    <p>You have 90 minutes to complete all programming questions. Plan accordingly as problems vary in complexity.</p>
                  </div>
                </div>
                <div className="guideline-card indigo-card animate-in">
                  <div className="icon-container indigo-icon">
                    <FileCheck size={20} />
                  </div>
                  <div className="guideline-content">
                    <h3>Code Standards</h3>
                    <p>Write clean, efficient code with proper commenting. Your code will be evaluated for functionality and quality.</p>
                  </div>
                </div>

                <div className="guideline-card purple-card animate-in">
                  <div className="icon-container purple-icon">
                    <Save size={20} />
                  </div>
                  <div className="guideline-content">
                    <h3>Auto-Saving</h3>
                    <p>Your code is automatically saved every 30 seconds. Don't rely solely on this feature—use the save button frequently.</p>
                  </div>
                </div>

                <div className="guideline-card teal-card animate-in">
                  <div className="icon-container teal-icon">
                    <Code size={20} />
                  </div>
                  <div className="guideline-content">
                    <h3>Programming Questions</h3>
                    <p>You will be presented with a list of programming questions that you need to solve within the time limit.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Browser Tab Warning with enhanced styling */}
            <div className="instruction-section animate-in">
              <h2 className="section-title">
                <AlertTriangle className="section-icon" size={24} />
                Important Restrictions
              </h2>
              <div className="support-container warning-container">
                <div className="alert-icon warning-icon">
                  <ExternalLink size={20} />
                </div>
                <div className="support-content">
                  <h3>Browser Tab Restrictions</h3>
                  <p>
                    <strong>Do not switch to any other tab during the assessment.</strong> Switching tabs or attempting 
                    to navigate away from this page will be logged and may result in disqualification.
                  </p>
                </div>
              </div>
              
              <div className="support-container warning-container animate-in" style={{ marginTop: "20px" }}>
                <div className="alert-icon warning-icon">
                  <Copy size={20} />
                </div>
                <div className="support-content">
                  <h3>No Copy-Pasting</h3>
                  <p>
                    <strong>Copy-pasting is strictly prohibited.</strong> All code must be written by you during the 
                    assessment. Copy-paste attempts will be detected and may result in immediate disqualification.
                  </p>
                </div>
              </div>
            </div>

            {/* Removed original button since we're using the sticky one that follows scroll */}
            
            {/* Footer notice */}
            <p className="footer-notice animate-in">
              By proceeding, you agree that all code submitted is your original work and adheres to our academic integrity policy.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky button container that moves with scroll but remains visible */}
      <div className={`sticky-button-container ${isScrolling ? 'scrolling' : ''}`}>
        <button
          onClick={handleStartAssessment}
          className="start-button sticky-button"
        >
          <span>Start Coding Challenge</span>
          <ArrowRight className="button-icon" size={20} />
        </button>
      </div>
    </div>
  );
};

export default InstructionPage;