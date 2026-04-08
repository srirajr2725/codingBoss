import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";

// Components
import Preloader from "./Preloader.js";
import SignUp from "./SignUp.js";
import LoginPage from "./LoginPage.js";
import NavbarComponent from "./NavbarComponent.js";
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

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("username"));
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState([
    { id: 1, name: "MCQ Test", locked: true },
    { id: 2, name: "Programming", locked: true },
  ]);

  useEffect(() => {
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
      return <Navigate to="/UserDashboard" replace />;
    }
    return (
      <>
        <NavbarComponent {...{ isLoggedIn, username, userRole, handleLogout, setAccess }} />
        <Banner isLoggedIn={isLoggedIn} />
        <Footer />
      </>
    );
  };

  return (
    <Routes>
      <Route path="/signup" element={<SignUp {...{ setIsLoggedIn, setUsername, setUserRole }} />} />
      <Route path="/LoginPage" element={<LoginPage {...{ setIsLoggedIn, setUsername, setUserRole }} />} />
      <Route path="/" element={renderHome()} />
      <Route path="/SignUp" element={<Navigate to="/signup" replace />} />

      <Route path="/Status" element={<Status {...{ isLoggedIn, username, userRole, handleLogout, setAccess }} />} />
      <Route path="/CourseCard" element={<CourseCard {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/McqTestPage" element={<McqTestPage {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/ProgrammingTestPage" element={<ProgrammingTestPage {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/CourseJava" element={<CourseJava {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/CoursePython" element={<CoursePython {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/CourseC" element={<CourseC {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/CourseDjango" element={<CourseDjango {...{ isLoggedIn, username, access, handleLogout }} />} />

      <Route path="/Dashboard" element={<Dashboard {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/adminDashboard" element={<Userdashboard {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} />} />
      <Route path="/UserDashboard" element={<Admindashboardg {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} />} />

      <Route path="/TestPage" element={<TestPage {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/Uploadquestions" element={<UploadQuestions {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/Company" element={<Company {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/assignments" element={<Assignments {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/instructions" element={<InstructionPage {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/TestResults" element={<ResultsPage {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout }} />} />
      <Route path="/TrainerDashboard" element={<TrainerDashboard {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} />} />
      <Route path="/AdminPanel" element={<AdminPanel {...{ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }} />} />
      <Route path="/projects/:projectName" element={<ProjectForm />} />
      <Route path="/QuestionPage" element={<QuestionPage {...{ isLoggedIn, setIsLoggedIn, username, userRole, handleLogout }} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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