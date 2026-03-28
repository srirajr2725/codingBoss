import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap'
import { FaLock, FaCheckCircle } from 'react-icons/fa'
import apiClient from './utils/apiClient'
import { useLocation } from 'react-router-dom';
import CryptoJS from "crypto-js";
import Navbar from './NavbarComponent.js';

const Assignments = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => { 
  // Initialize progress state here
  const [progress, setProgress] = useState(0);
  const [filterCategory, setFilterCategory] = useState('Technical');
  const navigate = useNavigate();
  const [programmingQuestions, setProgrammingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [mcqQuestions, setMcqQuestions] = useState([
      "Digital-Marketing",
      "Java",
      "Django",
      "C",
      "Devops"
  ]);
  const [selectedSubtypes, setSelectedSubtypes] = useState([]);
  const location = useLocation();
  const [userId, setUserId] = useState("");

const handleNavigateToMcqTestPage = () => {
  const sebLink = "seb://open?config=https://codingboss.in/config/thiran-mcq.seb";

  const a = document.createElement('a');
  a.href = sebLink;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};



  const visibleQuestions = showAll
    ? programmingQuestions
    : programmingQuestions.slice(0, 2);
  
  const visibleMcqQuestions = showAll
    ? mcqQuestions
    : mcqQuestions.slice(0, 2);

  // Get user ID from local storage
  useEffect(() => {
    const storedEncryptedUserID = localStorage.getItem('userID');
    if (storedEncryptedUserID) {
      const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
      const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
      setUserId(decryptedUserId);
    }
  }, []);

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
  }, [isLoggedIn, navigate, setIsLoggedIn]);

  // Fetch programming questions and check completed questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await apiClient('compiler/questions/', 'GET', null);
        setProgrammingQuestions(data);
        
        // After fetching questions, get completed questions for the current user
        if (userId) {
          fetchCompletedQuestions(userId);
        }
      } catch (error) {
        setError(
          error.message || 'Failed to fetch questions. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchCompletedQuestions = async (userId) => {
      try {
        // Try to get completed questions from the API
        const response = await apiClient(`compiler/completed-questions/?user_id=${userId}`, 'GET', null);
        if (response && response.completed_questions) {
          setCompletedQuestions(response.completed_questions);
          
          // Calculate progress based on completed questions
          if (programmingQuestions.length > 0) {
            const completedPercentage = (response.completed_questions.length / programmingQuestions.length) * 100;
            setProgress(completedPercentage);
          }
        }
      } catch (error) {
        console.error("Error fetching completed questions:", error);
        
        // IMPORTANT: If API call fails, fall back to local storage data
        try {
          const localCompletedQuestions = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
          setCompletedQuestions(localCompletedQuestions);
          
          // Calculate progress based on local storage data
          if (programmingQuestions.length > 0 && localCompletedQuestions.length > 0) {
            const completedPercentage = (localCompletedQuestions.length / programmingQuestions.length) * 100;
            setProgress(completedPercentage);
          }
        } catch (storageError) {
          console.error("Error reading from local storage:", storageError);
        }
      }
    };

    const checkMessage = () => {
      if(localStorage.getItem("submitMessage")){
        setSubmissionMessage(localStorage.getItem("submitMessage"));
        localStorage.removeItem("submitMessage");
        
        // Also check localStorage for recently completed questions
        const storedCompletedQuestions = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
        if (storedCompletedQuestions.length > 0) {
          setCompletedQuestions(prev => {
            const newCompletedQuestions = [...prev];
            storedCompletedQuestions.forEach(qId => {
              if (!newCompletedQuestions.includes(qId)) {
                newCompletedQuestions.push(qId);
              }
            });
            return newCompletedQuestions;
          });
          
          // Update progress based on the new completed questions
          if (programmingQuestions.length > 0) {
            const updatedCompletedQuestions = [...completedQuestions];
            storedCompletedQuestions.forEach(qId => {
              if (!updatedCompletedQuestions.includes(qId)) {
                updatedCompletedQuestions.push(qId);
              }
            });
            const completedPercentage = (updatedCompletedQuestions.length / programmingQuestions.length) * 100;
            setProgress(completedPercentage);
          }
        }
      }
    };
    
    checkMessage();
    fetchQuestions();
  }, [userId, programmingQuestions.length]);

