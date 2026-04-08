import React, { useState, useEffect } from "react";
import { Card, Container, Col, Row, Form, Button, ProgressBar, Badge } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";
import "./Status.css";

const Status = ({ isLoggedIn, setAccess }) => {
  const [userEmail, setUserEmail] = useState("");
  const [mcqResults, setMcqResults] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [userSpecificToken, setUserSpecificToken] = useState(
    () => localStorage.getItem("user_token") || ""
  );
  const [programStats, setProgramStats] = useState({ totalTests: 0, averageMarks: 0 });
  const [programTotal, setProgramTotal] = useState("0 / 0");
  const [performanceData, setPerformanceData] = useState({ totalAttempts: 0, averageScore: 0, totalMarks: 0, maxMarks: 0 });
  const [isTaskUnlocked, setIsTaskUnlocked] = useState(false);
  const [isCourseUnlocked, setIsCourseUnlocked] = useState(false);
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

  // ================= 1. FETCH & MANAGE TOKEN =================
  useEffect(() => {
    const email = localStorage.getItem("username") || "";
    if (email) setUserEmail(email);

    const tokenKey = `user_token_${email.toLowerCase()}`;

    // ✅ Always try to read from localStorage first (set at login)
    const storedToken =
      localStorage.getItem("user_token") ||
      localStorage.getItem(tokenKey);

    if (storedToken) {
      setUserSpecificToken(storedToken);
      return; // Token found — no need for background re-auth
    }

    // Only do background re-auth if no token found at all
    const fetchToken = async () => {
      try {
        const encPwd = localStorage.getItem("password");
        if (!email || !encPwd) return;

        const bytes = CryptoJS.AES.decrypt(encPwd, 'thirancoding360mgai');
        const password = bytes.toString(CryptoJS.enc.Utf8);

        console.log("Status: Starting background token recovery for", email);
        const res = await apiClient("quiz/users/login/", "POST", { email, password });
        console.log("Status: Background login response", res);

        const authToken = res?.access || res?.token;
        const displayToken = res?.user_token || res?.data?.user_token;

        if (displayToken) {
          console.log("Status: Recovered User Token:", displayToken);
          localStorage.setItem("user_token", displayToken);
          localStorage.setItem(tokenKey, displayToken);
          setUserSpecificToken(displayToken);
        }

        if (authToken) {
          localStorage.setItem("token", authToken);
        }

        if (typeof setAccess === 'function') {
          setAccess((prev) => prev.map(item => ({ ...item, locked: false })));
        }

      } catch (err) {
        console.error("Status: Background token recovery failed:", err);
      }
    };

    if (isLoggedIn) {
      fetchToken();
    }
  }, [isLoggedIn, setAccess]);


  // ================= 2. FETCH STATUS DATA =================
  useEffect(() => {
    const email = localStorage.getItem("username");
    if (!email) return;

    const taskStatus = localStorage.getItem(`task_unlocked_${email}`);
    if (taskStatus === "true") setIsTaskUnlocked(true);

    const courseStatus = localStorage.getItem(`course_unlocked_${email}`);
    if (courseStatus === "true") setIsCourseUnlocked(true);

    const fetchStatus = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

        // Fetch MCQ Marks (apiClient handles the token automatically)
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

        // Fetch Program Marks
        const currentToken =
          localStorage.getItem("token") ||
          localStorage.getItem("user_token") ||
          localStorage.getItem("access_token");

        const programRes = await fetch(`https://api.codingboss.in/compiler/average_program_marks/?user_id=${userId}`, {
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "ngrok-skip-browser-warning": "true"
          },
        });
        const pData = await programRes.json();
        if (pData) setProgramStats({ totalTests: pData.total_programs || 0, averageMarks: pData.avg_marks || 0 });

        const totalRes = await fetch(`https://api.codingboss.in/compiler/total-program-marks/?user_id=${userId}`, {
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "ngrok-skip-browser-warning": "true"
          },
        });
        const tData = await totalRes.json();
        if (tData) setProgramTotal(tData.result || "0 / 0");

      } catch (err) {
        console.error("Error fetching status data:", err);
      }
    };

    fetchStatus();
  }, [userSpecificToken]); // Refetch if the token updates


  /* ============================================================
     STRICT MANUAL UNLOCK: Only allows 'Task' to be unlocked.
     Forces all other premium tabs to stay locked.
     ============================================================ */
  const useCouponCode = async () => {
    if (!couponCode) return showToast("Please enter access code", "error");

    try {
      const email = localStorage.getItem("username");
      const response = await fetch(`https://api.codingboss.in/quiz/verify-token/?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_token: couponCode.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem(`task_unlocked_${email}`, "true");
        setIsTaskUnlocked(true);

        if (typeof setAccess === "function") {
          setAccess((prevItems) =>
            prevItems.map((item) => {
              // ✅ UNLOCK TASK & ASSIGNMENTS
              if (["Task", "Assignments"].includes(item.label)) {
                return { ...item, locked: false };
              }

              // ❌ KEEP COURSES & COMPANY PROTECTED
              if (["Courses", "Company"].includes(item.label)) {
                return { ...item, locked: true };
              }

              return item;
            })
          );
        }

        showToast("🚀 Task Page Unlocked!");
        setCouponCode("");
      } else {
        showToast("❌ Invalid Access Code", "error");
      }
    } catch (err) {
      showToast("⚠ Connection Error", "error");
    }
  };

  // ================= UNLOCK COURSE HANDLER =================
  const useCourseCouponCode = async () => {
    if (!courseCouponCode) return showToast("Please enter course access code", "error");

    try {
      const email = localStorage.getItem("username");
      const response = await fetch(`https://api.codingboss.in/quiz/verify-token/?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_token: courseCouponCode.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem(`course_unlocked_${email}`, "true");
        setIsCourseUnlocked(true);

        if (typeof setAccess === "function") {
          setAccess((prevItems) =>
            prevItems.map((item) => {
              if (["Courses", "Company"].includes(item.label)) {
                return { ...item, locked: false };
              }
              return item;
            })
          );
        }

        showToast("🎓 Courses Unlocked!");
        setCourseCouponCode("");
      } else {
        showToast("❌ Invalid Course Code", "error");
      }
    } catch (err) {
      showToast("⚠ Connection Error", "error");
    }
  };

  return (
    <Container fluid className="py-4 px-3">
      {toast.show && <div className={`status-toast ${toast.type}`}>{toast.message}</div>}

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0 bg-dark text-white p-3">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <h2 className="fw-bold mb-1">Status Dashboard</h2>
                  <p className="opacity-75 mb-3">User: {userEmail}</p>
                  {userSpecificToken ? (
                    <div className="bg-secondary bg-opacity-25 p-2 rounded d-inline-block border border-secondary">
                      <small className="opacity-75 me-2">Profile Token:</small>
                      <code className="text-warning fw-bold">{userSpecificToken}</code>
                    </div>
                  ) : (
                    <div className="bg-secondary bg-opacity-25 p-2 rounded d-inline-block border border-secondary">
                      <small className="opacity-75 me-2">Profile Token:</small>
                      <code className="text-muted fw-bold">Fetching...</code>
                    </div>
                  )}
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <div className="d-flex flex-column gap-2 align-items-md-end">
                    {/* Task Unlock */}
                    {!isTaskUnlocked ? (
                      <div className="d-flex gap-2 justify-content-md-end">
                        <Form.Control
                          placeholder="Task Code"
                          value={couponCode}
                          className="bg-dark text-white border-secondary w-auto"
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <Button variant="primary" onClick={useCouponCode}>Unlock Task</Button>
                      </div>
                    ) : (
                      <Badge bg="success" className="p-3 fs-6">✅ TASK UNLOCKED</Badge>
                    )}

                    {/* Course Unlock */}
                    {!isCourseUnlocked ? (
                      <div className="d-flex gap-2 justify-content-md-end">
                        <Form.Control
                          placeholder="Course Code"
                          value={courseCouponCode}
                          className="bg-dark text-white border-secondary w-auto"
                          onChange={(e) => setCourseCouponCode(e.target.value.toUpperCase())}
                        />
                        <Button variant="warning" onClick={useCourseCouponCode}>Unlock Course</Button>
                      </div>
                    ) : (
                      <Badge bg="warning" text="dark" className="p-3 fs-6">🎓 COURSES UNLOCKED</Badge>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tiles */}
      <Row className="mb-4 text-center">
        <Col md={3} sm={6} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted">MCQ Tests</small>
            <h4 className="fw-bold">{performanceData.totalAttempts}</h4>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted">MCQ Score</small>
            <h4 className="fw-bold text-success">
              {performanceData.totalMarks} / {performanceData.maxMarks}
            </h4>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted">Prog. Avg</small>
            <h4 className="fw-bold text-primary">{programStats.averageMarks}</h4>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted">Points</small>
            <h4 className="fw-bold text-info">{programTotal}</h4>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4 border-0 shadow-sm">
            <h6 className="fw-bold mb-4">MCQ Performance Growth</h6>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="#4e73df" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* History */}
      <Row>
        <Col>
          <h6 className="fw-bold mb-3">Test History</h6>
          {mcqResults.length > 0 ? (
            mcqResults.map((test, index) => (
              <Card key={index} className="mb-2 border-0 shadow-sm">
                <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold d-block">{test.type}</span>
                    <small className="text-muted">{test.subtype}</small>
                  </div>
                  <div className="text-end">
                    <span className="d-block text-muted small">
                      Marks: {test.marks} / {test.total_questions}
                    </span>
                    <span className={`fw-bold ${test.percentage >= 60 ? "text-success" : "text-danger"}`}>
                      {test.percentage}%
                    </span>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted">No records found.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Status;