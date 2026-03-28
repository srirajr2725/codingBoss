import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginPage.css";
import Spline from "@splinetool/react-spline";
import ErrorBoundary from "./Components/ErrorBoundary.js";

const LoginPage = ({ setIsLoggedIn, setUsername, setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= LOGIN HANDLER ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // API CALL
      const response = await apiClient(
        "quiz/users/login/",
        "POST",
        {
          email: email,
          password: password,
        }
      );

      /* ============ SUCCESS ============ */

      setSuccess("Login successful!");

      setIsLoggedIn(true);
      setUsername(email);
      setUserRole(response.role);

      // Store email and role
      localStorage.setItem("username", email);
      localStorage.setItem("role", response.role);

      // ✅ NEW: Store both the JWT (for API) and the Short User Token (for UI)
      // This ensures the Status page can find the short code immediately.
      const userCode = response?.user_token || response?.data?.user_token;
      if (userCode) {
        localStorage.setItem("user_token", userCode);
        localStorage.setItem(`user_token_${email.toLowerCase()}`, userCode);
      }

      // ✅ FIX: Save the encrypted password so Status.js can perform background recovery!
      const encryptedPwd = CryptoJS.AES.encrypt(password, "thirancoding360mgai").toString();
      localStorage.setItem("password", encryptedPwd);

      // Clear old session
      localStorage.removeItem("unlock_toast_pending");

      // Encrypt User ID
      const encryptedUserID = CryptoJS.AES.encrypt(
        response.user_id.toString(),
        "thirancoding360mgai"
      ).toString();

      localStorage.setItem("userID", encryptedUserID);

      // Store JWT Token
      localStorage.setItem("token", response.access);

      /* ============ ROLE BASED ROUTING ============ */

      if (response.role === "member") {
        navigate("/UserDashboard");
      }
      else if (response.role === "company") {
        navigate("/trainerDashboard");
      }
      else if (response.role === "edutech") {
        navigate("/adminPanel");
      }
      else {
        navigate("/");
      }

    } catch (err) {
      console.error("Login Error:", err);

      if (err?.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Server error. Please try again later.");
      }

    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="login-container">

      {/* LEFT SIDE */}
      <div className="left-content">
        <h1>
          Get Codified with our <span className="highlight">New Features!</span>
        </h1>

        <div className="spline-wrappers">
          <ErrorBoundary>
            <Spline scene="https://prod.spline.design/dpkpao3qhr3jJYMz/scene.splinecode" />
          </ErrorBoundary>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-form">

        <h2 style={{ fontSize: "2.5rem", textAlign: "center" }}>
          <span style={{ color: "#FFA003" }}>Log</span>{" "}
          <span style={{ color: "black" }}>In</span>
        </h2>

        {/* Messages */}
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <label>Password</label>

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* SIGNUP */}
        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup">Create Account</Link>
        </p>

      </div>

    </div>
  );
};

export default LoginPage;