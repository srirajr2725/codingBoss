import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { FaUnlock, FaHistory, FaChartLine, FaTrophy, FaLightbulb, FaCheckCircle, FaStar, FaCopy, FaBrain } from "react-icons/fa";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import "./Status.css";

// ─── Helper: normalize any summary API response into a flat array of items ───
const normalizeSummaryItems = (data) => {
  if (!data) return [];

  // Case 1: already a plain array
  if (Array.isArray(data)) return data;

  // Case 2: { summary: [...] }  ← ACTUAL API SHAPE
  if (data.summary && Array.isArray(data.summary)) return data.summary;

  // Case 3: { results: [...] }
  if (data.results && Array.isArray(data.results)) return data.results;

  // Case 4: single object with a "language" key
  if (data.language || data.name) return [data];

  // Case 5: object whose values are all plain objects (keyed by category name)
  const values = Object.values(data);
  if (values.length > 0 && values.every(v => v && typeof v === "object" && !Array.isArray(v))) {
    return Object.entries(data).map(([key, val]) => ({
      ...val,
      language: val.language || val.name || key,
    }));
  }

  return [];
};

// ─── Helper: map a language string to one of our four category keys ───
const resolveCategoryKey = (rawLang) => {
  const lang = String(rawLang || "").trim().toLowerCase();
  if (lang.includes("quant")) return "Quants";
  if (lang.includes("logic")) return "Logical";
  if (lang.includes("psycho")) return "Psychometric";
  if (lang.includes("verb")) return "Verbal";
  return null;
};

// ─── Helper: build the display string for one category item ───
const buildDisplay = (item) => {
  if (item.score_display) return item.score_display;
  const m = item.total_marks ?? item.marks ?? 0;
  const mx = item.total_max_marks ?? item.max_marks ?? item.total_questions ?? 0;
  return `${m} / ${mx}`;
};

