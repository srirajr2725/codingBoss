import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery
} from '@mui/material';

import {
  Home,
  Notifications,
  Lock,
  Task
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

/* ================= HELPER ================= */

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

/* ================= COMPONENT ================= */

const Dashboard = ({
  isLoggedIn,
  setIsLoggedIn,
  username,
  userRole,
  handleLogout
}) => {

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  // ✅ Courses unlocked here
  const defaultAccess = [
    { label: 'Start Learn', locked: false, key: 'startlearn' },
    { label: 'Your Status', locked: false, key: 'yourstatus' },
    { label: 'Task', locked: true, key: 'thirantask' },
    { label: 'Courses', locked: false, key: 'thirancourses' }, // 🔓 UNLOCKED
    { label: 'Assignments', locked: true, key: 'thiranassignments' },
    { label: 'Company', locked: true, key: 'thirancompany' },
    { label: 'Profile', locked: false, key: 'profile' },
  ];

  /* ================= INITIAL ACCESS ================= */

  const getInitialAccess = () => {
    const email = localStorage.getItem("username");
    const isTaskUnlocked =
      localStorage.getItem(`task_unlocked_${email}`) === "true";

    return defaultAccess.map(item => {
      if (item.label === 'Task' && isTaskUnlocked) {
        return { ...item, locked: false };
      }
      return item;
    });
  };

  const [selectedTab, setSelectedTab] = useState('Start Learn');
  const [access, setAccess] = useState(getInitialAccess);
  const [userid, setUserid] = useState('');
  const [progress, setProgress] = useState();
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ACCESS ================= */

  const fetchAccess = useCallback(async (email) => {
    try {

      const isTaskUnlocked =
        localStorage.getItem(`task_unlocked_${email}`) === "true";

      const [accessResponse, tokenListResponse] = await Promise.all([
        apiClient(`trainer/api/unlock-token/by-email/${email}/`, "GET")
          .catch(() => []),
        apiClient('trainer/api/unlock-token/list/', 'GET')
          .catch(() => [])
      ]);

      let finalAccess = defaultAccess.map(item => {

        // 🔒 Only Assignments & Company always locked
        if (['Assignments', 'Company'].includes(item.label)) {
          return { ...item, locked: true };
        }

        let apiMatch = false;

        if (item.label === 'Task') {

          if (isTaskUnlocked) apiMatch = true;

          if (accessResponse && accessResponse[0]?.json_data) {
            const match = accessResponse[0].json_data.find(
              j => labelToKey(j.label) === item.key
            );
            if (match && match.locked === false) {
              apiMatch = true;
            }
          }

          if (Array.isArray(tokenListResponse)) {
            tokenListResponse.forEach(token => {
              const allowed = [
                ...(token.users_email || []),
                ...(token.json_data || [])
              ];

              if (
                allowed.includes(email) &&
                token.unlock_token === 'THIRANTASK'
              ) {
                apiMatch = true;
              }
            });
          }
        }

        return apiMatch
          ? { ...item, locked: false }
          : item;
      });

      setAccess(finalAccess);

    } catch {
      setAccess(getInitialAccess());
    } finally {
      setLoading(false);
    }

  }, []);

  /* ================= INIT ================= */

  useEffect(() => {

    const encId = localStorage.getItem('userID');
    if (encId) {
      const bytes = CryptoJS.AES.decrypt(
        encId,
        'thirancoding360mgai'
      );
      setUserid(bytes.toString(CryptoJS.enc.Utf8));
    }

    if (userRole === "company") {
      navigate('/TrainerDashboard');
      return;
    }

    const email = localStorage.getItem("username");

    if (isLoggedIn && email) {
      fetchAccess(email);
    }

    else if (!isLoggedIn && email) {

      const encPwd = localStorage.getItem("password");

      if (encPwd) {

        const bytes = CryptoJS.AES.decrypt(
          encPwd,
          'thirancoding360mgai'
        );

        const password = bytes.toString(CryptoJS.enc.Utf8);

        apiClient(
          "quiz/users/login/",
          "POST",
          JSON.stringify({ email, password }),
          { "Content-Type": "application/json" }
        )
          .then(res => {
            if (res.role !== "company") {
              setIsLoggedIn(true);
              fetchAccess(email);
            }
          })
          .catch(() => navigate('/LoginPage'));
      }
    }

    else {
      setLoading(false);
    }

  }, [isLoggedIn, navigate, userRole, setIsLoggedIn, fetchAccess]);

  /* ================= RENDER CONTENT ================= */

  const renderContent = () => {
    switch (selectedTab) {
      case 'Start Learn':
        return <CourseCard />;

      case 'Your Status':
        return <Status setAccess={setAccess} />;

      case 'Task':
        return <Test />;

      case 'Courses':
        return <Learn />;

      case 'Assignments':
        return <Assignment />;

      case 'Company':
        return (
          <CompanyCards
            progress={progress}
            setSelectedTab={setSelectedTab}
          />
        );

      case 'Profile':
        return <UserForm setSelectedTab={setSelectedTab} />;

      default:
        return null;
    }
  };

  if (loading) return <Preloader />;

  /* ================= UI ================= */

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
        progress={progress}
        setProgress={setProgress}
      />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            width: '250px',
            marginTop: '25px',
            marginLeft: '20px',
            background: '#1976d2',
            color: '#fff',
            borderRadius: '4px'
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', mt: 1 }}>
            Dashboard
          </Typography>

          <Divider sx={{ bgcolor: '#fff' }} />

          <Box sx={{ p: 2 }}>
            {access.map(tab => (
              <Typography
                key={tab.label}
                onClick={() => {
                  if (!tab.locked) {
                    setSelectedTab(tab.label);
                  }
                }}
                sx={{
                  cursor: tab.locked ? 'not-allowed' : 'pointer',
                  mb: 2,
                  p: 1,
                  borderRadius: '4px',
                  background:
                    selectedTab === tab.label ? 'yellow' : 'blue',
                  color:
                    selectedTab === tab.label ? '#001920' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  opacity: tab.locked ? 0.7 : 1
                }}
              >
                {tab.locked && <Lock fontSize="small" />}
                {tab.label}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          marginLeft: isMobile ? 0 : '250px',
          marginTop: '80px',
          p: 2
        }}
      >
        {renderContent()}
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: '#000e79',
            zIndex: 1300
          }}
        >
          <BottomNavigation
            value={selectedTab}
            onChange={(e, v) => {
              const item = access.find(a => a.label === v);
              if (!item?.locked) {
                setSelectedTab(v);
              }
            }}
            showLabels
            sx={{ bgcolor: '#000e79' }}
          >
            {access.map(tab => (
              <BottomNavigationAction
                key={tab.label}
                label={tab.label}
                value={tab.label}
                icon={
                  tab.locked
                    ? <Lock />
                    : tab.label === 'Start Learn'
                      ? <Task />
                      : tab.label === 'Your Status'
                        ? <Home />
                        : <Notifications />
                }
                disabled={tab.locked}
                sx={{
                  color: '#fff',
                  '&.Mui-selected': { color: 'yellow' },
                  opacity: tab.locked ? 0.5 : 1
                }}
              />
            ))}
          </BottomNavigation>
        </Box>
      )}
    </>
  );
};

export default Dashboard;