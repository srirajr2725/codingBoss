import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";

// Components
import Preloader from "./Preloader.js";
import SignUp from "./SignUp.js";
import LoginPage from "./LoginPage.js";
import NavbarComponent from "./NavbarComponent.js" ;
import Banner from "./Banner.js";
import Footer from "./Footer.js";
import Status from "./Status.js";
import CourseCard from "./CourseCard.js";
import McqTestPage from "./McqTestPage.js";
import ProgrammingTestPage from "./ProgrammingTestPage.js";
import CourseJava from "./CourseJava.js";
import CoursePython from "./CoursePython.js";
import CourseC from "./CourseC.js";
import Dashboard from "./Dashboard.js";
import Userdashboard from "./CollegeAdminDashboard.js";
import Admindashboardg from "./CollegeStudentDashboard.js";
import UploadQuestions from "./Uploadquestions.js";
import TestPage from "./Testpage.js";
import Company from "./Company.js";
import Assignments from "./Assignments.js";
import InstructionPage from './InstructionPage.jsx';
import ResultsPage from "./ResultsPage.js";
import CourseDjango from "./django.js";
import QuestionPage from "./QuestionPage.js";
import ProjectForm from "./ProjectForm.js";
import AdminPanel from "./TrainingComponent/AdminPanel.js";
import TrainerDashboard from "./TrainingComponent/TrainerDashboard.js";
import TeacherDashboard from "./TrainingComponent/TeacherDashboard.js";
import DoctorDashboard from "./TrainingComponent/DoctorDashboard.js";
import ProctoringRecords from "./TrainingComponent/ProctoringRecords.js";
import LogoSection from "./LogoSection.js";
import Frontcourse from "./Frontcourse.js";
import OurOfferings from "./OurOfferings.js";
import CounterSection from "./CounterSection.js";
import WhyUs from "./WhyUs.js";

import Learn from "./Learn.js";
import GlobalAIAssistant from "./GlobalAIAssistant.js";
import InnovativeLearning from "./InnovativeLearning.js";


function AppWrapper() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("username"));
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState([
    { id: 1, name: "MCQ Test", locked: false },
    { id: 2, name: "Programming", locked: false },
    { id: 3, name: "Task", locked: false },
    { id: 4, name: "Assignments", locked: false },
    { id: 5, name: "Courses", locked: false },
    { id: 6, name: "Company", locked: false },
  ]);

  useEffect(() => {
    // 🛡️ SILENCE CROSS-ORIGIN "SCRIPT ERROR" OVERLAYS
    const originalOnError = window.onerror;
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      if (msg === "Script error." || (url && url.includes("bundle.js") && msg.includes("handleError"))) {
        console.warn("CORS/CDN script error silenced:", msg, url);
        return true;
      }
      if (originalOnError) return originalOnError(msg, url, lineNo, columnNo, error);
      return false;
    };

    // Check access
    const unlocked = localStorage.getItem("user_token");
    if (unlocked) {
      setAccess((prev) => prev.map(item => ({ ...item, locked: false })));
    }

    // 🔥 AUTO-FETCH ACCESS TOKEN IF MISSING
    const fetchPermToken = async () => {
      const email = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      const encPwd = localStorage.getItem("password");

      if (email && encPwd && !token) {
        try {
          const bytes = CryptoJS.AES.decrypt(encPwd, 'thirancoding360mgai');
          const password = bytes.toString(CryptoJS.enc.Utf8);

          if (!password) return;

          // Perform background re-auth to get the fresh tokens
          const res = await apiClient("quiz/users/login/", "POST", { email, password });

          const authToken = res?.access || res?.token;
          const displayToken = res?.user_token || res?.data?.user_token;

          if (displayToken) {
            localStorage.setItem("user_token", displayToken);
            localStorage.setItem(`user_token_${email.toLowerCase()}`, displayToken);
            console.log("Permanent User Token recovered.");
          }

          if (authToken) {
            localStorage.setItem("token", authToken);
          }
        } catch (err) {
          console.error("Auto-token recovery failed:", err);
        }
      }
    };

    if (isLoggedIn) {
      fetchPermToken();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setUserRole("");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userID");
    localStorage.removeItem("token");
    localStorage.removeItem("user_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("password");
  };

  const renderHome = () => {
    if (isLoggedIn) {
      if (userRole === "admin") return <Navigate to="/adminPanel" replace />;
      if (userRole === "staff") return <Navigate to="/teacherDashboard" replace />;
      if (userRole === "doctor") return <Navigate to="/doctorDashboard" replace />;
      return <Navigate to="/UserDashboard" replace />; // Default for member
    }
    return (
      <>
        <NavbarComponent {...{ isLoggedIn, username, userRole, handleLogout, setAccess }} />
        <Banner isLoggedIn={isLoggedIn} />
        <LogoSection />
        <Frontcourse isLoggedIn={isLoggedIn} />
        <OurOfferings />
        <CounterSection />
        <WhyUs />
        <InnovativeLearning />

        <Footer />
      </>
    );
  };

  return (
    <>
      <Routes>
        {/* Authentication */}
        <Route path="/LoginPage" element={<LoginPage {...{ setIsLoggedIn, setUsername, setUserRole }} />} />
        <Route path="/" element={renderHome()} />

        {/* Dashboards */}
        <Route path="/UserDashboard" element={isLoggedIn ? <Admindashboardg {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/teacherDashboard" element={isLoggedIn ? <TeacherDashboard {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/doctorDashboard" element={isLoggedIn ? <DoctorDashboard {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/adminPanel" element={isLoggedIn ? <AdminPanel {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} /> : <Navigate to="/LoginPage" replace />} />

        {/* Existing Routes... */}
        <Route path="/Status" element={isLoggedIn ? <Status {...{ isLoggedIn, username, userRole, handleLogout, setAccess }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/CourseCard" element={isLoggedIn ? <CourseCard {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/McqTestPage" element={isLoggedIn ? <McqTestPage {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/ProgrammingTestPage" element={isLoggedIn ? <ProgrammingTestPage {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/CourseJava" element={isLoggedIn ? <CourseJava {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/CoursePython" element={isLoggedIn ? <CoursePython {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/CourseC" element={isLoggedIn ? <CourseC {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/CourseDjango" element={isLoggedIn ? <CourseDjango {...{ isLoggedIn, username, access, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />

        <Route path="/Dashboard" element={isLoggedIn ? <Dashboard {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/TestPage" element={isLoggedIn ? <TestPage {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/Uploadquestions" element={isLoggedIn ? <UploadQuestions {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/Company" element={isLoggedIn ? <Company {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/assignments" element={isLoggedIn ? <Assignments {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/instructions" element={isLoggedIn ? <InstructionPage {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/TestResults" element={isLoggedIn ? <ResultsPage {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/proctoringRecords" element={isLoggedIn ? <ProctoringRecords /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/projects/:projectName" element={isLoggedIn ? <ProjectForm /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/QuestionPage" element={isLoggedIn ? <QuestionPage {...{ isLoggedIn, setIsLoggedIn, username, userRole, handleLogout }} /> : <Navigate to="/LoginPage" replace />} />
        <Route path="/courses" element={isLoggedIn ? <Learn /> : <Navigate to="/LoginPage" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isLoggedIn && userRole === 'member' && <GlobalAIAssistant />}
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppWrapper />
    </Router>
  );
}

export default App;
