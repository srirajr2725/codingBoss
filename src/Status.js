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
  const [programHistory, setProgramHistory] = useState([]);
  const [programSummary, setProgramSummary] = useState(null);
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
        const token = localStorage.getItem("user_token") || localStorage.getItem("token") || "";
        const headers = {
          "ngrok-skip-browser-warning": "true",
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };

        // total-program-marks returns: { programs_done, total_scored, total_full_marks, result }
        const tRes = await fetch(`https://api.codingboss.in/compiler/total-program-marks/?user_id=${userId}`, {
          method: "GET", headers
        });
        const tData = tRes.ok ? await tRes.json() : null;
        if (tData) {
          setProgramStats({
            totalTests: Number(tData.programs_done || 0),
            averageMarks: tData.total_full_marks > 0
              ? ((tData.total_scored / tData.total_full_marks) * 100).toFixed(1)
              : 0
          });
          setProgramTotal(String(tData.result || "0 / 0"));
          setProgramSummary(tData);
        }

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
        <h2 className="st-welcome-h2">Student <span>Analytics</span> <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b', letterSpacing: 0 }}>&mdash; {userEmail}</span></h2>
      </div>

      <div className="st-tile-grid">
        <div className="st-tile">
          <span className="st-tile-label"><FaHistory /> MCQ TESTS</span>
          <div className="st-tile-value">{performanceData.totalAttempts}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaTrophy /> MCQ AVG SCORE</span>
          <div className="st-tile-value" style={{ color: '#10b981' }}>{performanceData.averageScore}%</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaCheckCircle /> PROGRAMS DONE</span>
          <div className="st-tile-value" style={{ color: '#6366f1' }}>{programStats.totalTests}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaChartLine /> PROG. AVG MARKS</span>
          <div className="st-tile-value" style={{ color: '#8b5cf6' }}>{programStats.averageMarks}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaStar /> TOTAL MARKS</span>
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
                  <stop offset="5%" stopColor="#FFA003" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#FFA003" stopOpacity={0} />
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
      <div className="st-history-grid pb-5">
        {/* LEFT — MCQ History */}
        <div className="st-history-col">
          <h6 className="st-history-col-title">📝 MCQ Tests</h6>
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
            <div className="st-empty-state">No MCQ records yet.</div>
          )}
        </div>

        {/* RIGHT — Program Summary */}
        <div className="st-history-col">
          <h6 className="st-history-col-title">💻 Programs</h6>
          {programSummary ? (
            <>
              <div className="st-history-card">
                <div>
                  <span className="st-test-type">Programs Attended</span>
                  <div className="st-test-subtype">Total submissions</div>
                </div>
                <div className="text-end">
                  <div className="st-test-marks" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>
                    {programSummary.programs_done}
                  </div>
                </div>
              </div>
              <div className="st-history-card">
                <div>
                  <span className="st-test-type">Total Score</span>
                  <div className="st-test-subtype">Scored / Full Marks</div>
                </div>
                <div className="text-end">
                  <div className="st-test-marks">{programSummary.result}</div>
                  <div className="st-test-percent" style={{
                    color: programSummary.total_full_marks > 0 && (programSummary.total_scored / programSummary.total_full_marks) >= 0.6 ? '#10b981' : '#f59e0b',
                    fontSize: '0.85rem'
                  }}>
                    {programSummary.total_full_marks > 0
                      ? `${((programSummary.total_scored / programSummary.total_full_marks) * 100).toFixed(1)}%`
                      : '–'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="st-empty-state">No program records yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Status;
