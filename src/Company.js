import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaMapMarkerAlt, FaBriefcase, FaUserGraduate, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import CodingBossLogo from "./images/edu.png";
import Thiran360Logo from "./images/t360logo.png";
import './Company.css';

const CompanyCards = ({ progress, setSelectedTab }) => {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", isSuccess: true });

  useEffect(() => {
    // Mock jobs based on the previous implementation
    const mockJobs = [
      { id: 98, companyName: "CodingBoss", companyLogo: CodingBossLogo, title: "Career Development Intern", description: "Empower employability by assisting students in career development. Work on curriculum design and student engagement strategies.", location: "Gobi Techno Park", type: "Summer Intern" },
      { id: 99, companyName: "Thiran360AI", companyLogo: Thiran360Logo, title: "Data Science Intern", description: "Assist in data analysis, model development, and machine learning tasks. Work with large datasets to extract insights.", location: "Gobi Techno Park", type: "Summer Intern" },
      { id: 100, companyName: "Thiran360AI", companyLogo: Thiran360Logo, title: "Cloud Computing Intern", description: "Support the development and deployment of cloud-based applications. Assist in managing cloud infrastructure.", location: "Gobi Techno Park", type: "Summer Intern" },
      { id: 101, companyName: "Thiran360AI", companyLogo: Thiran360Logo, title: "React Developer Intern", description: "Develop user interfaces and implement frontend functionality for web applications using modern frameworks.", location: "Gobi Techno Park", type: "Summer Intern" },
      { id: 201, companyName: "Thiran360AI", companyLogo: Thiran360Logo, title: "Backend Systems Intern", description: "Work on developing and maintaining high-performance backend services using Java and Spring Boot.", location: "Remote / Office", type: "Graduate Role", locked: true },
    ];
    setJobCards(mockJobs);
    setLoading(false);
  }, []);

  const handleApply = (job) => {
    const isProfileComplete = progress === 100;
    if (isProfileComplete) {
      setModalContent({
        title: "Application Received",
        message: `Your profile has been shared with ${job.companyName}. Our HR team will contact you shortly for the ${job.title} position.`,
        isSuccess: true
      });
    } else {
      setModalContent({
        title: "Profile Incomplete",
        message: `You must complete your professional profile (100%) before applying for ${job.title}. Your current progress is ${progress}%.`,
        isSuccess: false
      });
    }
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>;

  return (
    <div className="re-container">
      <header className="re-header">
        <h1 className="re-title">Career <span>Opportunities</span></h1>
        <p className="text-muted">Explore exclusive internships and job placements curated for CodingBoss graduates.</p>
      </header>

      <div className="re-job-list">
        {jobCards.map((job) => (
          <div key={job.id} className="position-relative">
            <div className={`re-job-card ${job.locked ? 're-locked-card' : ''}`}>
              <div className="re-company-info">
                <div className="re-logo-wrapper">
                  <img src={job.companyLogo} alt={job.companyName} className="re-logo" />
                </div>
                <span className="re-company-name">{job.companyName}</span>
              </div>

              <div className="re-content">
                <div className="re-badge">{job.type}</div>
                <h2 className="re-job-title">{job.title}</h2>
                <p className="re-desc">{job.description}</p>
                <div className="re-meta-grid">
                  <div className="re-meta-item"><FaMapMarkerAlt className="re-meta-icon" /> {job.location}</div>
                  <div className="re-meta-item"><FaBriefcase className="re-meta-icon" /> Full-time Intern</div>
                </div>
              </div>

              <div className="re-actions">
                <div className="re-progress-tag" style={{ color: progress === 100 ? '#10b981' : '#FFA003' }}>
                  {progress === 100 ? <FaCheckCircle /> : <FaExclamationTriangle />} 
                  {progress === 100 ? 'QUALIFIED' : `${progress}% READY`}
                </div>
                <button 
                  className={`re-btn-apply ${job.locked ? 're-btn-disabled' : ''}`}
                  onClick={() => !job.locked && handleApply(job)}
                  disabled={job.locked}
                >
                  {job.locked ? 'LOCKED' : 'Easy Apply'}
                </button>
              </div>
            </div>
            {job.locked && (
              <div className="re-lock-overlay">
                <FaLock size={24} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="premium-modal">
        <Modal.Header closeButton style={{ border: 'none' }}>
          <Modal.Title style={{ fontWeight: 800 }}>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          {modalContent.isSuccess ? (
            <FaCheckCircle size={60} color="#10b981" className="mb-4" />
          ) : (
            <FaExclamationTriangle size={60} color="#FFA003" className="mb-4" />
          )}
          <p style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 500 }}>{modalContent.message}</p>
          {!modalContent.isSuccess && (
            <Button 
              className="mt-3 w-100 py-3" 
              style={{ background: '#0f172a', border: 'none', borderRadius: '14px', fontWeight: 800 }}
              onClick={() => { setShowModal(false); setSelectedTab('Profile'); }}
            >
              Complete Profile Now
            </Button>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CompanyCards;
