import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./NavbarComponent";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaTrophy, FaQuestionCircle, FaCheckCircle, FaRocket, FaChartLine } from "react-icons/fa";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import "./Dashboard.css";

const Dashboard = ({
  isLoggedIn,
  userRole,
  setisLoggedIn,
  handleLogout,
  username,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [graphType, setGraphType] = useState("percentage");
  const [mcqResults, setMcqResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState({
    average: 0,
    totalQuestions: 0,
    completed: 0,
  });

  const getUserId = () => {
    try {
      const encrypted = localStorage.getItem("userID");
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, "thirancoding360mgai");
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/LoginPage");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const unlocked = localStorage.getItem("user_token");
    const toastPending = localStorage.getItem("unlock_toast_pending");

    if (unlocked && toastPending === "true") {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      localStorage.removeItem("unlock_toast_pending");
    }
  }, []);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          navigate("/LoginPage");
          return;
        }

        const data = await apiClient(`compiler/mcq-marks/user/${userId}/`, "GET");
        if (!Array.isArray(data)) return;

        setMcqResults(data);

        let totalPercent = 0;
        let totalQuestions = 0;

        data.forEach((test) => {
          totalPercent += Number(test.percentage || 0);
          totalQuestions += Number(test.total_questions || 0);
        });

        setStats({
          average: data.length > 0 ? Math.round(totalPercent / data.length) : 0,
          totalQuestions,
          completed: data.length,
        });
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [navigate]);

  const generateGraphData = () => {
    if (!mcqResults.length) return [];
    return mcqResults.map((test, index) => ({
      day: `T${index + 1}`,
      value: graphType === "percentage" ? test.percentage : test.total_questions,
    }));
  };

  return (
    <div className="db-root">
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setisLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <div className="db-container">
        <header className="db-header">
          <h1 className="db-welcome">Welcome back, <span>{username}</span></h1>
          <p className="db-subtext">Track your progress and mastery across all tracks.</p>
        </header>

        <div className="db-stats-grid">
          <div className="db-card" onClick={() => setGraphType("percentage")}>
            <div className="db-card-icon"><FaTrophy /></div>
            <div className="db-card-value">{stats.average}%</div>
            <div className="db-card-label">Average Accuracy</div>
          </div>

          <div className="db-card" onClick={() => setGraphType("questions")}>
            <div className="db-card-icon"><FaQuestionCircle /></div>
            <div className="db-card-value">{stats.totalQuestions}</div>
            <div className="db-card-label">Questions Solved</div>
          </div>

          <div className="db-card">
            <div className="db-card-icon"><FaCheckCircle /></div>
            <div className="db-card-value">{stats.completed}</div>
            <div className="db-card-label">Tests Completed</div>
          </div>
        </div>

        <section className="db-chart-section">
          <div className="db-chart-header">
            <h3 className="db-chart-title">
              <FaChartLine style={{ marginRight: '12px', color: '#FFA003' }} />
              Performance Analytics
            </h3>
            <div className="db-chart-controls">
              <button 
                className={`db-btn-pill ${graphType === 'percentage' ? 'active' : ''}`}
                onClick={() => setGraphType('percentage')}
              >
                Percentage
              </button>
              <button 
                className={`db-btn-pill ${graphType === 'questions' ? 'active' : ''}`}
                onClick={() => setGraphType('questions')}
              >
                Questions
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 400 }}>
            {loading ? (
              <div className="text-center py-5">Loading analytics...</div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={generateGraphData()}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA003" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FFA003" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FFA003" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {showToast && (
        <div className="db-toast">
          <FaRocket size={24} color="#FFA003" />
          <div>
            <div style={{ fontWeight: 800 }}>Achievement Unlocked!</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Full platform access granted</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;