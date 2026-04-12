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

import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";

import "./Dashboard.css"; // Make sure this exists

const Dashboard = ({
  isLoggedIn,
  userRole,
  setisLoggedIn,
  handleLogout,
  username,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const studentData = location.state?.student;

  const [graphType, setGraphType] = useState("percentage");

  const [mcqResults, setMcqResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Toast State
  const [showToast, setShowToast] = useState(false);

  const [stats, setStats] = useState({
    average: 0,
    totalQuestions: 0,
    completed: 0,
  });

  // ================= GET USER ID =================
  const getUserId = () => {
    try {
      const encrypted = localStorage.getItem("userID");

      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(
        encrypted,
        "thirancoding360mgai"
      );

      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  };

  // ================= AUTO LOGIN =================
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/LoginPage");
    }
  }, [isLoggedIn, navigate]);

  // ================= SHOW TOAST =================
  useEffect(() => {
    // We check for the token to confirm access, 
    // but check a specific toast flag so the popup only appears once.
    const unlocked = localStorage.getItem("user_token");
    const toastPending = localStorage.getItem("unlock_toast_pending");

    if (unlocked && toastPending === "true") {
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // Remove only the toast flag, NOT the user_token
      localStorage.removeItem("unlock_toast_pending");
    }
  }, []);

  // ================= FETCH MARKS =================
  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const userId = getUserId();

        if (!userId) {
          navigate("/LoginPage");
          return;
        }

        const data = await apiClient(
          `compiler/mcq-marks/user/${userId}/`,
          "GET"
        );

        console.log("MCQ Results:", data);

        if (!Array.isArray(data)) return;

        setMcqResults(data);

        let totalPercent = 0;
        let totalQuestions = 0;

        data.forEach((test) => {
          totalPercent += Number(test.percentage || 0);
          totalQuestions += Number(test.total_questions || 0);
        });

        setStats({
          average:
            data.length > 0
              ? Math.round(totalPercent / data.length)
              : 0,

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

  // ================= GRAPH =================
  const generateGraphData = () => {
    if (!mcqResults.length) return [];

    return mcqResults.map((test, index) => ({
      day: `Test ${index + 1}`,
      value:
        graphType === "percentage"
          ? test.percentage
          : graphType === "questions"
            ? test.total_questions
            : 1,
    }));
  };

  const graphData = generateGraphData();

  // ================= STYLES =================
  const dashboardContainerStyle = {
    textAlign: "center",
    padding: "20px",
  };

  const infoCardsStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap",
  };

  const infoCardStyle = {
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    width: "180px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  };

  // ================= UI =================
  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setisLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      {/* ✅ MODERN TOAST */}
      {showToast && (
        <div className="modern-toast">
          <div className="toast-icon">🚀</div>
          <div className="toast-content">
            <h4>Access Unlocked</h4>
            <p>You now have full access</p>
          </div>
        </div>
      )}

      <div style={dashboardContainerStyle}>

        <h2>{username}</h2>

        {/* INFO CARDS */}
        <div style={infoCardsStyle}>

          <div
            style={infoCardStyle}
            onClick={() => setGraphType("percentage")}
          >
            <h5><b>Average Score</b></h5>
            <p>{stats.average}%</p>
          </div>

          <div
            style={infoCardStyle}
            onClick={() => setGraphType("questions")}
          >
            <h5><b>Total Questions</b></h5>
            <p>{stats.totalQuestions}</p>
          </div>

          <div
            style={infoCardStyle}
            onClick={() => setGraphType("assessments")}
          >
            <h5><b>Completed Tests</b></h5>
            <p>{stats.completed}</p>
          </div>

        </div>

        {/* GRAPH */}
        <div
          style={{
            marginTop: "60px",
            backgroundColor: "#f0f0f0",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            maxWidth: "700px",
            margin: "60px auto",
          }}
        >
          <h4>

            {graphType === "percentage"
              ? "Marks Percentage History"
              : graphType === "questions"
                ? "Questions Per Test"
                : "Completed Tests"}

          </h4>

          {loading ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>

              <AreaChart data={graphData}>

                <defs>
                  <linearGradient
                    id="colorData"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis
                  label={{
                    value:
                      graphType === "percentage"
                        ? "Percentage"
                        : "Count",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorData)"
                />

              </AreaChart>

            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;