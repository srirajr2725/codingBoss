import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaCheckCircle, FaClipboardList } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();

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
    const cardsData =
      type === 'pending'
        ? [
            { title: 'Assessment 1', imageUrl: 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg', expireDate: '3 days more' },
            { title: 'Assessment 2', imageUrl: 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg', expireDate: '2 days more' },
            { title: 'Assessment 3', imageUrl: 'https://www.taxscan.in/wp-content/uploads/2017/01/Re-Assessment-Taxscan.jpg', expireDate: '1 day more' },
          ]
        : [
            { title: 'Assessment 1', imageUrl: 'https://media.istockphoto.com/id/1490683819/photo/mission-achievement-strategic-planning-and-success-in-business-completing-the-task-and.jpg?s=612x612&w=0&k=20&c=SZEJ82DtCwHxxLGBMNBRF6EkGx78vnqNNH94KplV22c=', score: '85%' },
            { title: 'Assessment 2', imageUrl: 'https://media.istockphoto.com/id/1490683819/photo/mission-achievement-strategic-planning-and-success-in-business-completing-the-task-and.jpg?s=612x612&w=0&k=20&c=SZEJ82DtCwHxxLGBMNBRF6EkGx78vnqNNH94KplV22c=', score: '70%' },
            { title: 'Assessment 3', imageUrl: 'https://media.istockphoto.com/id/1490683819/photo/mission-achievement-strategic-planning-and-success-in-business-completing-the-task-and.jpg?s=612x612&w=0&k=20&c=SZEJ82DtCwHxxLGBMNBRF6EkGx78vnqNNH94KplV22c=', score: '90%' },
          ];

    return cardsData.map((data, index) => (
      <Col md={4} key={index}>
        <Card style={{ textAlign: 'center', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
          <Card.Img
            variant="top"
            src={data.imageUrl}
            alt="Assessment Image"
            style={{ borderRadius: '8px', marginBottom: '15px' }}
          />
          <Card.Body>
            <Card.Title style={{ color: '#333' }}>{data.title}</Card.Title>
            <Card.Text style={{ color: '#777' }}>
              {type === 'pending' ? data.expireDate : `Score: ${data.score}`}
            </Card.Text>
            {type === 'pending' && (
              <Button
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  marginTop: '15px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/instructions')}
                
              >
                Start Now
              </Button>
            )}
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  return (
    
    <div>
      <Row>
        {renderStatCard(<FaQuestionCircle size={40} />, 0, 'Questions Solved')}
        {renderStatCard(<FaCheckCircle size={40} />, 0, 'Practice Package')}
        {renderStatCard(<FaClipboardList size={40} />, 0, 'Assessment Pending')}
        {renderStatCard(<FaClipboardList size={40} />, '0%', 'Avg Assessment Marks')}
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
    </div>
  );
};

export default Dashboard;
