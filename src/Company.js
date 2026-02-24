import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Button, Container, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faMoneyBillWave, faUsers, faClock, faCheckCircle,   faLock } from '@fortawesome/free-solid-svg-icons';
import { faLaptopCode, faMobileAlt, faRobot, faDatabase, faCode, faServer, faBullhorn, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import Navbar from './NavbarComponent';
import { useNavigate } from 'react-router-dom';
import Thiran360Logo from "./images/t360logo.png";
import DigitalSolutionsLogo from "./images/digital-solutions.png";
import CloudSystemsLogo from "./images/cloud-systems.png";
import DataAnalyticsLogo from "./images/data-analytics.png";
import MobileSolutionsLogo from "./images/mobile-solutions.png";

const styles = {
  cardAnimations: `
    .card-animation-1:hover {
      transform: translateY(-10px) rotateZ(1deg);
      box-shadow: 0 20px 30px rgba(0,0,0,0.1);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .card-animation-2:hover {
      transform: scale(1.02);
      box-shadow: 0 15px 25px rgba(0,0,0,0.08);
      transition: all 0.3s ease-out;
    }
    .card-animation-3:hover {
      transform: translateX(5px);
      box-shadow: 8px 10px 20px rgba(0,0,0,0.12);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .card-animation-4:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 15px 30px rgba(2, 117, 216, 0.15);
      border-color: #0275d8;
      transition: all 0.35s ease-in-out;
    }
    .card-animation-5:hover {
      transform: rotateX(5deg);
      box-shadow: 0 30px 40px -20px rgba(0,0,0,0.2);
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-apply:hover .btn-animation {
      transform: scale(2);
      opacity: 1;
    }
    .company-logo:hover {
      transform: rotate(5deg) scale(1.1);
    }
    .blur-card {
      filter: blur(5px) !important;
      opacity: 0.7 !important;
      pointer-events: none !important;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(46, 125, 50, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
    }
    .lock-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      width: 100px;
      height: 100px;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
    .lock-icon {
      font-size: 44px;
      color: #fff;
    }
    .success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .success-message {
      background-color: white;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
};

const CompanyCards = ({progress, setSelectedTab}) => {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    isSuccess: true,
    profileCompletion: 0
  });
  const [stylesApplied, setStylesApplied] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!stylesApplied) {
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.innerHTML = styles.cardAnimations;
      document.head.appendChild(styleElement);
      setStylesApplied(true);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [stylesApplied]);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const mockJobs = [
          
            {
              summerIntern: "Summer Intern",
              id: 99,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "Data Science Intern",
              description:
                "Assist in data analysis, model development, and machine learning tasks. Work with large datasets to extract insights and support the development of AI-driven solutions.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 2,
              icon: faLaptopCode,
            },
             {
              summerIntern: "Summer Intern",
              id: 100,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "Cloud Computing Intern",
              description:
                "Support the development and deployment of cloud-based applications. Assist in managing cloud infrastructure, optimizing performance, and ensuring security best practices.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 2,
              icon: faLaptopCode,
            },

              {
              summerIntern: "Summer Intern",
              id: 101,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "React Developer Intern",
              description:
                "Develop user interfaces and implement frontend functionality for web applications using modern frameworks like React, Vue, and Angular. Experience with responsive design and state management required.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 2,
              icon: faLaptopCode,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 102,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "React Native Developer Intern",
              description:
                "Assist in building mobile applications using React Native. Work closely with the development team to implement features, fix bugs, and optimize app performance across iOS and Android platforms.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 0,
              icon: faMobileAlt,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 103,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "Android Java Developer Intern",
              description:
                "Assist in the development and maintenance of Android applications using Java. Work closely with the mobile development team to implement features, resolve bugs, and ensure smooth app performance.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 0,
              icon: faRobot,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 104,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "iOS Swift Developer Intern",
              description:
                "Support the development of iOS applications using Swift. Collaborate with senior developers to implement new features, fix bugs, and optimize performance for Apple devices.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 3,
              icon: faMobileAlt,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 105,
              companyId: 1,
              companyName: "Thiran360AI",
              companyLogo: Thiran360Logo,
              title: "Python Django Developer Intern",
              description:
                "Assist in developing backend services and APIs using Python and the Django framework. Work with the team to build scalable web applications and integrate databases effectively.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 1,
              icon: faCode,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 201,
              companyId: 1,
              companyName: "Thiran360AI",
              // companyLogo: Thiran360Logo,
              title: "Java Spring Boot Developer Intern",
              description:
                "Work on developing and maintaining backend services using Java and the Spring Boot framework. Collaborate with the development team to build RESTful APIs and integrate with databases.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 0,
              icon: faServer,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 202,
              companyId: 1,
              companyName: "Thiran360AI",
              // companyLogo: Thiran360Logo,
              title: "Digital Marketing Intern",
              description:
                "Assist in executing digital marketing campaigns including SEO, SEM, social media, and email marketing. Help analyze performance metrics and contribute to brand growth online.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 0,
              icon: faBullhorn,
            },
          
            {
              summerIntern: "Summer Intern",
              id: 203,
              companyId: 1,
              companyName: "Thiran360AI",
              // companyLogo: Thiran360Logo,
              title: "Node js Developer Intern",
              description:
                "Assist in developing backend services and APIs using Node js. Collaborate with the team to build scalable applications and integrate with databases and third-party services.",
              location: "Gobi Arts and Science, Gobi Techno Park",
              registered: 0,
              icon: faNetworkWired,
            },
          ];
          
        setJobCards(mockJobs);
      } catch (err) {
        setError(
          err.message || 'Failed to fetch jobs. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleEasyApply = (jobId, companyName, jobTitle) => {
  // In CompanyCards, check that you're using the prop correctly
const isProfileComplete = progress === 100;
  
    if (isProfileComplete) {
      setModalContent({
        title: "Application Submitted",
        message: `Your application for ${jobTitle} at ${companyName} has been successfully submitted.`,
        isSuccess: true,
        profileCompletion: 100
      });
    } else {
      setModalContent({
        title: "Complete Your Profile",
        message: "Please complete your profile to apply for this position.",
        isSuccess: false,
        profileCompletion: progress // Use the prop directly here
      });
    }
    
    setShowModal(true);
  };

  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  
  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', margin: '20px' }}>Error: {error}</p>;
  }

  return (
    <>
     <Container fluid className="px-3 py-4" style={{ backgroundColor: '#f8f9fa' }}>
      <h1
        className="text-center mb-4"
        style={{
          color: '#333',
          fontWeight: 'bold',
          position: 'relative',
          paddingBottom: '15px',
          fontSize: '1.8rem',
        }}
      >
        Job Opportunities
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            backgroundColor: '#0275d8',
            borderRadius: '2px',
          }}
        ></div>
      </h1>

      <Row className="g-4">
        {jobCards.map((job, index) => {
          const shouldBlur = job.id >= 201 && job.id <= 502;

          return (
            <Col xs={12} key={job.id}>
              <div style={{ position: 'relative' }}>
                <Card
                  className={`shadow-sm card-animation-${(index % 5) + 1} job-card`}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    background: 'linear-gradient(to bottom right, #ffffff, #f9f9ff)',
                    filter: shouldBlur ? 'blur(4px)' : 'none',
                    opacity: shouldBlur ? 0.7 : 1,
                    pointerEvents: shouldBlur ? 'none' : 'auto',
                  }}
                >
                  <Row className="g-0 flex-column flex-md-row">
                    {/* Company Header */}
                    <Col
  md={3}
  style={{
    padding: '30px 25px',
    backgroundColor: job.companyId === 1 ? '#f8f6ff' : '#fbfbfb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRight: '1px solid #f0f0f0',
    position: 'relative',
  }}
>
  {/* Summer Intern Badge on top */}
  <div
    style={{
      position: 'absolute',
      top: '15px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#0275d8',
      color: '#fff',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '0.8rem',
      boxShadow: '0 2px 8px rgba(2, 117, 216, 0.4)',
      userSelect: 'none',
    }}
  >
    Summer Intern
  </div>                      <div className="d-flex justify-content-center align-items-center mb-3 mt-5">
                        <img
                          src={job.companyLogo}
                          alt={`${job.companyName} logo`}
                          style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                        />
                      </div>
                      <h5 style={{ color: job.companyId === 1 ? '#513da8' : '#333', fontWeight: 'bold' }}>
                        {job.companyName}
                      </h5>
                    </Col>

                    {/* Job Content */}
                    <Col md={9} className="p-4">
                      <Card.Title
                        style={{
                          fontWeight: 'bold',
                          fontSize: '1.3rem',
                          marginBottom: '15px',
                          color: job.companyId === 1 ? '#513da8' : '#0a3975',
                        }}
                      >
                        {job.title}
                      </Card.Title>

                      <Card.Text style={{ color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                          {job.description.split('.').filter(Boolean).map((point, idx) => (
                            <li key={idx} className="mb-2">
                              {point.trim()}.
                            </li>
                          ))}
                        </ul>
                      </Card.Text>

                      <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-2">
                          <div className="d-flex align-items-center">
                            <div
                              style={{
                                backgroundColor: '#eef5ff',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '12px',
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                style={{ color: job.companyId === 1 ? '#513da8' : '#0275d8' }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#777' }}>Location</div>
                              <div style={{ fontWeight: '500' }}>{job.location}</div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6}>
                          {job.salary && <div className="d-flex align-items-center">
                            <div
                              style={{
                                backgroundColor: '#f0fff0',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '12px',
                              }}
                            >
                              <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#4caf50' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#777' }}>Salary</div>
                              <div style={{ fontWeight: '500' }}>{job.salary}</div>
                            </div>
                          </div>}
                        </Col>
                      </Row>

                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                        <div className="d-flex align-items-center mb-3 mb-md-0">
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: progress === 100 ? '#4caf50' : '#ff9800',
                              marginRight: '8px',
                            }}
                          ></div>
                          <span style={{ fontSize: '0.95rem' }}>
                            Profile {progress === 100 ? 'Complete' : `${progress}% Complete`}
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          className="btn-apply"
                          style={{
                            padding: '10px 25px',
                            borderRadius: '8px',
                            backgroundColor: job.companyId === 1 ? '#513da8' : '#0275d8',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '1rem',
                            opacity: shouldBlur ? 0.7 : 1,
                            pointerEvents: shouldBlur ? 'none' : 'auto',
                          }}
                          onClick={() =>
                            !shouldBlur && handleEasyApply(job.id, job.companyName, job.title)
                          }
                          disabled={shouldBlur}
                        >
                          Easy Apply
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* {shouldBlur && (
                  // <div className="lock-container">
                  //   <FontAwesomeIcon icon={faLock} className="lock-icon" />
                  // </div>
                )} */}
              </div>
            </Col>
          );
        })}
      </Row>
    </Container>

      {/* Application Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="md"
        backdrop="static"
      >
        <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
          <Modal.Title style={{ color: modalContent.isSuccess ? '#2e7d32' : '#d32f2f' }}>
            {modalContent.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px 30px 30px' }}>
          {modalContent.isSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#e8f5e9', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                margin: '0 auto 20px',
                animation: 'pulse 1.5s infinite' 
              }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '40px', color: '#2e7d32' }} />
              </div>
              <p style={{ fontSize: '1.1rem', color: '#333' }}>{modalContent.message}</p>
              <Button 
                variant="success" 
                onClick={() => setShowModal(false)} 
                style={{ 
                  padding: '8px 30px', 
                  borderRadius: '8px', 
                  marginTop: '10px',
                  backgroundColor: '#2e7d32',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(46, 125, 50, 0.2)'
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div style={{ padding: '10px 0' }}>
              <p style={{ fontSize: '1rem', color: '#555', marginBottom: '20px' }}>{modalContent.message}</p>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#555', fontWeight: '500' }}>Profile Completion</span>
                  <span style={{ color: '#0275d8', fontWeight: '600' }}>{modalContent.profileCompletion}%</span>
                </div>
                <div style={{ 
                  height: '10px', 
                  borderRadius: '5px', 
                  backgroundColor: '#e9ecef',
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    width: `${modalContent.profileCompletion}%`, 
                    height: '100%', 
                    backgroundColor: '#0275d8',
                    borderRadius: '5px',
                    transition: 'width 0.8s ease-in-out'
                  }}></div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowModal(false)} 
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    borderRadius: '8px',
                    backgroundColor: '#6c757d',
                    border: 'none'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTab('Profile')
                  }}
                  style={{ 
                    flex: 2, 
                    padding: '10',
                    borderRadius: '8px',
                    backgroundColor: '#0275d8',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(2, 117, 216, 0.2)'
                  }}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CompanyCards;
