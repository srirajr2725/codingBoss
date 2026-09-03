import React, { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@mui/material';
import {
  Home,
  Notifications,
  Lock,
  Task,
  School,
  Assignment as AssignmentIcon,
  Business,
  Person,
  ChevronLeft,
  Dashboard as DashboardIcon,
  EmojiEvents,
  ExpandMore,
  ExpandLess,
  Folder,
  WorkspacePremium,
  Psychology
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavbarComponent';
import Test from './Test';
import Learn from './Learn';
import UserForm from './UserForm';
import Assignment from './Assignment';
import Status from './Status';
import CryptoJS from 'crypto-js';
import apiClient from './utils/apiClient';
import CompanyCards from './Company';
import Preloader from './Preloader';
import CourseCard from './CourseCard';
import Notes from './Notes';
import Roadmaps from './Roadmaps';
import Videos from './Videos';
import SqlPractice from './SqlPractice';
import DebugChallenge from './DebugChallenge';
import OutputPrediction from './OutputPrediction';
import DailyChallenge from './DailyChallenge';
import WeeklyContest from './WeeklyContest';
import Hackathons from './Hackathons';
import LiveLeaderboard from './LiveLeaderboard';
import HRPrep from './HRPrep';
import TechnicalPrep from './TechnicalPrep';
import AIMockInterview from './AIMockInterview';
import Projects from './Projects';
import Certificates from './Certificates';
import Badges from './Badges';
import Streak from './Streak';
import Rankings from './Rankings';
import './StudentDashboard.css';

import logo from './images/Codingboss-logo-1.png';

const labelToKey = (label) => {
  const defaultKey = label.toLowerCase().replace(/\s+/g, '');
  const customMap = {
    task: 'thirantask',
    courses: 'thirancourses',
    assignments: 'thiranassignments',
    company: 'thirancompany',
  };
  return customMap[label.toLowerCase()] || defaultKey;
};

const ComingSoon = ({ title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', color: 'var(--ultra-text-muted)' }}>
    <Lock style={{ fontSize: '4rem', marginBottom: '16px', color: 'var(--ultra-primary)' }} />
    <h2>{title}</h2>
    <p>This module is currently under development. Stay tuned!</p>
  </div>
);

const Dashboard = ({
  isLoggedIn,
  setIsLoggedIn,
  username,
  userRole,
  handleLogout
}) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:1024px)'); // Sidebar collapses at 1024px

  const defaultAccess = [
    { label: 'Your Status', locked: false, key: 'yourstatus', icon: <Home /> },
    {
      label: 'Learn', icon: <School />,
      items: [
        { label: 'Courses', locked: false },
        { label: 'Notes', locked: false },
        { label: 'Roadmaps', locked: false },
        { label: 'Videos', locked: false }
      ]
    },
    {
      label: 'Practice', icon: <Task />,
      items: [
        { label: 'OneMark Hub & Code Practice', locked: false },
        { label: 'SQL Practice', locked: false },
        { label: 'Aptitude', locked: false },
        { label: 'Debug Challenge', locked: false },
        { label: 'Output Prediction', locked: false },
        { label: 'Daily Challenge', locked: false }
      ]
    },
    {
      label: 'Contests', icon: <EmojiEvents />,
      items: [
        { label: 'Weekly Contest', locked: false },
        { label: 'Hackathons', locked: false },
        { label: 'Live Leaderboard', locked: false }
      ]
    },
    {
      label: 'Interview Prep', icon: <Business />,
      items: [
        { label: 'HR', locked: false },
        { label: 'Technical', locked: false },
        { label: 'Company-wise', locked: false },
        { label: 'AI Mock Interview', locked: false }
      ]
    },
    { label: 'Projects', icon: <Folder />, locked: false },
    { label: 'Certificates', icon: <WorkspacePremium />, locked: false },
    { label: 'AI Mentor', icon: <Psychology />, locked: false },
    {
      label: 'Profile', icon: <Person />,
      items: [
        { label: 'XP', locked: false },
        { label: 'Badges', locked: false },
        { label: 'Streak', locked: false },
        { label: 'Certificates', locked: false },
        { label: 'Rankings', locked: false }
      ]
    },
  ];

  const getInitialAccess = () => {
    return defaultAccess;
  };

  const [selectedTab, setSelectedTab] = useState('Your Status');
  const [access, setAccess] = useState(getInitialAccess);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const fetchOverallProgress = async (userid) => {
    try {
      const [questionsRes, completedRes] = await Promise.all([
        apiClient('compiler/questions/', 'GET'),
        apiClient(`compiler/completed_questions/?user_id=${userid}`, 'GET')
      ]);
      const questions = Array.isArray(questionsRes) ? questionsRes : (questionsRes.results || []);
      const completed = Array.isArray(completedRes) ? completedRes[0] : completedRes;
      
      if (questions.length > 0 && completed?.completed_questions) {
        const prog = (completed.completed_questions.length / questions.length) * 100;
        setProgress(Math.round(prog));
      }
    } catch (error) {
      console.error("Failed to fetch overall progress:", error);
    }
  };

  const fetchAccess = useCallback(async (email) => {
    setAccess(defaultAccess);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userRole === "company") { navigate('/TrainerDashboard'); return; }

    const email = localStorage.getItem("username");
    
    // Get user ID for progress fetching
    const storedEncryptedUserID = localStorage.getItem('userID');
    let userid = null;
    if (storedEncryptedUserID) {
        const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
        userid = bytes.toString(CryptoJS.enc.Utf8);
    }

    if (isLoggedIn && email) {
      fetchAccess(email);
      if (userid) fetchOverallProgress(userid);
    } else if (!isLoggedIn && email) {
      const encPwd = localStorage.getItem("password");
      if (encPwd) {
        const bytes = CryptoJS.AES.decrypt(encPwd, 'thirancoding360mgai');
        const password = bytes.toString(CryptoJS.enc.Utf8);
        apiClient("quiz/users/login/", "POST", { email, password })
          .then(res => {
            const authToken = res?.access || res?.token;
            if (authToken) localStorage.setItem("token", authToken);
            setIsLoggedIn(true);
            fetchAccess(email);
            if (userid) fetchOverallProgress(userid);
          })
          .catch(() => navigate('/LoginPage'));
      } else navigate('/LoginPage');
    } else setLoading(false);
  }, [isLoggedIn, navigate, userRole, setIsLoggedIn, fetchAccess]);

  const renderContent = () => {
    switch (selectedTab) {
      case 'Your Status': return <Status setAccess={setAccess} />;
      case 'Courses': return <Learn isLoggedIn={isLoggedIn} username={username} userRole={userRole} handleLogout={handleLogout} />;
      case 'Notes': return <Notes />;
      case 'Roadmaps': return <Roadmaps />;
      case 'Videos': return <Videos />;
      case 'SQL Practice': return <SqlPractice />;
      case 'Debug Challenge': return <DebugChallenge />;
      case 'Output Prediction': return <OutputPrediction />;
      case 'Daily Challenge': return <DailyChallenge />;
      case 'Weekly Contest': return <WeeklyContest />;
      case 'Hackathons': return <Hackathons />;
      case 'Live Leaderboard': return <LiveLeaderboard />;
      case 'HR': return <HRPrep />;
      case 'Technical': return <TechnicalPrep />;
      case 'AI Mock Interview': return <AIMockInterview />;
      case 'Projects': return <Projects />;
      case 'Certificates': return <Certificates />;
      case 'OneMark Hub & Code Practice': return <Test />;
      case 'Company-wise': return <CompanyCards progress={progress} setSelectedTab={setSelectedTab} />;
      case 'XP': return <UserForm setSelectedTab={setSelectedTab} />;
      case 'Badges': return <Badges />;
      case 'Streak': return <Streak />;
      case 'Rankings': return <Rankings />;
      default: return <ComingSoon title={selectedTab} />;
    }
  };

  if (loading) return <Preloader />;

  return (
    <div className="sd-root">
      {/* ULTRA SIDEBAR */}
      <aside className="sd-sidebar">
        <div className="sd-sidebar-header">
          <h2 className="sd-sidebar-title">
            <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '8px' }} />
            <b>Coding<span>Boss</span></b>
          </h2>
        </div>
        <nav className="sd-nav-list">
          {access.map(item => (
            <div key={item.label} className="sd-nav-group">
              <div
                className={`sd-nav-item ${selectedTab === item.label && !item.items ? 'active' : ''} ${item.locked ? 'locked' : ''}`}
                onClick={() => {
                  if (item.locked) return;
                  if (item.items) {
                    toggleCategory(item.label);
                  } else {
                    setSelectedTab(item.label);
                  }
                }}
              >
                <div className="sd-nav-icon">
                  {item.locked ? <Lock style={{ fontSize: '1.1rem' }} /> : item.icon}
                </div>
                <span className="sd-nav-text" style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>{item.label}</span>
                {item.items && (
                  <div className="sd-nav-expand-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {expandedCategories[item.label] ? <ExpandLess /> : <ExpandMore />}
                  </div>
                )}
              </div>
              {item.items && (
                <div className={`sd-nav-subitems ${expandedCategories[item.label] ? 'open' : ''}`}>
                  {item.items.map(subItem => (
                    <div
                      key={subItem.label}
                      className={`sd-nav-subitem ${selectedTab === subItem.label ? 'active' : ''} ${subItem.locked ? 'locked' : ''}`}
                      onClick={() => !subItem.locked && setSelectedTab(subItem.label)}
                    >
                      <span className="sd-nav-text">{subItem.label}</span>
                      {subItem.locked && <Lock style={{ fontSize: '0.9rem', marginLeft: 'auto' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>


      </aside>

      {/* ULTRA MAIN WRAPPER */}
      <div className="sd-main-wrapper">
        <Navbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          username={username}
          userRole={userRole}
          handleLogout={handleLogout}
          progress={progress}
          setProgress={setProgress}
          isDashboard={true}
        />
        <div className="sd-topbar-placeholder"></div>
        <main className="sd-content-area">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
