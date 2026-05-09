import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { FaUnlock, FaHistory, FaChartLine, FaTrophy, FaLightbulb, FaCheckCircle, FaStar, FaCopy } from "react-icons/fa";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import "./Status.css";

const Status = ({ isLoggedIn, setAccess }) => {
  const [userEmail, setUserEmail] = useState("");
  const [mcqResults, setMcqResults] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [userSpecificToken, setUserSpecificToken] = useState(() => localStorage.getItem("user_token") || "");
  const [programStats, setProgramStats] = useState({ totalTests: 0, averageMarks: 0 });
  const [programTotal, setProgramTotal] = useState("0 / 0");
  const [performanceData, setPerformanceData] = useState({ totalAttempts: 0, averageScore: 0, totalMarks: 0, maxMarks: 0 });
  const [isTaskUnlocked, setIsTaskUnlocked] = useState(true);
  const [isCourseUnlocked, setIsCourseUnlocked] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [courseCouponCode, setCourseCouponCode] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const getUserId = () => {
    try {
      const encrypted = localStorage.getItem("userID");
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, "thirancoding360mgai");
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch { return null; }
  };

  useEffect(() => {
    const email = localStorage.getItem("username") || "";
    if (email) setUserEmail(email);

    const tokenKey = `user_token_${email.toLowerCase()}`;
    const storedToken = localStorage.getItem("user_token") || localStorage.getItem(tokenKey);

    if (storedToken) {
      setUserSpecificToken(storedToken);
      return;
    }

    const fetchToken = async () => {
      try {
        const encPwd = localStorage.getItem("password");
        if (!email || !encPwd) return;
        const bytes = CryptoJS.AES.decrypt(encPwd, 'thirancoding360mgai');
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const res = await apiClient("quiz/users/login/", "POST", { email, password });
        const displayToken = res?.user_token || res?.data?.user_token;
        if (displayToken) {
          localStorage.setItem("user_token", displayToken);
          localStorage.setItem(tokenKey, displayToken);
          setUserSpecificToken(displayToken);
        }
      } catch (err) { console.error(err); }
    };
    if (isLoggedIn) fetchToken();
  }, [isLoggedIn]);

  useEffect(() => {
    const email = localStorage.getItem("username");
    if (!email) return;
    if (localStorage.getItem(`task_unlocked_${email}`) === "true") setIsTaskUnlocked(true);
    if (localStorage.getItem(`course_unlocked_${email}`) === "true") setIsCourseUnlocked(true);

    const fetchStatus = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        const data = await apiClient(`compiler/mcq-marks/user/${userId}/`, "GET");
        if (Array.isArray(data?.results)) {
          const results = data.results;
          setMcqResults(results);
          let totalScore = 0;
          let totalMarks = 0;
          let maxMarks = 0;
          const chartData = results.map((test, index) => {
            totalScore += Number(test.percentage || 0);
            totalMarks += Number(test.marks || 0);
            maxMarks += Number(test.total_questions || 0);
            return { date: `T${index + 1}`, avgScore: Number(test.percentage || 0) };
          });
          setDailyStats(chartData);
          setPerformanceData({
            totalAttempts: results.length,
            averageScore: results.length > 0 ? (totalScore / results.length).toFixed(1) : 0,
            totalMarks,
            maxMarks
          });
        }
        const pData = await apiClient(`compiler/average_program_marks/?user_id=${userId}`, "GET");
        if (pData) setProgramStats({ totalTests: pData.total_programs || 0, averageMarks: pData.avg_marks || 0 });
        const tData = await apiClient(`compiler/total-program-marks/?user_id=${userId}`, "GET");
        if (tData) setProgramTotal(tData.result || "0 / 0");
      } catch (err) { console.error(err); }
    };
    fetchStatus();
  }, [userSpecificToken]);

  const handleQuickUnlock = () => {
    if (userSpecificToken && userSpecificToken !== 'FETCHING...') {
      setCouponCode(userSpecificToken);
      handleMasterUnlock(userSpecificToken);
    }
  };

  const handleMasterUnlock = async (tokenInput = null) => {
    // If tokenInput is an event object (from onClick), ignore it and use couponCode
    const tokenToUse = (typeof tokenInput === 'string') ? tokenInput : couponCode;
    
    if (!tokenToUse) return showToast("Please enter your token", "error");
    
    try {
      const email = localStorage.getItem("username");
      const result = await apiClient(`quiz/verify-token/?email=${encodeURIComponent(email)}`, "POST", { user_token: tokenToUse.trim() });

      if (result && result.success) {
        const cleanToken = tokenToUse.trim();
        const emailKey = email.toLowerCase();
        
        localStorage.setItem("user_token", cleanToken);
        localStorage.setItem(`user_token_${emailKey}`, cleanToken);
        localStorage.setItem(`task_unlocked_${email}`, "true");
        localStorage.setItem(`course_unlocked_${email}`, "true");
        
        setIsTaskUnlocked(true);
        setIsCourseUnlocked(true);

        if (typeof setAccess === "function") {
          setAccess((prev) => prev.map((item) => {
            if (["Task", "Assignments", "Courses", "Company"].includes(item.label)) {
              return { ...item, locked: false };
            }
            return item;
          }));
        }

        showToast("🚀 All Premium Features Unlocked!");
        setCouponCode("");
      } else {
        showToast("❌ Invalid Token", "error");
      }
    } catch (err) {
      showToast("⚠ Connection Error", "error");
    }
  };

  const handleCopyToken = () => {
    if (userSpecificToken && userSpecificToken !== 'FETCHING...') {
      // Modern API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(userSpecificToken)
          .then(() => showToast("Token copied to clipboard!"))
          .catch(() => fallbackCopy(userSpecificToken));
      } else {
        // Fallback
        fallbackCopy(userSpecificToken);
      }
    } else {
      showToast("Token not ready yet", "error");
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("Token copied to clipboard!");
    } catch (err) {
      showToast("Failed to copy", "error");
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="st-container">
      {toast.show && <div className={`status-toast ${toast.type === 'error' ? 'bg-danger' : 'bg-success'}`}>{toast.message}</div>}

      <div className="st-header-card">
        <div className="row align-items-center">
          <div className="col-md-7">
            <h2 className="st-welcome-h2">Student <span>Analytics</span></h2>
            <p className="st-email-text">{userEmail}</p>
          </div>
        </div>
      </div>

      <div className="st-tile-grid">
        <div className="st-tile">
          <span className="st-tile-label"><FaHistory /> MCQ TESTS</span>
          <div className="st-tile-value">{performanceData.totalAttempts}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaTrophy /> AVERAGE SCORE</span>
          <div className="st-tile-value" style={{ color: '#10b981' }}>{performanceData.averageScore}%</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaChartLine /> PROG. AVG</span>
          <div className="st-tile-value" style={{ color: '#6366f1' }}>{programStats.averageMarks}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaStar /> TOTAL POINTS</span>
          <div className="st-tile-value" style={{ color: '#FFA003' }}>{programTotal}</div>
        </div>
      </div>

      <div className="st-chart-card">
        <h6 className="st-chart-title"><FaChartLine color="#FFA003" /> Performance Growth</h6>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={dailyStats}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFA003" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FFA003" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="avgScore" stroke="#FFA003" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="st-history-title"><FaHistory /> Test History</h3>
      <div className="pb-5">
        {mcqResults.length > 0 ? (
          mcqResults.map((test, index) => (
            <div key={index} className="st-history-card">
              <div>
                <span className="st-test-type">{test.type}</span>
                <div className="st-test-subtype">{test.subtype}</div>
              </div>
              <div className="text-end">
                <div className="st-test-marks">Marks: {test.marks} / {test.total_questions}</div>
                <div className="st-test-percent" style={{ color: test.percentage >= 60 ? '#10b981' : '#ef4444' }}>
                  {test.percentage}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5 text-muted">No test records found yet. Start learning to see results!</div>
        )}
      </div>
    </div>
  );
};

export default Status;