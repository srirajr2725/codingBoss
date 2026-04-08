import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "./utils/apiClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Select from "react-select";
import CryptoJS from "crypto-js";
import Spline from "@splinetool/react-spline";
import ErrorBoundary from "./Components/ErrorBoundary.js";
import "./SignUp.css";

const SignUp = ({ setIsLoggedIn, setUsername, setUserRole }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
    organization: null,
  });

  const [organizations, setOrganizations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await apiClient("trainer/organizations/", "GET");
        if (Array.isArray(response)) {
          setOrganizations(
            response.map((org) => ({
              value: org.id,
              label: org.name,
            }))
          );
        }
      } catch {
        setError("Unable to load organizations. Try again later.");
      }
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrganizationChange = (selectedOption) => {
    setFormData({
      ...formData,
      organization: selectedOption ? selectedOption.value : null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      if (formData.mobile?.trim()) payload.mobile = formData.mobile;
      if (formData.organization) payload.organization = formData.organization;

      const response = await apiClient("quiz/create-user/", "POST", payload);

      if (response?.success && response.data) {
        setSuccess(response.message || "Signup successful!");
        
        const userToken = response.data.user_token;
        const accessToken = response.data.access || response.data.token || response.data.access_token;
        
        if (userToken) {
          localStorage.setItem("user_token", userToken);
          localStorage.setItem(`user_token_${formData.email.toLowerCase()}`, userToken);
        }

        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }

        if (typeof setIsLoggedIn === 'function') {
          setIsLoggedIn(true);
          setUsername(formData.email);
          setUserRole("member");
          localStorage.setItem("username", formData.email);
          localStorage.setItem("role", "member");

          // ✅ FIX: Save the encrypted password so Status.js can perform background recovery!
          const encryptedPwd = CryptoJS.AES.encrypt(formData.password, "thirancoding360mgai").toString();
          localStorage.setItem("password", encryptedPwd);
        }

        setTimeout(() => navigate("/UserDashboard"), 2000);
      } else {
        setError(response?.message || "Signup failed.");
      }
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="left-content">
        <h1>Join Us & Unlock <span className="highlight">Exclusive Features!</span></h1>
        <div className="spline-wrappers">
          <ErrorBoundary>
            <Spline 
              scene="https://prod.spline.design/dpkpao3qhr3jJYMz/scene.splinecode" 
              onLoad={() => console.log("Spline loaded")}
            />
          </ErrorBoundary>
        </div>
      </div>
      <div className="signup-form">
        <h2 style={{ fontSize: "2.5rem", textAlign: "center" }}><span style={{ color: "#FFA003" }}>Sign</span> <span style={{ color: "black" }}>Up</span></h2>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
          <label>Mobile Number</label>
          <input type="tel" name="mobile" placeholder="10 digit mobile" pattern="[0-9]{10}" value={formData.mobile} onChange={handleChange} required />
          <label>Password</label>
          <div className="password-container">
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <label>Organization</label>
          <Select options={organizations} onChange={handleOrganizationChange} placeholder="Select organization" isSearchable className="organization-dropdown" />
          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? "Signing Up..." : "Create Account"}
          </button>
        </form>
        <p className="login-text">Already have an account? <Link to="/LoginPage">Login</Link></p>
      </div>
    </div>
  );
};

export default SignUp;