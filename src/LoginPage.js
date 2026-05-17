import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import Spline from "@splinetool/react-spline";
import ErrorBoundary from "./Components/ErrorBoundary.js";
import ForgotPasswordModal from "./Components/ForgotPasswordModal";
import "./LoginPage.css";

const LoginPage = ({ setIsLoggedIn, setUsername, setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let backendSuccess = false;
      let backendData = null;
      let apiErrorMsg = "";

      // 1. Try Real Backend Authentication First
      try {
        const response = await apiClient("quiz/users/login/", "POST", { email, password });
        backendSuccess = true;
        backendData = response;
      } catch (err) {
        apiErrorMsg = err?.status === 401 ? "❌ Invalid credentials." : (err.message || "Server error.");

        // 2. Hardcoded Fallback ONLY if backend fails and it's the team email
        if (email.toLowerCase() === "thiran@gmail.com" && password === "thiran@360") {
          setIsLoggedIn(true);
          setUsername(email);
          setUserRole("admin");
          localStorage.setItem("username", email);
          localStorage.setItem("role", "admin");
          localStorage.setItem("token", "admin_master_token");
          navigate("/adminPanel");
          return;
        }
      }

      if (backendSuccess) {
        setIsLoggedIn(true);
        setUsername(email);
        setUserRole(backendData.role);

        localStorage.setItem("username", email);
        localStorage.setItem("role", backendData.role);
        localStorage.setItem("token", backendData.access || backendData.token);
        
        // --- STORE ADDITIONAL STUDENT DETAILS ---
        if (backendData.username) localStorage.setItem("regNo", backendData.username);
        if (backendData.institute) localStorage.setItem("dept", backendData.institute);
        const encryptedPwd = CryptoJS.AES.encrypt(password, "thirancoding360mgai").toString();
        localStorage.setItem("password", encryptedPwd);

        if (backendData.user_id) {
          const encryptedUserID = CryptoJS.AES.encrypt(backendData.user_id.toString(), "thirancoding360mgai").toString();
          localStorage.setItem("userID", encryptedUserID);
        }

        // --- NEW ROLE-BASED ROUTING ---
        if (backendData.role === "admin") navigate("/adminPanel");
        else if (backendData.role === "member") navigate("/UserDashboard");
        else if (backendData.role === "staff") navigate("/teacherDashboard");
        else if (backendData.role === "doctor") navigate("/doctorDashboard");
        else navigate("/");

      } else {
        // 2. Fallback to Local Cache (for persistence)
        const storedEncryptedPwd = localStorage.getItem("password");
        const storedUsername = localStorage.getItem("username");

        if (storedUsername && storedUsername.trim().toLowerCase() === email.trim().toLowerCase() && storedEncryptedPwd) {
          const decryptedBytes = CryptoJS.AES.decrypt(storedEncryptedPwd, "thirancoding360mgai");
          const decryptedPwd = decryptedBytes.toString(CryptoJS.enc.Utf8);

          if (decryptedPwd === password) {
            const cachedRole = localStorage.getItem("role") || "member";
            setIsLoggedIn(true);
            setUsername(email);
            setUserRole(cachedRole);

            if (cachedRole === "admin") navigate("/adminPanel");
            else if (cachedRole === "member") navigate("/UserDashboard");
            else if (cachedRole === "staff") navigate("/teacherDashboard");
            else if (cachedRole === "doctor") navigate("/doctorDashboard");
            else navigate("/");
          } else {
            setError("❌ Incorrect password.");
          }
        } else {
          setError(apiErrorMsg || "❌ Account not found. Contact Admin for credentials.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-content">
        <h1>Experience the <span className="highlight">Future of Coding</span></h1>
        <div className="spline-wrappers">
          <ErrorBoundary>
            <Spline scene="https://prod.spline.design/dpkpao3qhr3jJYMz/scene.splinecode" />
          </ErrorBoundary>
        </div>
      </div>

      <div className="login-form">
        <h2>Role-Based Login</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FaUser className="me-2" /> Email Address</label>
            <input
              type="email"
              placeholder="name@codingboss.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><FaLock className="me-2" /> Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="forgot-password-link">
              <Link to="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "Secure Login"}
          </button>
        </form>

        <p className="signup-text">
          Access restricted to authorized personnel only.
        </p>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
};

export default LoginPage;