const handleProgrammingStartClick = (question) => {
  // This URL should point to your hosted .seb config file
  const sebConfigUrl = "https://codingboss.in/config/thiran-seb.seb";

  // This will try to open SEB app with the given config file
  window.location.href = `seb://open?config=${encodeURIComponent(sebConfigUrl)}`;
};


  const [testData, setTestData] = useState({
    mcqQuestions: [],
    programmingQuestions: [],
  });
  
  useEffect(() => {
    const fetchMcqQuestions = async () => {
      try {
        let allQuestions = [];
        for (let subtype of selectedSubtypes) {
          const response = await apiClient(`compiler/get-mcq/?subtype=${subtype}`, "GET");
          allQuestions = [...allQuestions, ...response.questions];
        }
        setTestData(prev => ({ ...prev, mcqQuestions: allQuestions }));
      } catch (error) {
        setError("Failed to fetch MCQ questions.");
      }
    };
  
    if (selectedSubtypes.length > 0) {
      fetchMcqQuestions();
    }
  }, [selectedSubtypes]);

  // Function to unlock all questions (for testing purposes)
  const handleUnlockAll = () => {
    setShowAll(true);
  };
  
  if (loading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  // Check if a question is completed
  const isQuestionCompleted = (questionId) => {
    return completedQuestions.includes(questionId);
  };

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
        progress={progress}
        setProgress={setProgress}
      /> 

      <Container className="mt-6">
        <h1 className="text-center mb-4">Assignments</h1>

        <Row className="justify-content-center">
          <Col md={12} className="mb-4">
            <Card className="topic-card">
              <Card.Body>
                {submissionMessage && (
                  <Alert variant="success" className="text-center">
                    {submissionMessage}
                  </Alert>
                )}

                <Card.Title>Programming Questions</Card.Title>
                <Row>
                  {visibleQuestions.map((question, index) => (
                    <Col key={question.id} md={12} className="mb-4">
                      <Card className="question-card">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span
                              style={{
                                filter:
                                  index >= 2 && !showAll ? 'blur(3.5px)' : 'none',
                              }}
                              title={
                                index >= 2 && !showAll
                                  ? 'Unlock by completing previous levels'
                                  : ''
                              }
                            >
                              {question.title}: {question.description}
                            </span>
                            {isQuestionCompleted(question.id) && (
                              <FaCheckCircle 
                                style={{ 
                                  color: 'green', 
                                  marginLeft: '10px',
                                  fontSize: '1.2em'
                                }} 
                                title="Completed" 
                              />
                            )}
                          </div>
 <Button
  variant="primary"
  size="sm"
  onClick={() => isQuestionCompleted(question.id) ? null : handleProgrammingStartClick(question)}
  disabled={index >= 2 && !showAll || isQuestionCompleted(question.id)}
  className="d-flex flex-column align-items-center justify-content-center"
  style={{
    minWidth: '80px',
    height: '30px',
    backgroundColor: isQuestionCompleted(question.id) 
      ? '#28a745' 
      : (index >= 2 && !showAll ? '#cccccc' : '#017a8c'),
    borderColor: isQuestionCompleted(question.id) 
      ? '#28a745' 
      : (index >= 2 && !showAll ? '#999999' : '#017a8c'),
  }}
>
  {index >= 2 && !showAll ? (
    <FaLock
      style={{ fontSize: '1.2em', color: 'gray' }}
    />
  ) : isQuestionCompleted(question.id) ? (
    'Already Attended'
  ) : (
    'Start'
  )}
</Button>

                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                {/* Button to show all questions (visible to admin or for testing) */}
                {userRole === 'admin' && !showAll && (
                  <Button 
                    variant="link" 
                    onClick={handleUnlockAll}
                    className="text-center d-block mx-auto mt-3"
                  >
                    Show All Questions
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card.Title>MCQ Questions</Card.Title>
        <Row>
          {visibleMcqQuestions.map((question, index) => {
            const isMcqTestCompleted = !!localStorage.getItem(`mcq_completed_${userId}_${question}_Technical`);

            return (
              <Col key={index} md={12} className="mb-4">
                <Card className="question-card">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <span
                      style={{
                        filter: index >= 2 && !showAll ? 'blur(3.5px)' : 'none',
                      }}
                      title={
                        index >= 2 && !showAll
                          ? 'Unlock by completing previous levels'
                          : ''
                      }
                    >
                      {question}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => (index >= 2 && !showAll || isMcqTestCompleted) ? null : handleNavigateToMcqTestPage(question)}
                      disabled={index >= 2 && !showAll || isMcqTestCompleted}
                      className="d-flex flex-column align-items-center justify-content-center"
                      style={{
                        minWidth: '80px',
                        height: '30px',
                        backgroundColor: isMcqTestCompleted 
                          ? '#28a745' 
                          : (index >= 2 && !showAll ? '#cccccc' : '#017a8c'),
                        borderColor: isMcqTestCompleted 
                          ? '#28a745' 
                          : (index >= 2 && !showAll ? '#999999' : '#017a8c'),
                      }}
                    >
                      {index >= 2 && !showAll ? (
                        <FaLock style={{ fontSize: '1.2em', color: 'gray' }} />
                      ) : isMcqTestCompleted ? (
                        'Already Attended'
                      ) : (
                        'Start'
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  )
}

export default Assignments