const formatSeconds = (sec) => {
  const s = Number(sec || 0);
  if (s <= 0) return "0s";
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem.toFixed(0)}s` : `${m}m`;
};

const INITIAL_CATS = {
  Quants: { display: "0 / 0", timeTaken: 0 },
  Logical: { display: "0 / 0", timeTaken: 0 },
  Psychometric: { display: "0 / 0", timeTaken: 0 },
  Verbal: { display: "0 / 0", timeTaken: 0 },
};

const Status = ({ isLoggedIn, setAccess }) => {
  const [userEmail, setUserEmail] = useState("");
  const [mcqResults, setMcqResults] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [userSpecificToken, setUserSpecificToken] = useState(
    () => localStorage.getItem("user_token") || ""
  );
  const [programStats, setProgramStats] = useState({ totalTests: 0, averageMarks: 0 });
  const [programTotal, setProgramTotal] = useState("0 / 0");
  const [programSummary, setProgramSummary] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    totalAttempts: 0, averageScore: 0, totalMarks: 0, maxMarks: 0,
  });
  const [categoryStats, setCategoryStats] = useState(INITIAL_CATS);
  const [mcqTotalTime, setMcqTotalTime] = useState(0);
  const [isTaskUnlocked, setIsTaskUnlocked] = useState(true);
  const [isCourseUnlocked, setIsCourseUnlocked] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const getUserId = () => {
    try {
      const encrypted = localStorage.getItem("userID") || localStorage.getItem("user_id");
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, "thirancoding360mgai");
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch { return null; }
  };

  // ── Token bootstrap ──────────────────────────────────────────────────────
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
        const bytes = CryptoJS.AES.decrypt(encPwd, "thirancoding360mgai");
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const res = await apiClient("quiz/users/login/", "POST", { email, password });
        const token = res?.user_token || res?.data?.user_token;
        if (token) {
          localStorage.setItem("user_token", token);
          localStorage.setItem(tokenKey, token);
          setUserSpecificToken(token);
        }
      } catch (err) { console.error("Token fetch error:", err); }
    };

    if (isLoggedIn) fetchToken();
  }, [isLoggedIn]);

  // ── Main data fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    const email = localStorage.getItem("username");
    if (!email) return;

    if (localStorage.getItem(`task_unlocked_${email}`) === "true") setIsTaskUnlocked(true);
    if (localStorage.getItem(`course_unlocked_${email}`) === "true") setIsCourseUnlocked(true);

    const fetchStatus = async () => {
      setIsSyncing(true);
      try {
        const userId = getUserId();
        if (!userId) return;

        const historyUrl = `https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/mcq-marks/user/${userId}/`;
        const summaryUrl = `https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/mcq-marks/user/${userId}/summary/`;
        const programUrl = `https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/total-program-marks/?user_id=${userId}`;

        // Use a direct fetch for the ngrok summary endpoint to ensure
        // the ngrok browser-warning header is always sent and we get raw JSON.
        const fetchNgrokJson = async (url) => {
          const token =
            localStorage.getItem("user_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            "";
          const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;
          const res = await fetch(url, { method: "GET", headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        };

        const [mcqData, summaryData, programData] = await Promise.all([
          fetchNgrokJson(historyUrl).catch(e => { console.error("History Error:", e); return null; }),
          fetchNgrokJson(summaryUrl).catch(e => {
            console.error("Summary Error:", e);
            showToast(`Aptitude Sync Error: ${e.message}`, "error");
            return null;
          }),
          apiClient(programUrl).catch(e => { console.error("Program Error:", e); return null; }),
        ]);

        console.log("DEBUG summaryData:", summaryData);

        // ── 1. MCQ History ────────────────────────────────────────────────
        if (mcqData) {
          const rawHistory = Array.isArray(mcqData) ? mcqData : (mcqData.results || []);
          const history = rawHistory.map(test => {
            const marks = test.marks ?? test.total_marks ?? 0;
            const total = test.total_questions ?? test.max_marks ?? test.total_max_marks ?? 0;
            return {
              ...test,
              display_score: test.score_display || `${marks} / ${total}`,
              percentage: test.percentage ?? (total > 0 ? (marks / total) * 100 : 0),
            };
          });
          setMcqResults(history);

          let totalScore = 0, totalMarks = 0, maxMarks = 0;
          const chartData = history.map((test, idx) => {
            totalScore += Number(test.percentage || 0);
            const [m, mx] = (test.display_score || "0/0")
              .split("/")
              .map(v => parseInt(v.trim()) || 0);
            totalMarks += m;
            maxMarks += mx;
            return { date: `T${idx + 1}`, avgScore: Number(test.percentage || 0) };
          });
          setDailyStats(chartData);
          setPerformanceData({
            totalAttempts: history.length,
            averageScore: history.length > 0
              ? (totalScore / history.length).toFixed(1)
              : 0,
            totalMarks,
            maxMarks,
          });
        }

        // ── 2. Category Summary (Quants / Logical / Psychometric / Verbal) ─
        if (summaryData) {
          const items = normalizeSummaryItems(summaryData);

          console.log("DEBUG category items:", items);

          // Start from a fresh copy of defaults
          const cats = JSON.parse(JSON.stringify(INITIAL_CATS));

          let totalSeconds = 0;
          items.forEach(item => {
            const key = resolveCategoryKey(item.language || item.name || "");
            console.log(`  → raw lang: "${item.language || item.name}"  resolved key: "${key}"  display: "${buildDisplay(item)}"`);
            
            // Accumulate total seconds spent across all categories
            totalSeconds += Number(item.total_time_taken_seconds || 0);

            if (key) {
              cats[key].display = buildDisplay(item);
              cats[key].timeTaken = Number(item.total_time_taken_seconds || 0);
            }
          });

          setMcqTotalTime(totalSeconds);

          if (items.length > 0 && Object.values(cats).every(c => c.display === "0 / 0")) {
            console.warn("DEBUG: All categories still 0/0 after mapping. Items were:", items);
          }

          setCategoryStats({ ...cats });
        }

        // ── 3. Programming ────────────────────────────────────────────────
        if (programData) {
          setProgramStats({
            totalTests: Number(programData.programs_done || 0),
            averageMarks: programData.total_full_marks > 0
              ? ((programData.total_scored / programData.total_full_marks) * 100).toFixed(1)
              : 0,
          });
          setProgramTotal(String(programData.result || "0 / 0"));
          setProgramSummary(programData);
        }

      } catch (err) {
        console.error("Critical Sync Error:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchStatus();
  }, [userSpecificToken]);

  // ── Unlock handlers ──────────────────────────────────────────────────────
  const handleQuickUnlock = () => {
    if (userSpecificToken && userSpecificToken !== "FETCHING...") {
      setCouponCode(userSpecificToken);
      handleMasterUnlock(userSpecificToken);
    }
  };

  const handleMasterUnlock = async (tokenInput = null) => {
    const tokenToUse = typeof tokenInput === "string" ? tokenInput : couponCode;
    if (!tokenToUse) return showToast("Please enter your token", "error");

    try {
      const email = localStorage.getItem("username");
      const result = await apiClient(
        `quiz/verify-token/?email=${encodeURIComponent(email)}`,
        "POST",
        { user_token: tokenToUse.trim() }
      );

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
          setAccess(prev =>
            prev.map(item =>
              ["Task"].includes(item.label) ? { ...item, locked: false } : item
            )
          );
        }

        showToast("🚀 All Premium Features Unlocked!");
        setCouponCode("");
      } else {
        showToast("❌ Invalid Token", "error");
      }
    } catch {
      showToast("⚠ Connection Error", "error");
    }
  };

  const handleCopyToken = () => {
    if (!userSpecificToken || userSpecificToken === "FETCHING...") {
      return showToast("Token not ready yet", "error");
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(userSpecificToken)
        .then(() => showToast("Token copied to clipboard!"))
        .catch(() => fallbackCopy(userSpecificToken));
    } else {
      fallbackCopy(userSpecificToken);
    }
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); showToast("Token copied to clipboard!"); }
    catch { showToast("Failed to copy", "error"); }
    document.body.removeChild(ta);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const catVal = (key) => {
    if (isSyncing) return "…";
    return categoryStats[key]?.display || "0 / 0";
  };

  return (
    <div className="st-container">
      {toast.show && (
        <div className={`status-toast ${toast.type === "error" ? "bg-danger" : "bg-success"}`}>
          {toast.message}
        </div>
      )}

      <div className="st-header-card">
        <h2 className="st-welcome-h2">
          Student <span>Analytics</span>{" "}
          <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#64748b", letterSpacing: 0 }}>
            &mdash; {userEmail}
          </span>
        </h2>
      </div>

      <div className="st-tile-grid">
        <div className="st-tile">
          <span className="st-tile-label"><FaHistory /> MCQ TESTS</span>
          <div className="st-tile-value">{performanceData.totalAttempts}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaTrophy /> MCQ AVG SCORE</span>
          <div className="st-tile-value" style={{ color: "#10b981" }}>{performanceData.averageScore}%</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaBrain /> MCQ TIME SPENT</span>
          <div className="st-tile-value" style={{ color: "#f59e0b" }}>{formatSeconds(mcqTotalTime)}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaCheckCircle /> PROGRAMS DONE</span>
          <div className="st-tile-value" style={{ color: "#6366f1" }}>{programStats.totalTests}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaChartLine /> PROG. AVG MARKS</span>
          <div className="st-tile-value" style={{ color: "#8b5cf6" }}>{programStats.averageMarks}</div>
        </div>
        <div className="st-tile">
          <span className="st-tile-label"><FaStar /> TOTAL MARKS</span>
          <div className="st-tile-value" style={{ color: "#FFA003" }}>{programTotal}</div>
        </div>
      </div>

      <div className="st-category-tiles">
        <div className="st-cat-tile quants">
          <span className="st-cat-label">QUANTS</span>
          <div className="st-cat-val">{catVal("Quants")}</div>
          <div className="st-cat-time">⏱️ {formatSeconds(categoryStats["Quants"]?.timeTaken)}</div>
        </div>
        <div className="st-cat-tile logical">
          <span className="st-cat-label">LOGICAL</span>
          <div className="st-cat-val">{catVal("Logical")}</div>
          <div className="st-cat-time">⏱️ {formatSeconds(categoryStats["Logical"]?.timeTaken)}</div>
        </div>
        <div className="st-cat-tile psychometric">
          <span className="st-cat-label">PSYCHOMETRIC</span>
          <div className="st-cat-val">{catVal("Psychometric")}</div>
          <div className="st-cat-time">⏱️ {formatSeconds(categoryStats["Psychometric"]?.timeTaken)}</div>
        </div>
        <div className="st-cat-tile verbal">
          <span className="st-cat-label">VERBAL</span>
          <div className="st-cat-val">{catVal("Verbal")}</div>
          <div className="st-cat-time">⏱️ {formatSeconds(categoryStats["Verbal"]?.timeTaken)}</div>
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
              <XAxis
                dataKey="date"
                axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px", border: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                }}
              />
              <Area
                type="monotone" dataKey="avgScore"
                stroke="#FFA003" strokeWidth={3}
                fillOpacity={1} fill="url(#colorAvg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="st-history-title-row">
        <h3 className="st-history-title"><FaHistory /> Assessment History</h3>
      </div>

      <div className="st-history-grid pb-5">
        {/* LEFT — Programming */}
        <div className="st-history-col">
          <div className="st-col-header">
            <h6 className="st-history-col-title">💻 Programming Tests</h6>
          </div>
          {programSummary ? (
            <div className="st-col-scroll">
              <div className="st-modern-card glass">
                <div className="st-card-info">
                  <span className="st-card-label">Programs Done</span>
                  <div className="st-card-main-val" style={{ color: "#6366f1" }}>
                    {programSummary.programs_done}
                  </div>
                </div>
                <div className="st-card-stats">
                  <div className="st-stat-item">
                    <span>Result</span>
                    <strong>{programSummary.result}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="st-empty-state">No program records yet.</div>
          )}
        </div>

        {/* RIGHT — MCQ & Aptitude */}
        <div className="st-history-col">
          <div className="st-col-header">
            <h6 className="st-history-col-title">📝 Aptitude & MCQs</h6>
          </div>
          <div className="st-col-scroll">
            {mcqResults.length > 0 ? (
              mcqResults.map((test, index) => (
                <div key={index} className="st-modern-card glass">
                  <div className="st-card-header">
                    <div>
                      <span className="st-test-type-tag">{test.type}</span>
                      <div className="st-test-title-text">{test.subtype}</div>
                    </div>
                    <div
                      className="st-card-score-badge"
                      style={{
                        background: test.percentage >= 60
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                        color: test.percentage >= 60 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {test.percentage}%
                    </div>
                  </div>
                  <div className="st-card-footer">
                    <span className="st-footer-info">Marks Scored</span>
                    <span className="st-footer-val">{test.display_score}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="st-empty-state">No records found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;