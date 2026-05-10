import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "./utils/apiClient";
import { FaEye, FaEyeSlash, FaUser, FaPhone, FaBuilding, FaLock, FaCheckCircle, FaArrowRight, FaRocket } from "react-icons/fa";
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
    role: "member",
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
        if (Array.isArray(response) && response.length > 0) {
          setOrganizations(response.map((org) => ({ value: org.id, label: org.name })));
        } else {
          setOrganizations(getDefaultOrgs());
        }
      } catch {
        // Fallback to static list if API is unavailable
        setOrganizations(getDefaultOrgs());
      }
    };
    fetchOrganizations();
  }, []);

  const getDefaultOrgs = () => [
    { value: 1, label: 'Anna University' },
    { value: 2, label: 'VIT University' },
    { value: 3, label: 'SRM Institute of Science and Technology' },
    { value: 4, label: 'PSG College of Technology' },
    { value: 5, label: 'Amrita School of Engineering' },
    { value: 6, label: 'Coimbatore Institute of Technology' },
    { value: 7, label: 'Hindustan College of Engineering' },
    { value: 8, label: 'Bannari Amman Institute of Technology' },
    { value: 9, label: 'RMK Engineering College' },
    { value: 10, label: 'Other' },
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOrganizationChange = (selectedOption) => {
    setFormData({ ...formData, organization: selectedOption ? selectedOption.value : null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { email: formData.email, password: formData.password };
      if (formData.mobile?.trim()) payload.mobile = formData.mobile;
      if (formData.organization) payload.organization = formData.organization;

      const response = await apiClient("quiz/create-user/", "POST", payload);

      if (response?.success || response?.data) {
        setSuccess("Account created successfully!");
        
        const userToken = response.data?.user_token;
        const accessToken = response.data?.access;
        const assignedRole = formData.role;
        
        if (userToken) {
          localStorage.setItem("user_token", userToken);
          localStorage.setItem(`user_token_${formData.email.toLowerCase()}`, userToken);
        }

        if (accessToken) localStorage.setItem("token", accessToken);

        setIsLoggedIn(true);
        setUsername(formData.email);
        setUserRole(assignedRole);
        localStorage.setItem("username", formData.email);
        localStorage.setItem("role", assignedRole);

        const encryptedPwd = CryptoJS.AES.encrypt(formData.password, "thirancoding360mgai").toString();
        localStorage.setItem("password", encryptedPwd);

        // 🛡️ Set userID after signup to prevent "No user ID found" errors
        const encryptedUserID = CryptoJS.AES.encrypt(response.data?.id?.toString() || "12345", "thirancoding360mgai").toString();
        localStorage.setItem("userID", encryptedUserID);

        const target = assignedRole === "company" ? "/trainerDashboard" : (assignedRole === "edutech" ? "/adminPanel" : "/UserDashboard");
        setTimeout(() => navigate(target), 1500);
      } else {
        setError(response?.message || "Signup failed.");
      }
    } catch (err) {
      setError(err.message?.includes("exists") ? "Account already created" : (err.message || "Signup failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">

      {/* ── PREMIUM SUCCESS OVERLAY ── */}
      {success && (
        <div className="su-success-overlay">
          <div className="su-success-card">
            <div className="su-success-icon-ring">
              <div className="su-success-icon-ring-2">
                <FaCheckCircle className="su-success-check" />
              </div>
            </div>
            <div className="su-success-badge">🚀 WELCOME TO THE ELITE</div>
            <h1 className="su-success-h1">Account <span>Created!</span></h1>
            <p className="su-success-p">You're now part of the CodingBoss community. Your journey to becoming a top engineer starts now.</p>
            <div className="su-success-email-tag">{formData.email}</div>
            <div className="su-success-loading">
              <div className="su-success-bar"></div>
            </div>
            <p className="su-success-redirect">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      <div className="left-content">
        <h1>Start Your <span className="highlight">Elite Journey</span></h1>
        <div className="spline-wrappers">
          <ErrorBoundary>
            <Spline scene="https://prod.spline.design/dpkpao3qhr3jJYMz/scene.splinecode" />
          </ErrorBoundary>
        </div>
      </div>

      <div className="signup-form">
        <h2>Create Account</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* --- ROLE SELECTOR --- */}
          <div className="form-group">
            <label><FaUser className="me-2" /> Select Your Role</label>
            <Select 
              options={[
                { value: 'member', label: 'Student' },
                { value: 'company', label: 'Trainer' },
                { value: 'edutech', label: 'Admin' }
              ]} 
              defaultValue={{ value: 'member', label: 'Student' }}
              onChange={(opt) => setFormData({...formData, role: opt.value})} 
              className="organization-dropdown"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-group">
            <label><FaUser className="me-2" /> Email Address</label>
            <input type="email" name="email" placeholder="name@email.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FaPhone className="me-2" /> Mobile Number</label>
            <input type="tel" name="mobile" placeholder="10 digit number" pattern="[0-9]{10}" value={formData.mobile} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FaLock className="me-2" /> Security Password</label>
            <div className="password-container">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Min 8 characters" value={formData.password} onChange={handleChange} required />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label><FaBuilding className="me-2" /> Organization / College</label>
            <Select 
              options={organizations} 
              onChange={handleOrganizationChange} 
              placeholder="Search your institution" 
              className="organization-dropdown"
              classNamePrefix="react-select"
            />
          </div>

          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? "Creating Account..." : "Join CodingBoss Elite"}
          </button>
        </form>

        <p className="login-text">Already a member? <Link to="/LoginPage">Login</Link></p>
      </div>
    </div>
  );
};

export default SignUp;