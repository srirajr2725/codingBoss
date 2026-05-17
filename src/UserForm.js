import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import apiClient from './utils/apiClient';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Avatar,
  IconButton,
  Paper
} from '@mui/material';
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaBuilding,
  FaLock,
  FaCamera,
  FaCheckCircle,
  FaChartLine,
  FaBullseye,
  FaListUl
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserForm.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    registerNumber: localStorage.getItem('regNo') || '21CS001',
    department: localStorage.getItem('dept') || 'Computer Science',
    email: localStorage.getItem('username') || 'student@college.edu',
    password: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [resetStep, setResetStep] = useState(0); // 0: None, 1: OTP, 2: Passwords
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const storedEmail = localStorage.getItem('username');
        if (!storedEmail) return;

        const data = await apiClient(`https://unlanded-isela-unmunificently.ngrok-free.dev/quiz/users/profile/?email=${storedEmail}`, "GET");
        if (data) {
          setProfile(prev => ({
            ...prev,
            name: data.name || data.email || prev.name,
            registerNumber: data.username || prev.registerNumber,
            department: data.institute || prev.department,
            email: data.email || prev.email,
          }));

          if (data.user_id) {
            fetchPerformance(data.user_id);
          }

          if (data.username) localStorage.setItem('regNo', data.username);
          if (data.institute) localStorage.setItem('dept', data.institute);
        }
      } catch (error) {
        console.error("Failed to fetch student details:", error);
      }
    };

    fetchStudentDetails();

    const encryptedPwd = localStorage.getItem('password');
    if (encryptedPwd) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedPwd, "thirancoding360mgai");
        const decryptedPwd = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedPwd) {
          setProfile(prev => ({ ...prev, password: decryptedPwd }));
        }
      } catch (e) {
        console.error("Error decrypting password:", e);
      }
    }
  }, []);

  const fetchPerformance = async (userId) => {
    try {
      const data = await apiClient(`https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/student-performance/${userId}/`, "GET");
      setPerformance(data);
    } catch (error) {
      console.error("Failed to fetch performance:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    localStorage.setItem('regNo', profile.registerNumber);
    localStorage.setItem('dept', profile.department);
    toast.success('🚀 Profile Updated Successfully!');
  };

  const handleRequestOTP = async () => {
    if (!profile.email) return;
    setLoading(true);
    try {
      await apiClient("https://unlanded-isela-unmunificently.ngrok-free.dev/quiz/send-otp/", "POST", { email: profile.email });
      toast.success("🔑 OTP sent to your email!");
      setResetStep(1);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalReset = async () => {
    if (!otp || !newPassword) return;
    setLoading(true);
    try {
      await apiClient("https://unlanded-isela-unmunificently.ngrok-free.dev/quiz/reset-password/", "POST", {
        email: profile.email,
        otp: otp,
        new_password: newPassword
      });
      toast.success("✅ Password reset successful!");
      const encryptedPwd = CryptoJS.AES.encrypt(newPassword, "thirancoding360mgai").toString();
      localStorage.setItem("password", encryptedPwd);
      setProfile(prev => ({ ...prev, password: newPassword }));
      setResetStep(0);
      setOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uf-container uf-animate">
      <ToastContainer />
      <Paper className="profile-main-card">
        <div className="profile-header-minimal">
          <div className="profile-avatar-wrapper">
            <Avatar
              src={imagePreview}
              sx={{ width: 140, height: 140, border: '6px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            >
              {profile.name.charAt(0)}
            </Avatar>
            <IconButton className="avatar-edit-btn">
              <FaCamera size={16} />
              <input type="file" hidden onChange={(e) => setImagePreview(URL.createObjectURL(e.target.files[0]))} />
            </IconButton>
          </div>
          <div className="profile-intro">
            <Typography variant="h4" fontWeight={900}>{profile.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">Official Student Profile</Typography>
          </div>
        </div>

        <div className="uf-section-divider"></div>

        <div className="uf-content-body">
          <h3 className="uf-section-title-clean"><FaIdCard className="me-2" /> Academic Credentials</h3>
          <div className="uf-form-grid-modern">
            <div className="uf-input-group">
              <label>Register Number</label>
              <div className="input-with-icon">
                <FaIdCard />
                <input type="text" name="registerNumber" value={profile.registerNumber} onChange={handleChange} />
              </div>
            </div>
            <div className="uf-input-group">
              <label>Department</label>
              <div className="input-with-icon">
                <FaBuilding />
                <input type="text" name="department" value={profile.department} onChange={handleChange} />
              </div>
            </div>
            <div className="uf-input-group">
              <label>Institutional Email</label>
              <div className="input-with-icon">
                <FaEnvelope />
                <input type="email" name="email" value={profile.email} onChange={handleChange} />
              </div>
            </div>
            <div className="uf-input-group">
              <label>Account Password</label>
              <div className="input-with-icon">
                <FaLock />
                <input type="password" name="password" value={profile.password} onChange={handleChange} />
              </div>
              <Button variant="text" size="small" onClick={handleRequestOTP} sx={{ textTransform: 'none', mt: 1 }}>
                Forgot Password?
              </Button>
            </div>

            {resetStep === 1 && (
              <div className="uf-reset-section">
                <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Enter OTP" />
                <Button fullWidth variant="contained" onClick={() => setResetStep(2)} sx={{ mt: 2 }}>Continue</Button>
              </div>
            )}

            {resetStep === 2 && (
              <div className="uf-reset-section">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
                <Button fullWidth variant="contained" onClick={handleFinalReset} sx={{ mt: 2 }}>Reset Password</Button>
              </div>
            )}
          </div>

          <Button fullWidth className="uf-save-btn-premium" onClick={handleUpdate} sx={{ mt: 4 }}>
            Save Profile Changes <FaCheckCircle style={{ marginLeft: 12 }} />
          </Button>
        </div>
      </Paper>

      {performance && (
        <Paper className="profile-main-card" style={{ marginTop: '30px', padding: '32px' }}>
          <h3 className="uf-section-title-clean"><FaChartLine className="me-2" /> Performance Analytics</h3>
          <div className="performance-overview-grid">
            <div className="perf-mini-card">
              <FaBullseye className="icon" />
              <div className="info">
                <span className="label">Overall Accuracy</span>
                <span className="value">{performance.overall_stats?.overall_accuracy}</span>
              </div>
            </div>
            <div className="perf-mini-card">
              <FaListUl className="icon" />
              <div className="info">
                <span className="label">Total Questions</span>
                <span className="value">{performance.overall_stats?.total_questions}</span>
              </div>
            </div>
            <div className="perf-mini-card">
              <FaCheckCircle className="icon" />
              <div className="info">
                <span className="label">Correct Answers</span>
                <span className="value">{performance.overall_stats?.total_correct}</span>
              </div>
            </div>
          </div>

          <div className="topics-analysis" style={{ marginTop: '40px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Topic-wise Accuracy</h4>
            <div className="topics-progress-list">
              {performance.performance_by_subtype && Object.entries(performance.performance_by_subtype).map(([topic, stats], idx) => (
                <div key={idx} className="topic-progress-item">
                  <div className="topic-header">
                    <span className="name">{topic}</span>
                    <span className="acc">{stats.accuracy}</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: stats.accuracy }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Paper>
      )}

      <style>{`
        .performance-overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 24px; }
        .perf-mini-card { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; }
        .perf-mini-card .icon { font-size: 1.5rem; color: #6366f1; }
        .perf-mini-card .label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
        .perf-mini-card .value { display: block; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
        .topic-progress-item { margin-bottom: 20px; }
        .topic-header { display: flex; justifyContent: space-between; margin-bottom: 8px; }
        .topic-header .name { font-weight: 700; color: #334155; font-size: 0.9rem; }
        .topic-header .acc { font-weight: 800; color: #6366f1; font-size: 0.9rem; }
        .bar-bg { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
        .bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 5px; }
      `}</style>
    </div>
  );
};

export default StudentProfile;
