import React, { useState, useEffect } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaCheckCircle, FaClipboardList, FaClock, FaRocket, FaChevronRight, FaLock } from 'react-icons/fa';
import apiClient from './utils/apiClient';
import './Assignment.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [assignmentMeta, setAssignmentMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const details = await apiClient('compiler/assignments/1/details/', 'GET');
        if (details && details.questions) {
          setQuestions(details.questions);
        }

        const metaList = await apiClient('compiler/get-assignments/', 'GET');
        if (Array.isArray(metaList) && metaList.length > 0) {
          setAssignmentMeta(metaList[0]);
        }
      } catch (error) {
        console.error('Error fetching assignment data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignmentData();
  }, []);

  const renderStatCard = (icon, value, label) => (
    <Col md={3} sm={6}>
      <div className="as-stat-card-glass">
        <div className="as-stat-icon-wrapper">{icon}</div>
        <div className="as-stat-value">{value}</div>
        <div className="as-stat-label">{label}</div>
      </div>
    </Col>
  );

  const renderAssessmentCards = (type) => {
    if (loading) {
      return <Col className="text-center py-5"><div className="spinner-border text-warning" role="status"></div></Col>;
    }

    const cardsData = type === 'pending'
      ? (questions.length > 0 ? questions : [{ title: 'Assessment 1', imageUrl: 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg', expireDate: '3 days more' }])
      : [{ title: 'Assessment 1', imageUrl: 'https://media.istockphoto.com/id/1490683819/photo/mission-achievement-strategic-planning-and-success-in-business-completing-the-task-and.jpg?s=612x612&w=0&k=20&c=SZEJ82DtCwHxxLGBMNBRF6EkGx78vnqNNH94KplV22c=', score: '85%' }];

    return cardsData.map((data, index) => {
      const isRealData = !!data.question;
      const title = isRealData ? data.question : data.title;
      const level = isRealData ? data.level : 'Low';
      const desc = isRealData ? data.description : 'Click to start the assessment.';
      const img = isRealData ? 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg' : data.imageUrl;

      return (
        <Col md={4} key={index} className="mb-4">
          <div className="as-premium-card">
            <div className="as-card-img-wrapper">
              <img src={img} className="as-card-img" alt="" />
              <Badge 
                className="as-level-badge"
                bg={level === 'High' ? 'danger' : level === 'Medium' ? 'warning' : 'info'}
              >
                {level}
              </Badge>
            </div>
            <div className="as-card-content">
              <h3 className="as-card-title">{title.length > 55 ? `${title.substring(0, 55)}...` : title}</h3>
              <p className="as-card-desc">{desc.length > 90 ? `${desc.substring(0, 90)}...` : desc}</p>
              
              {type === 'pending' ? (
                <button 
                  className="as-btn-launch"
                  onClick={() => isRealData ? navigate('/QuestionPage', { state: { questionId: data.id, question: data } }) : navigate('/instructions')}
                >
                  Start Assessment <FaChevronRight />
                </button>
              ) : (
                <div className="as-score-badge">Final Score: {data.score || 'N/A'}</div>
              )}
            </div>
          </div>
        </Col>
      );
    });
  };

  return (
    <div className="as-portal-wrapper animate-fade-in">
      {/* ── PORTAL HEADER ── */}
      <div className="as-main-header-card">
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="as-title-main">
              Programming <span style={{ color: '#f59e0b' }}>Assignment #1</span>
            </h1>
            <div className="as-meta-row">
              <div className="as-meta-item">
                <Badge className="as-status-badge" bg={assignmentMeta?.status === 'Active' ? 'success' : 'secondary'}>
                  {assignmentMeta?.status || 'Active'}
                </Badge>
              </div>
              <div className="as-meta-item"><FaClock /> {assignmentMeta?.time || '06:00:00'} Remaining</div>
              <div className="as-meta-item"><FaClipboardList /> Deadline: {assignmentMeta?.date_of_expiry || '2026-03-19'}</div>
            </div>
          </Col>
          <Col md={4} className="text-md-end d-none d-md-block">
             <FaRocket size={60} style={{ color: '#f59e0b', opacity: 0.1 }} />
          </Col>
        </Row>
      </div>

      {/* ── STATS ROW ── */}
      <Row className="g-4">
        {renderStatCard(<FaQuestionCircle />, questions.length, 'Questions Available')}
        {renderStatCard(<FaCheckCircle />, 0, 'Completed')}
        {renderStatCard(<FaClipboardList />, questions.length, 'Remaining')}
        {renderStatCard(<FaClock />, '30m', 'Avg Time')}
      </Row>

      {/* ── PENDING ASSESSMENTS ── */}
      <div className="as-section-header-row">
        <h4 className="as-section-h4">Pending Assessments</h4>
      </div>
      <Row>{renderAssessmentCards('pending')}</Row>

      {/* ── COMPLETED ASSESSMENTS ── */}
      <div className="as-section-header-row">
        <h4 className="as-section-h4" style={{ color: '#10b981' }}>Completed Assessments</h4>
      </div>
      <Row>{renderAssessmentCards('completed')}</Row>
    </div>
  );
};

export default Dashboard;
