import React, { useState, useEffect } from 'react';
import './WeeklyContest.css';
import { 
  FaTrophy,
  FaLock,
  FaCode,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaMedal
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from './utils/apiClient';

// Reusable timer component to prevent global re-renders
const ContestTimer = () => {
  const [timeLeft, setTimeLeft] = useState('32:14:59');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let [hrs, mins, secs] = prev.split(':').map(Number);
        if (secs > 0) secs--;
        else {
          secs = 59;
          if (mins > 0) mins--;
          else {
            mins = 59;
            hrs--;
          }
        }
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <>{timeLeft}</>;
};

const WeeklyContest = () => {
  const [contestData, setContestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchContestData = async () => {
      try {
        const data = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/contests/weekly/', 'GET');
        setContestData(data);
      } catch (error) {
        console.error("Error fetching weekly contest data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContestData();
  }, []);

  const handleRegister = () => {
    setIsRegistered(true);
    toast.success('Successfully Registered! You will be notified when it starts.', { 
      theme: "colored",
      icon: '🎉'
    });
  };

  // Fallback mock data if API fails or is incomplete
  const mockProblems = [
    { id: 'A', name: 'Valid Palindrome Array', points: 3, difficulty: 'Easy' },
    { id: 'B', name: 'Minimum Path Cost', points: 4, difficulty: 'Medium' },
    { id: 'C', name: 'Range Sum Query 2D', points: 5, difficulty: 'Medium' },
    { id: 'D', name: 'Alien Dictionary', points: 6, difficulty: 'Hard' }
  ];

  const mockLeaderboard = [
    { rank: 1, name: 'AlexCoder99', score: '18 / 18', time: '42m 15s' },
    { rank: 2, name: 'JS_Ninja', score: '18 / 18', time: '48m 02s' },
    { rank: 3, name: 'ByteMaster', score: '18 / 18', time: '51m 30s' }
  ];

  const displayProblems = contestData?.problems || mockProblems;
  const displayLeaderboard = contestData?.leaderboard || mockLeaderboard;
  const contestId = contestData?.contest_id || 132;
  const contestTitle = contestData?.title || 'Global Code Championship';
  const contestDesc = contestData?.description || 'Compete against thousands of programmers worldwide. Solve 4 algorithmic challenges within 90 minutes. Earn rating points and unlock exclusive profile badges!';

  if (loading) {
    return (
      <div className="contest-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: '#64748b' }}>Loading contest data...</div>
      </div>
    );
  }

  return (
    <div className="contest-container">
      <ToastContainer position="top-center" />
      
      {/* HERO BANNER */}
      <div className="contest-hero">
        <div className="contest-hero-content">
          <div className="contest-badge">
            <FaTrophy /> Weekly Contest {contestId}
          </div>
          <h1 className="contest-title">{contestTitle}</h1>
          <p className="contest-desc">
            {contestDesc}
          </p>

          <button 
            className={`contest-register-btn ${isRegistered ? 'registered' : ''}`}
            onClick={handleRegister}
          >
            {isRegistered ? (
              <><FaCheckCircle /> Registered for Contest</>
            ) : (
              <><FaPlay /> Register Now</>
            )}
          </button>
        </div>

        <div className="contest-timer">
          <div className="contest-timer-label">
            <FaClock style={{ display: 'inline', marginRight: '6px' }} />
            Starts In
          </div>
          <div className="contest-timer-value">
            <ContestTimer />
          </div>
        </div>
      </div>

      {/* BOTTOM LAYOUT */}
      <div className="contest-bottom-layout">
        
        {/* LEFT PANE - PROBLEMS */}
        <div className="contest-problems">
          <h2 className="contest-section-title">
            <FaCode style={{ color: '#3b82f6' }} /> 
            Contest Problems
          </h2>
          
          <div className="contest-problem-list">
            {displayProblems.map((prob) => (
              <div key={prob.id} className="contest-problem-card">
                <div className="contest-prob-info">
                  <div className="contest-prob-icon">
                    <FaLock />
                  </div>
                  <div>
                    <h3 className="contest-prob-name">Problem {prob.id}: {prob.name}</h3>
                    <div className="contest-prob-points">{prob.points} Points • {prob.difficulty}</div>
                  </div>
                </div>
                <div className="contest-prob-locked">
                  <FaClock /> Unlocks at start
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANE - LEADERBOARD */}
        <div className="contest-leaderboard-preview">
          <h2 className="contest-section-title">
            <FaUsers style={{ color: '#8b5cf6' }} /> 
            Last Week's Winners
          </h2>

          <div className="contest-lb-list">
            {displayLeaderboard.map((user) => (
              <div key={user.rank} className="contest-lb-item">
                <div className={`contest-lb-rank rank-${user.rank}`}>
                  {user.rank}
                </div>
                <div className="contest-lb-avatar">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '💻'}
                </div>
                <div className="contest-lb-details">
                  <h4 className="contest-lb-name">{user.name}</h4>
                  <div className="contest-lb-score">{user.score} pts • {user.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklyContest;
