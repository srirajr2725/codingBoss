import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import './UserReview.css';

// Import images
import userimage1 from './images/linkedin Photo.jpg';
import userimage2 from './images/THAMO.jpeg';
import userimage3 from './images/Vikram.jpg';

const UserReview = () => {
  const testimonials = [
    {
      name: "Ajay Kishore",
      img: "https://media.licdn.com/dms/image/v2/D5603AQFgHa1YnyVabw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727194794036?e=1736380800&v=beta&t=E3ONwPzY1rD2OqhuZ5-JPgjJAZspkvIyRsceDKYwwlg",
      text: "Free, fun way to learn a lot of different important coding concepts. The challenges are real-world focused.",
      rating: 5
    },
    {
      name: "Mathankumar",
      img: "https://media.licdn.com/dms/image/v2/D5603AQElpYKHsy5-jQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1727504461148?e=1736380800&v=beta&t=TF7EOrW6JBAIUXDYGAm4Jqe7WYJ_EmmHmySXCiJFRtU",
      text: "Online code processing is fast, allows for own user input. The design is quite good. A lot of how a challenge goes is dependent on how the author writes it.",
      rating: 5
    },
    {
      name: "Naveenkumar",
      img: userimage1,
      text: "The platform is intuitive and allows for hands-on practice that solidifies learning. Highly recommended for students.",
      rating: 5
    },
    {
      name: "Thamodharan",
      img: userimage2,
      text: "I appreciate the community support and the diverse challenges available. It's a great place to grow.",
      rating: 5
    },
    {
      name: "Vikram",
      img: userimage3,
      text: "The tutorials are well-structured, making it easy to follow along. The UI is clean and distraction-free.",
      rating: 5
    }
  ];

  return (
    <div className="user-review-section">
      <Container>
        <div className="section-header text-center">
          <span className="badge-premium">TESTIMONIALS</span>
          <h2 className="resources-heading">
            Resources for our learners, <span className="highlight-orange">Get inspired</span>
          </h2>
          <p className="resources-subtext">Real experiences from our community of achievers</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card-wrapper">
              <Card className="testimonial-card">
                <div className="quote-icon"><FaQuoteLeft /></div>
                <Card.Body>
                  <div className="user-info">
                    <img src={item.img} alt={item.name} className="user-avatar" />
                    <div>
                      <h4 className="user-name">{item.name}</h4>
                      <div className="stars">
                        {[...Array(item.rating)].map((_, i) => <FaStar key={i} />)}
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-text">“{item.text}”</p>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default UserReview;
