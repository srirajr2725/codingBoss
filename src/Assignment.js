import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaCheckCircle, FaClipboardList, FaClock } from 'react-icons/fa';
import apiClient from './utils/apiClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [assignmentMeta, setAssignmentMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        // Fetch Details (Questions)
        const details = await apiClient('compiler/assignments/1/details/', 'GET');
        if (details && details.questions) {
          setQuestions(details.questions);
        }

        // Fetch Metadata (Status/Time/Expiry)
        const metaList = await apiClient('compiler/get-assignments/', 'GET');
        if (Array.isArray(metaList) && metaList.length > 0) {
          setAssignmentMeta(metaList[0]); // Assuming assignment ID 1 for now
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
    <Col md={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
      <Card style={{ padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ marginBottom: '10px', fontSize: '24px', color: '#007bff' }}>{icon}</div>
        <h5 style={{ color: '#333', marginBottom: '5px' }}>{value}</h5>
        <p style={{ color: '#777', margin: 0 }}>{label}</p>
      </Card>
    </Col>
  );

  const renderAssessmentCards = (type) => {
    if (loading) {
      return (
        <Col className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Col>
      );
    }

    const cardsData =
      type === 'pending'
        ? questions.length > 0
          ? questions
          : [
              { title: 'Assessment 1', imageUrl: 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg', expireDate: '3 days more' },
            ]
        : [
            { title: 'Assessment 1', imageUrl: 'https://media.istockphoto.com/id/1490683819/photo/mission-achievement-strategic-planning-and-success-in-business-completing-the-task-and.jpg?s=612x612&w=0&k=20&c=SZEJ82DtCwHxxLGBMNBRF6EkGx78vnqNNH94KplV22c=', score: '85%' },
          ];

    return cardsData.map((data, index) => {
      const isRealData = !!data.question;
      const title = isRealData ? data.question : data.title;
      const level = isRealData ? data.level : 'Low';
      const desc = isRealData ? data.description : 'Click to start the assessment.';
      const img = isRealData ? 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg' : data.imageUrl;

      return (
        <Col md={4} key={index} className="mb-4">
          <Card className="h-100 shadow-sm" style={{ textAlign: 'center', padding: '15px', borderRadius: '12px', border: 'none', transition: 'transform 0.2s' }}>
            <div style={{ position: 'relative' }}>
              <Card.Img
                variant="top"
                src={img}
                alt="Assessment Image"
                style={{ borderRadius: '8px', marginBottom: '15px', height: '160px', objectFit: 'cover' }}
              />
              {isRealData && (
                <Badge 
                  bg={level === 'High' ? 'danger' : level === 'Medium' ? 'warning' : 'info'} 
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                  {level}
                </Badge>
              )}
            </div>
            <Card.Body className="d-flex flex-column p-0">
              <Card.Title style={{ color: '#333', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {title.length > 50 ? `${title.substring(0, 50)}...` : title}
              </Card.Title>
              <Card.Text style={{ color: '#666', fontSize: '0.9rem', flexGrow: 1 }}>
                {desc.length > 80 ? `${desc.substring(0, 80)}...` : desc}
              </Card.Text>
              
              <div className="mt-auto">
                {type === 'pending' ? (
                  <Button
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      padding: '8px 24px',
                      borderRadius: '6px',
                      marginTop: '15px',
                      border: 'none',
                      fontWeight: '500',
                      width: '100%'
                    }}
                    onClick={() => isRealData ? navigate('/QuestionPage', { state: { questionId: data.id, question: data } }) : navigate('/instructions')}
                  >
                    Start Now
                  </Button>
                ) : (
                  <div style={{ color: '#28a745', fontWeight: 'bold', marginTop: '10px' }}>
                    Score: {data.score || 'N/A'}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      );
    });
  };

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm p-3" style={{ background: '#f8f9fa', borderRadius: '12px', border: 'none' }}>
            <Row className="align-items-center">
              <Col md={8}>
                <h3 className="fw-bold mb-1" style={{ color: '#007bff' }}>Programming Assignment #1</h3>
                <div className="d-flex gap-3 mt-2">
                  <Badge bg={assignmentMeta?.status === 'Active' ? 'success' : 'secondary'}>
                    Status: {assignmentMeta?.status || 'Active'}
                  </Badge>
                  <span className="text-muted"><FaClock /> Time: {assignmentMeta?.time || '06:00:00'}</span>
                  <span className="text-muted"><FaClipboardList /> Expiry: {assignmentMeta?.date_of_expiry || '2026-03-19'}</span>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                {assignmentMeta && (new Date(`${assignmentMeta.date_of_expiry}T${assignmentMeta.time}`) < new Date()) ? (
                  <Badge bg="danger" className="p-2">PROG ASSIGNMENT EXPIRED</Badge>
                ) : (
                  <Badge bg="info" className="p-2">SUBMISSION OPEN</Badge>
                )}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row>
        {renderStatCard(<FaQuestionCircle size={40} />, questions.length, 'Questions Available')}
        {renderStatCard(<FaCheckCircle size={40} />, 0, 'Completed')}
        {renderStatCard(<FaClipboardList size={40} />, questions.length, 'Remaining')}
        {renderStatCard(<FaClock size={40} />, '30m', 'Avg Time')}
      </Row>

      <Row style={{ marginTop: '40px' }}>
        <Col md={12}>
          <Card style={{ padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#007bff' }}>Pending Assessments</h4>
            <Row>{renderAssessmentCards('pending')}</Row>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '40px' }}>
        <Col md={12}>
          <Card style={{ padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#28a745' }}>Completed Assessments</h4>
            <Row>{renderAssessmentCards('completed')}</Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
