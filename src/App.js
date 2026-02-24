import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Preloader from "./Preloader.js";
import Banner from "./Banner.js";
import LogoSection from "./LogoSection.js";
import Footer from "./Footer.js";
import SignUp from "./SignUp.js";
import LoginPage from "./LoginPage.js";
import Test from "./Test.js";
import McqTestPage from "./McqTestPage.js";
import QuestionPage from "./QuestionPage";
import ProgrammingTestPage from "./ProgrammingTestPage.js";
import CourseJava from "./CourseJava.js";
import CoursePython from "./CoursePython.js";
import CourseC from "./CourseC.js";
import Dashboard from "./Dashboard.js";
import CoursesSection from "./CoursesSection.js";
import Userdashboard from "./CollegeAdminDashboard.js";
import Admindashboardg from "./CollegeStudentDashboard.js";
import UploadQuestions from "./Uploadquestions.js";
import TestPage from "./Testpage.js";
import Company from "./Company.js";
import OurOfferings from "./OurOfferings.js";
import WhyUs from "./WhyUs.js";
import TrainerDashboard from "./TrainingComponent/TrainerDashboard.js";
import Assignments from "./Assignments.js";
import Status from "./Status.js";
import AdminPanel from "./TrainingComponent/AdminPanel";
import ProjectForm from "./ProjectForm.js";
import QueriesPage from "./QueriesPage.js";
import CounterSection from "./CounterSection.js";
import NavbarComponent from "./NavbarComponent.js";
import InstructionPage from './InstructionPage.jsx';
import CourseCard from "./CourseCard.js";
import ResultsPage from "./ResultsPage.js";

function AppWrapper() {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");

  // ✅ 1. New Access State
  const [access, setAccess] = useState([
    { id: 1, name: "MCQ Test", locked: true },
    { id: 2, name: "Programming", locked: true },
  ]);

  // ✅ 2. Persistence: Restore access if user_token exists in localStorage
  useEffect(() => {
    const unlocked = localStorage.getItem("user_token");
    if (unlocked) {
      setAccess((prev) => prev.map(item => ({ ...item, locked: false })));
    }
  }, [username]); // Re-check whenever user changes

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem("hasVisited", "true");
      }, 3000);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      handleLogout();
    }
  }, [location]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setUserRole("");
    setPassword("");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("role");
    localStorage.removeItem("userID");
    localStorage.removeItem("sessionUnlockedKeys");
    
    // ✅ 3. Clear access on logout
    localStorage.removeItem("user_token");
    localStorage.removeItem("unlock_toast_pending");
    setAccess((prev) => prev.map(item => ({ ...item, locked: true })));
  };

  const renderHome = () => (
    <>
      <NavbarComponent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />
      <Banner isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <CoursesSection />
      <OurOfferings />
      <WhyUs />
      <LogoSection />
      <CounterSection />
      <QueriesPage />
      <Footer />
    </>
  );

  return loading ? (
    <Preloader />
  ) : (
    <Routes>
      <Route path="/" element={renderHome()} />
      <Route path="/LoginPage" element={
        <LoginPage
          setIsLoggedIn={setIsLoggedIn}
          setUsername={setUsername}
          setUserRole={setUserRole}
        />
      } />
      <Route path="/SignUp" element={
        <SignUp
          setIsLoggedIn={setIsLoggedIn}
          setUsername={setUsername}
          setUserRole={setUserRole}
        />
      } />
      
      {/* ✅ 4. Pass access state to all relevant routes */}
      <Route path="/Status" element={
        <Status {...{ isLoggedIn, username, userRole, handleLogout, setAccess }} />
      } />
      
      <Route path="/CourseCard" element={
        <CourseCard {...{ isLoggedIn, username, access, handleLogout }} />
      } />

      <Route path="/McqTestPage" element={
        <McqTestPage {...{ isLoggedIn, username, access, handleLogout }} />
      } />

      <Route path="/ProgrammingTestPage" element={
        <ProgrammingTestPage {...{ isLoggedIn, username, access, handleLogout }} />
      } />

      <Route path="/CourseJava" element={<CourseJava {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/CoursePython" element={<CoursePython {...{ isLoggedIn, username, access, handleLogout }} />} />
      <Route path="/CourseC" element={<CourseC {...{ isLoggedIn, username, access, handleLogout }} />} />

      {/* Other components remain unchanged */}
      <Route path="/Dashboard" element={<Dashboard {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/adminDashboard" element={<Userdashboard {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/Userdashboard" element={<Admindashboardg {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/TestPage" element={<TestPage {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/Uploadquestions" element={<UploadQuestions {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/Company" element={<Company {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/assignments" element={<Assignments {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/instructions" element={<InstructionPage {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/TestResults" element={<ResultsPage {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/TrainerDashboard" element={<TrainerDashboard {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/AdminPanel" element={<AdminPanel {...{ isLoggedIn, username, handleLogout }} />} />
      <Route path="/projects/:projectName" element={<ProjectForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
           <Route
        path="/QuestionPage"
        element={
          <QuestionPage
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            username={username}
            userRole={userRole}
            handleLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;