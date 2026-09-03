import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaChevronLeft, FaChevronRight, FaPlay, FaBookOpen } from 'react-icons/fa';
import apiClient from './utils/apiClient';
import Navbar from './NavbarComponent';
import './CourseContent.css';

const CourseJava = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, username }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unlockedIndex, setUnlockedIndex] = useState(() => {
    const saved = localStorage.getItem(`java_progress_${username.toLowerCase()}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(`java_progress_${username.toLowerCase()}`, unlockedIndex.toString());
  }, [unlockedIndex, username]);

  useEffect(() => {
    if (!isLoggedIn) navigate('/LoginPage');
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/content/', 'GET');
        const filteredTopics = data.filter((topic) => topic.language === 1);
        const sortedTopics = filteredTopics.sort((a, b) => a.position - b.position);
        setTopics(sortedTopics);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleTopicClick = (index) => {
    if (index <= unlockedIndex) setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < topics.length - 1 && currentIndex < unlockedIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const handleStart = (question, index) => {
    if (index === unlockedIndex && unlockedIndex < topics.length - 1) {
      setUnlockedIndex(unlockedIndex + 1);
    }
    navigate('/QuestionPage', { state: { questionId: question } });
  };

  if (loading) return <div className="text-center py-5">Loading Java Curriculum...</div>;

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <div className="cc-root">
        <aside className="cc-sidebar">
          <div className="cc-sidebar-title">Curriculum</div>
          <ul className="cc-topic-list">
            {topics.map((topic, index) => {
              const isLocked = index > unlockedIndex;
              const isCompleted = index < unlockedIndex;
              const isActive = index === currentIndex;

              return (
                <li
                  key={index}
                  className={`cc-topic-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => handleTopicClick(index)}
                >
                  {isLocked ? <FaLock size={14} /> : isCompleted ? <FaCheckCircle color="#10b981" /> : <FaBookOpen />}
                  <span>{topic.title}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="cc-main">
          <div className="cc-content-card">
            <h1>{topics[currentIndex]?.title}</h1>
            <div className="cc-text-content">
              {topics[currentIndex]?.content || 'Initializing lesson content...'}
            </div>

            {topics[currentIndex]?.question && (
              <div className="cc-question-box">
                <div className="cc-question-text">
                  <span className="d-block text-muted small mb-1">PRACTICAL CHALLENGE</span>
                  {topics[currentIndex].question}
                </div>
                <button
                  className="cc-btn-start"
                  onClick={() => handleStart(topics[currentIndex].position, currentIndex)}
                >
                  <FaPlay size={12} className="me-2" /> Start Lab
                </button>
              </div>
            )}
          </div>

          <div className="cc-footer-nav">
            <button
              className="cc-btn-nav"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <FaChevronLeft /> Previous
            </button>
            <button
              className="cc-btn-nav"
              onClick={handleNext}
              disabled={currentIndex === topics.length - 1 || currentIndex >= unlockedIndex}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default CourseJava;
