import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './UserReview.css'; // Import the CSS for styling
import userimage from './images/Arun photo.jpg';
import userimage1 from './images/linkedin Photo.jpg';
import userimage2 from './images/THAMO.jpeg';
import userimage3 from './images/Vikram.jpg';

const UserReview = () => {
  return (
    <Container className="resources-container my-5">
      <Row className="mb-4">
        <Col>
          <h2 className="resources-heading text-center">
            <b>Resources for our learners,</b> <span className="attract"><b>Get inspired</b></span>
          </h2>
          <h2 className="resources-subheading text-center">
            <b>👇 Real experiences from our community 👇</b>
          </h2>
        </Col>
      </Row>
      <div className="scroll-container">
        <div className="scroll-track">
          <Col xs={12} md={4} className="d-flex align-items-stretch">
            <Card className="glass-view text-center">
              <Card.Img
                variant="top"
                src="https://media.licdn.com/dms/image/v2/D5603AQFgHa1YnyVabw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727194794036?e=1736380800&v=beta&t=E3ONwPzY1rD2OqhuZ5-JPgjJAZspkvIyRsceDKYwwlg"
                className="user-profile mx-auto mt-3 rounded-circle"
                alt="user1"
              />
              <Card.Body>
                <Card.Title>Ajay Kishore</Card.Title>
                <Card.Text>
                  <p className="text-warning">⭐⭐⭐⭐⭐</p>
                  <p style={{ color: 'gray' }}>
                    “Free, fun way to learn a lot of different important coding concepts...”
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4} className="d-flex align-items-stretch">
            <Card className="glass-view text-center">
              <Card.Img
                variant="top"
                src="https://media.licdn.com/dms/image/v2/D5603AQElpYKHsy5-jQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1727504461148?e=1736380800&v=beta&t=TF7EOrW6JBAIUXDYGAm4Jqe7WYJ_EmmHmySXCiJFRtU"
                className="user-profile mx-auto mt-3 rounded-circle"
                alt="user2"
              />
              <Card.Body>
                <Card.Title>Mathankumar</Card.Title>
                <Card.Text>
                  <p className="text-warning">⭐⭐⭐⭐⭐</p>
                  <p style={{ color: 'gray' }}>
                    “Online code processing is fast, allows for own user input. The design is quite good. A lot of how a “challenge” goes is dependent on how the author writes it, but I find a lot of them to be designed well.”
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4} className="d-flex align-items-stretch">
            <Card className="glass-view text-center">
              <Card.Img
                variant="top"
                src={userimage}
                className="user-profile mx-auto mt-3 rounded-circle"
                alt="user3"
              />
              <Card.Body>
                <Card.Title>Arun</Card.Title>
                <Card.Text>
                  <p className="text-warning">⭐⭐⭐⭐⭐</p>
                  <p style={{ color: 'gray' }}>
                    “As someone new to the tech industry, Thiran 360 provides an avenue to learn new concepts without too much cost or effort.”
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4} className="d-flex align-items-stretch">
            <Card className="glass-view text-center">
              <Card.Img
                variant="top"
                src={userimage1}
                className="user-profile mx-auto mt-3 rounded-circle"
                alt="user4"
              />
              <Card.Body>
                <Card.Title>Naveenkumar</Card.Title>
                <Card.Text>
                  <p className="text-warning">⭐⭐⭐⭐⭐</p>
                  <p style={{ color: 'gray' }}>
                    “The platform is intuitive and allows for hands-on practice that solidifies learning.”
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4} className="d-flex align-items-stretch">
            <Card className="glass-view text-center">
              <Card.Img
                variant="top"
                src={userimage2}
                className="user-profile mx-auto mt-3 rounded-circle"
                alt="user5"
              />
              <Card.Body>
                <Card.Title>Thamodharan</Card.Title>
                <Card.Text>
                  <p className="text-warning">⭐⭐⭐⭐⭐</p>
                  <p style={{ color: 'gray' }}>
                    “I appreciate the community support and the diverse challenges available.”
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4} className="d-flex align-items-stretch">
            <Card className="glass-view text-center">
              <Card.Img
                variant="top"
                src={userimage3}
                className="user-profile mx-auto mt-3 rounded-circle"
                alt="user6"
              />
              <Card.Body>
                <Card.Title>Vikram</Card.Title>
                <Card.Text>
                  <p className="text-warning">⭐⭐⭐⭐⭐</p>
                  <p style={{ color: 'gray' }}>
                    “The tutorials are well-structured, making it easy to follow along.”
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </div>
      </div>
    </Container>
  );
};

export default UserReview;
