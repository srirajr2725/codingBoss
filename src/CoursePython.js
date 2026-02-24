import React, { useEffect, useState } from 'react';
import './CoursePython.css';
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
const CourseJava = ({ isLoggedIn,setIsLoggedIn, userRole, handleLogout, username }) => {
  const [topics, setTopics] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
        if (!isLoggedIn) {
          if(localStorage.getItem("username") && localStorage.getItem("password")){
            const email = localStorage.getItem("username");
            const EncryptPassword = localStorage.getItem("password");
            const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
            const password = bytes.toString(CryptoJS.enc.Utf8);
            const Login = async () => {
              try {
                const response = await apiClient(
                  "quiz/users/login/",
                  "POST",
                  JSON.stringify({ email, password }),
                  { "Content-Type": "application/json" }
                );
                if (!response.status === "success") {
                  navigate('/LoginPage');
                }
                setIsLoggedIn(true);
              } catch (error) {
                navigate('/LoginPage');
              }
            }
            Login();
          }
          else {
            
            navigate('/LoginPage');
          }
        } 
      }, [isLoggedIn, navigate])


  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await apiClient('compiler/content/', 'GET');
        const filteredTopics = data.filter((topic) => topic.language === 2);
        const sortedTopics = filteredTopics.sort((a, b) => a.position - b.position);
        setTopics(sortedTopics);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    const fetchLanguages = async () => {
      try {
        const data = await apiClient('compiler/languages/', 'GET');
        setLanguages(data);
      } catch (error) {
      }
    };

    fetchTopics();
    fetchLanguages();
  }, []);

  const handleTopicClick = (index) => setCurrentIndex(index);
  const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 1, topics.length - 1));
  const handlePrevious = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const renderContentAsList = (content) => {
    const points = content.split('\n').filter((line) => line.trim() !== '');
    return <ul>{points.map((point, index) => <li key={index}>{point}</li>)}</ul>;
  };

  const handleLanguageNavigation = (language) => {
    const pathMap = { java: '/CourseJava', python: '/CoursePython', c: '/CourseC' };
    const newPath = pathMap[language.toLowerCase()];
    if (newPath && location.pathname !== newPath) navigate(newPath);
  };

  const handleStart = (question) => {
    navigate('/QuestionPage', { state: { questionId: question } })
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
      {/* <div className="header">
        <button className="nav-button" onClick={() => navigate('/')}>Home</button>
        {languages.map((lang, index) => (
          <button key={index} className="nav-button" onClick={() => handleLanguageNavigation(lang.language)}>
            {lang.language}
          </button>
        ))}
      </div> */}

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

              {topics[currentIndex].expected_output && (
  <a href={topics[currentIndex].expected_output} target="_blank" rel="noopener noreferrer">
    <button style={{
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background 0.3s',
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
    >
     {topics[currentIndex].expected_output}
    </button>
  </a>
)}


            {topics[currentIndex].question  &&  <Card className="question-card">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <span style={{textAlign:'left'}}>
                      {topics[currentIndex].question}
                    </span>

                    <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStart(topics[currentIndex].position)} // Pass the question object including ID
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{
                      minWidth: '80px',
                      height: '30px',
                      backgroundColor: '#017a8c', // Button background color
                      borderColor: '#017a8c', // Button border color
                    }} // Consistent button size
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

export default CourseJava;
