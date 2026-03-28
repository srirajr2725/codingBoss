import React, { useEffect, useState } from 'react';
import './CourseC.css';
import Navbar from './NavbarComponent';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap'

const CourseC = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {
  const [topics, setTopics] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/LoginPage');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await apiClient('compiler/content/', 'GET');
        // language === 3 for C (based on Java=1, Python=2 pattern)
        const filteredTopics = data.filter((topic) => topic.language === 3);
        const sortedTopics = filteredTopics.sort((a, b) => a.position - b.position);
        setTopics(sortedTopics);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLanguages = async () => {
      try {
        const data = await apiClient('compiler/languages/', 'GET');
        setLanguages(data);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchTopics();
    fetchLanguages();
  }, []);

  const handleTopicClick = (index) => setCurrentIndex(index);
  const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 1, topics.length - 1));
  const handlePrevious = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const handleTopicNavigation = (language) => {
    const pathMap = { java: '/CourseJava', python: '/CoursePython', c: '/CourseC' };
    const newPath = pathMap[language.toLowerCase()];
    if (newPath && location.pathname !== newPath) navigate(newPath);
  };

  const handleStart = (question) => {
    navigate('/QuestionPage', { state: { questionId: question } });
  }

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <div className="row flex-nowrap">
        <div className="col-4 sidebarCource">
          <ul>
            {loading ? (
              <li>Loading topics...</li>
            ) : topics.length > 0 ? (
              topics.map((topic, index) => (
                <li key={index} onClick={() => handleTopicClick(index)} className={index === currentIndex ? 'active' : ''}>
                  {topic.title}
                </li>
              ))
            ) : (
              <li>No topics available</li>
            )}
          </ul>
        </div>

        <div className="content col-8">
          <div className="content-body">
            {topics.length > 0 ? (
              <>
                <div>{topics[currentIndex].content || 'No content available.'}</div>
                <br />

                {topics[currentIndex].question && <Card className="question-card">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <span style={{ textAlign: 'left' }}>
                      {topics[currentIndex].question}
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStart(topics[currentIndex].position)}
                      className="d-flex flex-column align-items-center justify-content-center"
                      style={{
                        minWidth: '80px',
                        height: '30px',
                        backgroundColor: '#017a8c',
                        borderColor: '#017a8c',
                      }}
                    >
                      Start
                    </Button>
                  </Card.Body>
                </Card>}
              </>
            ) : (
              <p>Select a topic to see its content.</p>
            )}
          </div>

          <div className="bottom-buttons">
            <button className="prev-next" onClick={handlePrevious} disabled={currentIndex === 0}>Previous</button>
            <button className="prev-next" onClick={handleNext} disabled={currentIndex === topics.length - 1}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseC;
