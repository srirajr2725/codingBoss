import React, {  } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Test.css';

const Test = ({ }) => {
  const navigate = useNavigate();

  

  return (
    <>

      <Row>
        <Col md={6}>
          <div className="card-inner mcq-test-card">
            <img className='im' src='https://img.freepik.com/premium-vector/student-taking-online-exam-home-pandemic-elearning-education-concept_530733-1534.jpg' width={300} height={200} alt='image'/><br/>
            <h2><b>MCQ Test</b></h2>
            <p>
              This is a multiple choice question test. You will be presented with a series of questions, and you need to choose the correct answer from the options provided.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/TestPage')}>
              Start MCQ Test
            </Button>
          </div>
        </Col>
        <Col md={6}>
          <div className="card-inner programming-test-card">
            <img src='https://img.freepik.com/premium-vector/student-taking-online-exam-home-pandemic-elearning-education-concept_530733-1534.jpg' width={300} height={200}/><br/>
            <h2><b>Programming Test</b></h2>
            <p>
              This is a programming test. You will be presented with a series of programming challenges, and you need to write the correct code to solve them.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/ProgrammingTestPage')}>
              Start Programming Test
            </Button>
          </div>
        </Col>
        
      </Row>
      </>
  );
};

export default Test;