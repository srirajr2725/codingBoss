import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './courses.css';

const Courses = ({ }) => {
  const [showMore, setShowMore] = useState({}); // State to track expanded cards

  const toggleDetails = (cardId) => {
    setShowMore((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };



  return (
    <>

      <Container className="courses-section">
        <h2 className="text-center my-4">Courses Offered</h2>
        <Row className="justify-content-center">
          {/* Java Programming Card */}
          <Col xs={12} md={6} lg={4} className="d-flex align-items-stretch">
            <Card className="glass-card">
              <Card.Img
                variant="top"
                src="https://static.vecteezy.com/system/resources/previews/022/100/210/original/java-logo-transparent-free-png.png"
                alt="Java Programming Logo"
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center">Java Programming</Card.Title>
                <Card.Text className="text-center">Duration: 3 Months</Card.Text>
                <Card.Text className="text-center">Topics: 10 Chapters</Card.Text>
                
                {/* Toggle Details Button */}
                <Button
                  variant="link"
                  className="text-center"
                  onClick={() => toggleDetails('java')}
                >
                  {showMore['java'] ? '-' : '+'} Show More
                </Button>
                
                {/* Conditionally Render the Back Side */}
                {showMore['java'] && (
                  <div className="back-side">
                    <Link to="/CourseJava" className="w-100">
                      <Button className="view">Start Course</Button>
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Python Programming Card */}
          <Col xs={12} md={6} lg={4} className="d-flex align-items-stretch">
            <Card className="glass-card">
          
              <Card.Img
                variant="top"
                src="https://media.licdn.com/dms/image/D5612AQHkSUwQVW4UAQ/article-cover_image-shrink_600_2000/0/1707907782041?e=2147483647&v=beta&t=bFvrpLM5SHU8v0vPcutHfUGccdtJayQSyMcmMlurwws"
                alt="Python Programming Logo"
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center">Python Essentials</Card.Title>
                <Card.Text className="text-center">Duration: 3 Months</Card.Text>
                <Card.Text className="text-center">Topics: 10 Chapters</Card.Text>
                <Button className="view">Start Course</Button>
                {/* <button style={styles.startButton}>Start Course</button>  */}
                {/* Toggle Details Button */}
                <Button
                  variant="link"
                  className="text-center"
                  onClick={() => toggleDetails('python')}
                >
                  {showMore['python'] ? '-' : '+'} Show More
                </Button>

                {/* Conditionally Render the Back Side */}
                {showMore['python'] && (
                  <div className="back-side">
                    <Link to="/CoursePython" className="w-100">
                      <Button className="view">Start Course</Button>
                      {/* <Button style={styles.startButton}>Start Course</Button>  */}
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Data Structures and Algorithms Card */}
          <Col xs={12} md={6} lg={4} className="d-flex align-items-stretch">
            <Card className="glass-card">
              <Card.Img
                variant="top"
                src="https://play-lh.googleusercontent.com/a4Xrc-8oQLu05mOrNPuvA_o2nZEIEnOoTH4wB91Slw_hCvuIu_Qgi440bK9mC8ml-KA=w600-h300-pc0xffffff-pd"
                alt="Data Structures and Algorithms Logo"
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center">Data Structures & Algorithms</Card.Title>
                <Card.Text className="text-center">Duration: 3 Months</Card.Text>
                <Card.Text className="text-center">Topics: 10 Chapters</Card.Text>

                {/* Toggle Details Button */}
                <Button
                  variant="link"
                  className="text-center"
                  onClick={() => toggleDetails('dsA')}
                >
                  {showMore['dsA'] ? '-' : '+'} Show More
                </Button>

                {/* Conditionally Render the Back Side */}
                {showMore['dsA'] && (
                  <div className="back-side">
                    <Link to="/CourseDSA" className="w-100">
                      <Button className="view">Start Course</Button>
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Courses;
