import React, { useState, useEffect } from 'react';
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
  Person,
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


/* ================= AUTO UNLOCK ================= */

const applyLocalUnlock = (list) => {

  const unlocked = JSON.parse(
    localStorage.getItem("sessionUnlockedKeys") || "[]"
  );

  if (unlocked.length === 0) return list;

  return list.map(item => ({
    ...item,
    locked: unlocked.includes(item.key) ? false : item.locked
  }));
};


/* ================= COMPONENT ================= */

const Dashboard = ({
  isLoggedIn,
  setIsLoggedIn,
  username,
  userRole,
  handleLogout
}) => {

  const [selectedTab, setSelectedTab] = useState('Start Learn');
  const [access, setAccess] = useState([]);
  const [userid, setUserid] = useState('');
  const [progress, setProgress] = useState();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');


  /* ================= DEFAULT ACCESS ================= */

  const defaultAccess = [
    { label: 'Start Learn', locked: false, key: 'startlearn' },
    { label: 'Your Status', locked: false, key: 'yourstatus' },
    { label: 'Task', locked: true, key: 'thirantask' },
    { label: 'Courses', locked: true, key: 'thirancourses' },
    { label: 'Assignments', locked: true, key: 'thiranassignments' },
    { label: 'Company', locked: true, key: 'thirancompany' },
    { label: 'Profile', locked: false, key: 'profile' },
  ];


  /* ================= PROFILE ================= */

  const fetchProfileCompletion = async () => {

    try {

      const response = await apiClient(
        `trainer/trainers/get/${userid}`,
        "GET"
      );

      if (response && response[0]) {

        const profile = response[0];

        const requiredFields = [
          "name",
          "education",
          "resume",
          "current_location",
          "native_location",
        ];

        let filled = 0;

        requiredFields.forEach((field) => {

          if (field === "education") {

            if (
              Array.isArray(profile[field]) &&
              profile[field].some(
                (edu) => edu.degree && edu.year && edu.institution
              )
            ) {
              filled++;
            }

          } else {

            if (profile[field]) filled++;

          }

        });

        const percent = (filled / requiredFields.length) * 100;

        setProgress(Math.floor(percent));

      } else {

        setProgress(0);

      }

    } catch {

      setProgress(0);

    }
  };


  useEffect(() => {
    fetchProfileCompletion();
  }, [selectedTab]);


  /* ================= MAIN INIT ================= */

  useEffect(() => {

    /* USER ID */

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


    /* ================= FETCH ACCESS ================= */

    const fetchAccess = async (email) => {

      try {

        const [accessResponse, tokenListResponse] = await Promise.all([

          apiClient(
            `trainer/api/unlock-token/by-email/${email}/`,
            "GET"
          ).catch(() => []),

          apiClient(
            'trainer/api/unlock-token/list/',
            'GET'
          ).catch(() => [])

        ]);


        /* ===== BASE ACCESS ===== */

        let mergedAccess = [];

        if (
          accessResponse &&
          accessResponse[0] &&
          Array.isArray(accessResponse[0].json_data)
        ) {

          accessResponse[0].json_data.forEach((item) => {

            if (!item.label) return;

            let isLocked = accessResponse.every(res => {
              const match = res.json_data.find(
                j => j.label === item.label
              );
              return match?.locked !== false;
            });

            const key = labelToKey(item.label);

            mergedAccess.push({
              label: item.label,
              locked: isLocked,
              key
            });
          });
        }


        if (mergedAccess.length === 0) {
          mergedAccess = defaultAccess.map(i => ({ ...i }));
        }


        /* ===== TOKEN API UNLOCK ===== */

        const unlockedKeysFromTokens = [];

        if (Array.isArray(tokenListResponse)) {

          const couponToKey = {
            THIRANTASK: 'thirantask',
            THIRANCOURSES: 'thirancourses',
            THIRANASSIGN: 'thiranassignments',
            THIRANASSIGNMENTS: 'thiranassignments',
            THIRANCOMPANY: 'thirancompany',
          };

          tokenListResponse.forEach(token => {

            const allowed = [
              ...(token.users_email || []),
              ...(token.json_data || [])
            ];

            if (allowed.includes(email)) {

              const key = couponToKey[token.unlock_token];

              if (key) unlockedKeysFromTokens.push(key);
            }
          });
        }


        /* ===== FINAL MERGE ===== */

        const finalAccess = mergedAccess.map(item => {

          if (unlockedKeysFromTokens.includes(item.key)) {
            return { ...item, locked: false };
          }

          return item;
        });


        /* ===== APPLY LOCAL UNLOCK ===== */

        if (finalAccess.length < 4) {

          const updatedDefault = defaultAccess.map(item => ({
            ...item,
            locked: unlockedKeysFromTokens.includes(item.key)
              ? false
              : item.locked
          }));

          setAccess(applyLocalUnlock(updatedDefault));

        } else {

          setAccess(applyLocalUnlock(finalAccess));

        }

      } catch {

        setAccess(applyLocalUnlock(defaultAccess));

      } finally {

        setLoading(false);

      }
    };


    /* ================= LOGIN ================= */

    if (!isLoggedIn) {

      if (
        localStorage.getItem("username") &&
        localStorage.getItem("password")
      ) {

        const email = localStorage.getItem("username");

        const encPwd = localStorage.getItem("password");

        const bytes = CryptoJS.AES.decrypt(
          encPwd,
          'thirancoding360mgai'
        );

        const password = bytes.toString(CryptoJS.enc.Utf8);


        const Login = async () => {

          try {

            const response = await apiClient(
              "quiz/users/login/",
              "POST",
              JSON.stringify({ email, password }),
              { "Content-Type": "application/json" }
            );

            if (response.role === "company") {
              navigate('/TrainerDashboard');
              return;
            }

            setIsLoggedIn(true);

            fetchAccess(email);

          } catch {

            navigate('/LoginPage');

          }
        };

        Login();

      } else {

        navigate('/LoginPage');

      }

    } else {

      const email = localStorage.getItem("username");

      if (email) {

        fetchAccess(email);

      } else {

        setAccess(applyLocalUnlock(defaultAccess));
        setLoading(false);

      }
    }

  }, []);


  /* ================= CONTENT ================= */

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
        return <CompanyCards progress={progress} setSelectedTab={setSelectedTab} />;

      case 'Profile':
        return <UserForm setSelectedTab={setSelectedTab} />;

      default:
        return null;
    }
  };


  /* ================= UI ================= */

  return (

    <>
      {loading ? (

        <Preloader />

      ) : (

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


          {/* SIDEBAR */}

          {!isMobile && (

            <Box
              sx={{
                position: 'fixed',
                width: '250px',
                marginTop: '25px',
                marginLeft: '20px',
                background: '#1976d2',
                color: '#fff',
                borderRadius: '4px',
              }}
            >

              <Typography
                variant="h5"
                sx={{ textAlign: 'center', mt: 1 }}
              >
                Dashboard
              </Typography>

              <Divider sx={{ bgcolor: '#fff' }} />


              <Box sx={{ p: 2 }}>

                {access.map(tab => (

                  <Typography
                    key={tab.label}
                    onClick={() => {
                      if (!tab.locked) setSelectedTab(tab.label);
                    }}
                    sx={{
                      cursor: tab.locked ? 'not-allowed' : 'pointer',
                      mb: 2,
                      p: 1,
                      borderRadius: '4px',
                      background:
                        selectedTab === tab.label
                          ? 'yellow'
                          : 'blue',
                      color:
                        selectedTab === tab.label
                          ? '#001920'
                          : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >

                    {tab.locked && <Lock fontSize="small" />}

                    {tab.label}

                  </Typography>

                ))}

              </Box>

            </Box>
          )}


          {/* MAIN */}

          <Box
            sx={{
              marginLeft: isMobile ? 0 : '250px',
              marginTop: '80px',
              p: 2
            }}
          >
            {renderContent()}
          </Box>


          {/* MOBILE NAV */}

          {isMobile && (

            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: '#000e79',
                zIndex: 1300,
              }}
            >

              <BottomNavigation
                value={selectedTab}
                onChange={(e, v) => {
                  const item = access.find(a => a.label === v);
                  if (!item?.locked) setSelectedTab(v);
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
                      tab.locked ? <Lock /> :
                        tab.label === 'Start Learn' ? <Task /> :
                          tab.label === 'Your Status' ? <Home /> :
                            <Notifications />
                    }
                    disabled={tab.locked}
                  />

                ))}

              </BottomNavigation>

            </Box>
          )}

        </>
      )}
    </>
  );
};

export default Dashboard;