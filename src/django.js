import React from 'react';
import { Container, Row, Col, ListGroup, Card, Button, Badge } from 'react-bootstrap';
import { FaPlayCircle, FaCheckCircle, FaClock, FaLayerGroup } from 'react-icons/fa';

const CourseDjango = () => {
  // In a real app, you would fetch this from an API using the course ID
  const courseDetails = {
    title: "Django Web Framework",
    description: "Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. Built by experienced developers, it takes care of much of the hassle of web development.",
    duration: "10 Hours",
    level: "Intermediate",
    curriculum: [
      { title: "Introduction to Django", duration: "45 mins" },
      { title: "Setting up Models & Databases", duration: "1.5 hours" },
      { title: "URL Routing and Views", duration: "1 hour" },
      { title: "Templates and Static Files", duration: "2 hours" },
      { title: "Django Admin Customization", duration: "1 hour" },
      { title: "Building a REST API with DRF", duration: "3 hours" }
    ],
    features: ["Hands-on Projects", "Certificate of Completion", "Expert Support"]
  };

  return (
    <Container className="py-5">
      <Row>
        {/* Left Side: Info & Curriculum */}
        <Col lg={8}>
          <h1 className="display-4 mb-3"><b>{courseDetails.title}</b></h1>
          <p className="lead text-muted mb-4">{courseDetails.description}</p>

          <h3 className="mb-3 mt-5">Course Curriculum</h3>
          <ListGroup variant="flush" className="shadow-sm rounded">
            {courseDetails.curriculum.map((item, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-3">
                <span><FaPlayCircle className="text-primary me-3" /> {item.title}</span>
                <Badge bg="light" text="dark">{item.duration}</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Right Side: Sidebar Stats */}
        <Col lg={4}>
          <Card className="shadow border-0 sticky-top" style={{ top: '20px' }}>
            <Card.Body className="p-4">
              <h4 className="mb-4">Course Info</h4>
              <div className="mb-3 d-flex align-items-center">
                <FaClock className="me-3 text-secondary" /> 
                <strong>Duration:</strong> <span className="ms-auto">{courseDetails.duration}</span>
              </div>
              <div className="mb-4 d-flex align-items-center">
                <FaLayerGroup className="me-3 text-secondary" /> 
                <strong>Level:</strong> <span className="ms-auto">{courseDetails.level}</span>
              </div>

              <hr />

              <h5 className="mt-4 mb-3">Key Features</h5>
              {courseDetails.features.map((feature, index) => (
                <div key={index} className="mb-2">
                  <FaCheckCircle className="text-success me-2" /> {feature}
                </div>
              ))}

              <Button variant="primary" size="lg" className="w-100 mt-4 py-3">
                Enroll Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDjango;
