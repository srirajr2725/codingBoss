import React, { useState, useEffect } from 'react';
import './DailyChallenge.css';
import { 
  FaFire,
  FaStar,
  FaCalendarCheck,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaArrowLeft,
  FaTerminal
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState('14:22:05');

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

const DailyChallenge = () => {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  
  // State for toggling between Dashboard and IDE
  const [solveMode, setSolveMode] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const data = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/challenges/daily/`, 'GET');
        setChallengeData(data);
        
        // Also fetch user streak to show real user info alongside the challenge
        const storedEncryptedUserID = localStorage.getItem('userID');
        if (storedEncryptedUserID) {
          const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
          const userId = bytes.toString(CryptoJS.enc.Utf8);
          if (userId) {
             const streakData = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/users/${userId}/streak/`, 'GET');
             setStreak(streakData?.current_streak || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching daily challenge:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallengeData();
  }, []);

  const handleStartSolve = () => {
    if (!isCompleted) {
      setSolveMode(true);
    }
  };

  const handleSubmitCode = () => {
    // Simulate successful test pass
    toast.success('All Test Cases Passed!', { theme: "colored" });
    
    setTimeout(() => {
      setSolveMode(false);
      setIsCompleted(true);
      setStreak(prev => prev + 1);
      setXp(prev => prev + 150);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });

      toast.success('Challenge Completed! +150 XP', { 
        theme: "colored",
        icon: '🎉'
      });
    }, 1000);
  };

  // Generate a mock week calendar
  const today = new Date().getDate();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = today - 3 + i; 
    const isToday = i === 3;
    const isFuture = i > 3;
    const completed = isToday ? isCompleted : (isFuture ? false : i !== 1);
    
    return {
      dayName: weekDays[i % 7],
      date: date > 0 ? date : date + 30,
      isToday,
      completed,
      missed: !isToday && !isFuture && !completed
    };
  });

  if (loading) {
    return (
      <div className="daily-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: '#64748b' }}>Loading daily challenge...</div>
      </div>
    );
  }

  // Fallback to defaults if backend structure is still missing
  const challengeTitle = challengeData?.title || "Daily Challenge";
  const challengeDesc = challengeData?.description || "Solve the daily coding challenge.";
  const challengeId = challengeData?.id || 1;
  const tags = challengeData?.tags || [];
  const difficulty = challengeData?.difficulty || "Medium";

  if (solveMode) {
    return (
      <div className="daily-container">
        <ToastContainer position="top-center" />
        <div className="daily-ide-wrapper">
          <div className="daily-ide-nav">
            <button className="daily-back-btn" onClick={() => setSolveMode(false)}>
              <FaArrowLeft /> Back to Dashboard
            </button>
            <div style={{ fontWeight: 'bold', color: '#475569' }}>
              <FaClock style={{ display: 'inline', marginRight: '6px' }} /> <CountdownTimer />
            </div>
          </div>

          <div className="daily-ide-container">
            {/* Left Pane - Problem Description */}
            <div className="daily-ide-left">
              <h1 className="daily-ide-title">{challengeTitle}</h1>
              <div className="daily-hero-meta" style={{ justifyContent: 'flex-start', marginBottom: '24px' }}>
                <span className="daily-tag" style={{ color: difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#10b981', borderColor: difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#10b981', background: difficulty === 'Hard' ? '#fef2f2' : difficulty === 'Medium' ? '#fffbeb' : '#ecfdf5' }}>
                  {difficulty}
                </span>
                {tags.map((tag, i) => (
                  <span key={i} className="daily-tag" style={{ color: '#475569', borderColor: '#cbd5e1' }}>{tag}</span>
                ))}
              </div>
              <div className="daily-ide-desc" dangerouslySetInnerHTML={{ __html: challengeDesc }} />
              
              {challengeData?.example_html && (
                <div dangerouslySetInnerHTML={{ __html: challengeData.example_html }} />
              )}
            </div>

            {/* Right Pane - Editor */}
            <div className="daily-ide-right">
              <textarea 
                className="daily-ide-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />
              <div className="daily-ide-actions">
                <button className="daily-run-code-btn" onClick={handleSubmitCode}>
                  <FaTerminal /> Submit Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-container">
      <ToastContainer position="top-center" />
      
      {/* HERO BANNER */}
      <div className="daily-hero">
        <div className="daily-hero-content">
          <div className="daily-hero-subtitle">
            <FaCalendarCheck /> Daily Challenge #{challengeId}
          </div>
          <h1 className="daily-hero-title">{challengeTitle}</h1>
          <div className="daily-hero-desc" dangerouslySetInnerHTML={{ __html: challengeDesc.length > 150 ? challengeDesc.substring(0, 150) + '...' : challengeDesc }} />
          
          <div className="daily-hero-meta">
            <span className="daily-tag" style={{ color: difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#10b981', borderColor: difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#10b981' }}>
              {difficulty}
            </span>
            {tags.map((tag, i) => (
              <span key={i} className="daily-tag">{tag}</span>
            ))}
          </div>

          <button 
            className={`daily-solve-btn ${isCompleted ? 'completed' : ''}`}
            onClick={handleStartSolve}
          >
            {isCompleted ? (
              <><FaCheckCircle /> Completed (+150 XP)</>
            ) : (
              <><FaPlay /> Solve Challenge</>
            )}
          </button>
        </div>

        <div className="daily-timer-widget">
          <div className="daily-timer-label">
            <FaClock style={{ display: 'inline', marginRight: '6px' }} />
            Time Remaining
          </div>
          <div className="daily-timer-value">
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="daily-stats-row">
        <div className="daily-stat-card">
          <div className="daily-stat-icon-wrapper streak-icon">
            <FaFire />
          </div>
          <div className="daily-stat-info">
            <span className="daily-stat-value">{streak}</span>
            <span className="daily-stat-label">Day Streak</span>
          </div>
        </div>

        <div className="daily-stat-card">
          <div className="daily-stat-icon-wrapper xp-icon">
            <FaStar />
          </div>
          <div className="daily-stat-info">
            <span className="daily-stat-value">{xp.toLocaleString()}</span>
            <span className="daily-stat-label">Total XP Earned</span>
          </div>
        </div>
      </div>

      {/* HISTORY CALENDAR */}
      <div className="daily-history-section">
        <h2 className="daily-section-title">
          <FaCalendarCheck style={{ color: '#4f46e5' }} /> 
          This Week's Activity
        </h2>
        
        <div className="daily-calendar-grid">
          {calendarDays.map((day, idx) => (
            <div 
              key={idx} 
              className={`daily-day-card ${day.isToday ? 'today' : ''} ${day.completed ? 'completed' : ''} ${day.missed ? 'missed' : ''}`}
            >
              <span className="daily-day-name">{day.dayName}</span>
              <span className="daily-day-date">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DailyChallenge;
