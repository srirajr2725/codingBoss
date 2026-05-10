import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import Spline from "@splinetool/react-spline";
import ErrorBoundary from "./Components/ErrorBoundary.js";
import "./LoginPage.css";

const LoginPage = ({ setIsLoggedIn, setUsername, setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
        apiErrorMsg = err?.status === 401 ? "❌ Invalid email or password. Please check your credentials." : (err.message || "Server error.");
      }

      if (backendSuccess) {
        // --- REAL BACKEND LOGIN ---
        setIsLoggedIn(true);
        setUsername(email);
        setUserRole(backendData.role);

        localStorage.setItem("username", email);
        localStorage.setItem("role", backendData.role);
        localStorage.setItem("token", backendData.access || backendData.token);

        const userCode = backendData?.user_token || backendData?.data?.user_token;
        if (userCode) {
          localStorage.setItem("user_token", userCode);
          localStorage.setItem(`user_token_${email.toLowerCase()}`, userCode);
        }

        const encryptedPwd = CryptoJS.AES.encrypt(password, "thirancoding360mgai").toString();
        localStorage.setItem("password", encryptedPwd);

        const encryptedUserID = CryptoJS.AES.encrypt(backendData.user_id?.toString() || "12345", "thirancoding360mgai").toString();
        localStorage.setItem("userID", encryptedUserID);

        if (backendData.role === "member") navigate("/UserDashboard");
        else if (backendData.role === "company") navigate("/teacherDashboard");
        else if (backendData.role === "edutech") navigate("/adminPanel");
        else navigate("/");

      } else {
        // 2. Fallback to Strict Local Mock Authentication
        const storedEncryptedPwd = localStorage.getItem("password");
        const storedUsername = localStorage.getItem("username");

        if (storedUsername && storedUsername.trim().toLowerCase() === email.trim().toLowerCase() && storedEncryptedPwd) {
          const decryptedBytes = CryptoJS.AES.decrypt(storedEncryptedPwd, "thirancoding360mgai");
          const decryptedPwd = decryptedBytes.toString(CryptoJS.enc.Utf8);

          if (decryptedPwd === password) {
            // --- PERFECT LOCAL MATCH (BYPASS BACKEND FAILURE) ---
            // Force the selected role so testers can freely switch between dashboards
            const cachedRole = selectedRole;
            const cachedToken = localStorage.getItem("token") || "mock_token";
            const cachedUserToken = localStorage.getItem("user_token") || "mock_user_token";

            setIsLoggedIn(true);
            setUsername(email);
            setUserRole(cachedRole);

            localStorage.setItem("username", email);
            localStorage.setItem("role", cachedRole);
            localStorage.setItem("token", cachedToken);
            localStorage.setItem("user_token", cachedUserToken);
            localStorage.setItem(`user_token_${email.toLowerCase()}`, cachedUserToken);

            const encryptedUserID = CryptoJS.AES.encrypt("12345", "thirancoding360mgai").toString();
            localStorage.setItem("userID", encryptedUserID);

            if (cachedRole === "member") navigate("/UserDashboard");
            else if (cachedRole === "company") navigate("/teacherDashboard");
            else if (cachedRole === "edutech") navigate("/adminPanel");
            else navigate("/");
          } else {
            setError("❌ Incorrect password. Please use the exact password you registered with.");
          }
        } else {
          // If neither backend nor local works, display the original backend error.
          setError(apiErrorMsg || "❌ Account not found. Please Sign Up first to create an account.");
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
        <h2>Welcome Back</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          


          <div className="form-group">
            <label><FaUser className="me-2" /> Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
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
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Workspace"}
          </button>
        </form>

        <p className="signup-text">
          New to CodingBoss? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;