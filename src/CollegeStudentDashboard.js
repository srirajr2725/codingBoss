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
  Dashboard as DashboardIcon
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
    { label: 'Start Learn', locked: false, key: 'startlearn', icon: <School /> },
    { label: 'Your Status', locked: false, key: 'yourstatus', icon: <Home /> },
    { label: 'Task', locked: false, key: 'thirantask', icon: <Task /> },
    { label: 'Courses', locked: false, key: 'thirancourses', icon: <DashboardIcon /> },
    { label: 'Assignments', locked: false, key: 'thiranassignments', icon: <AssignmentIcon /> },
    { label: 'Company', locked: false, key: 'thirancompany', icon: <Business /> },
    { label: 'Profile', locked: false, key: 'profile', icon: <Person /> },
  ];

  const getInitialAccess = () => {
    return defaultAccess;
  };

  const [selectedTab, setSelectedTab] = useState('Start Learn');
  const [access, setAccess] = useState(getInitialAccess);
  const [progress, setProgress] = useState();
  const [loading, setLoading] = useState(true);

  const fetchAccess = useCallback(async (email) => {
    setAccess(defaultAccess);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userRole === "company") { navigate('/TrainerDashboard'); return; }

    const email = localStorage.getItem("username");
    if (isLoggedIn && email) {
      fetchAccess(email);
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
          })
          .catch(() => navigate('/LoginPage'));
      } else navigate('/LoginPage');
    } else setLoading(false);
  }, [isLoggedIn, navigate, userRole, setIsLoggedIn, fetchAccess]);

  const renderContent = () => {
    switch (selectedTab) {
      case 'Start Learn': return <CourseCard />;
      case 'Your Status': return <Status setAccess={setAccess} />;
      case 'Task': return <Test />;
      case 'Courses': return <Learn />;
      case 'Assignments': return <Assignment />;
      case 'Company': return <CompanyCards progress={progress} setSelectedTab={setSelectedTab} />;
      case 'Profile': return <UserForm setSelectedTab={setSelectedTab} />;
      default: return null;
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
          {access.map(tab => (
            <div
              key={tab.label}
              className={`sd-nav-item ${selectedTab === tab.label ? 'active' : ''} ${tab.locked ? 'locked' : ''}`}
              onClick={() => !tab.locked && setSelectedTab(tab.label)}
            >
              <div className="sd-nav-icon">
                {tab.locked ? <Lock style={{ fontSize: '1.1rem' }} /> : tab.icon}
              </div>
              <span className="sd-nav-text">{tab.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px', fontWeight: 700 }}>
            <span>OVERALL PROGRESS</span>
            <span>{progress || 0}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #FFA003, #ff7e00)', borderRadius: '10px' }}></div>
          </div>
        </div>
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