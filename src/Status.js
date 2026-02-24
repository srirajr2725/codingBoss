import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Col,
  Row,
  Form,
  Button,
  ProgressBar,
} from "react-bootstrap";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import CryptoJS from "crypto-js";
import apiClient from "./utils/apiClient";

import "./Status.css";

const Status = ({ setAccess }) => {

  const [userEmail, setUserEmail] = useState("");

  const [mcqResults, setMcqResults] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);

  /* ✅ PROGRAM STATS */
  const [programStats, setProgramStats] = useState({
    totalTests: 0,
    averageMarks: 0,
  });

  /* ✅ TOTAL PROGRAM MARKS */
  const [programTotal, setProgramTotal] = useState("0 / 0");

  const [performanceData, setPerformanceData] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completionRate: 0,
    dailyGrowth: 0,
  });

  /* ================= NEW (UNLOCK STATE) ================= */
  const [isUnlocked, setIsUnlocked] = useState(false);

  /* ================= TOAST ================= */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (msg, type = "success") => {
    setToast({
      show: true,
      message: msg,
      type,
    });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  /* ================= GET USER ID ================= */

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

  /* ================= RESTORE UNLOCK (NEW) ================= */

  useEffect(() => {

    const email = localStorage.getItem("username");

    if (!email) return;

    const unlocked = localStorage.getItem(`unlocked_${email}`);

    if (unlocked === "true") {

      setIsUnlocked(true);

      setAccess((prev) =>
        prev.map((item) => ({
          ...item,
          locked: false,
        }))
      );
    }

  }, [setAccess]);

  /* ================= FETCH DATA ================= */

  useEffect(() => {

    const fetchStatus = async () => {

      try {

        const email = localStorage.getItem("username");
        setUserEmail(email || "User");

        const userId = getUserId();
        if (!userId) return;

        /* ================= MCQ DATA ================= */

        const data = await apiClient(
          `compiler/mcq-marks/user/${userId}/`,
          "GET"
        );

        if (!Array.isArray(data?.results)) return;

        const results = data.results;

        setMcqResults(results);

        let totalAttempts = results.length;
        let totalScore = 0;

        const chartData = [];

        results.forEach((test, index) => {

          const percent = Number(test.percentage || 0);

          totalScore += percent;

          chartData.push({
            date: `Test ${index + 1}`,
            avgScore: percent,
          });

        });

        let growth = 0;

        if (results.length > 1) {
          growth =
            (
              (results[results.length - 1].percentage -
                results[0].percentage) /
              results[0].percentage
            ) * 100;
        }

        setDailyStats(chartData);

        setPerformanceData({
          totalAttempts,

          averageScore:
            totalAttempts > 0
              ? (totalScore / totalAttempts).toFixed(1)
              : 0,

          completionRate: 100,

          dailyGrowth: growth.toFixed(1),
        });

        /* ================= PROGRAM AVERAGE ================= */

        const token = localStorage.getItem("token");

        const programRes = await fetch(
          `https://api.codingboss.in/compiler/average_program_marks/?user_id=${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const programText = await programRes.text();

        let programData = null;

        try {
          programData = JSON.parse(programText);
        } catch {
          console.error("Program API Error:", programText);
        }

        if (programData && typeof programData === "object") {

          setProgramStats({
            totalTests: programData.total_programs || 1,
            averageMarks: programData.avg_marks || 0,
          });
        }

        /* ================= TOTAL PROGRAM MARKS ================= */

        const totalRes = await fetch(
          `https://api.codingboss.in/compiler/total-program-marks/?user_id=${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const totalData = await totalRes.json();

        if (totalData && typeof totalData === "object") {
          setProgramTotal(totalData.result || "0 / 0");
        }

      } catch (err) {
        console.error("Status Error:", err);
      }
    };

    fetchStatus();

  }, []);

  /* ================= COUPON ================= */

  const [couponCode, setCouponCode] = useState("");

  const email = localStorage.getItem("username");

  const useCouponCode = async () => {

    if (!couponCode) {
      showToast("Please enter access code", "error");
      return;
    }

    try {

      const response = await fetch(
        `https://api.codingboss.in/quiz/verify-token/?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_token: couponCode.trim(),
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {

        /* ✅ SAVE PERMANENTLY (NEW) */
        localStorage.setItem(`unlocked_${email}`, "true");

        setIsUnlocked(true);

        setAccess((prev) =>
          prev.map((item) => ({
            ...item,
            locked: false,
          }))
        );

        localStorage.setItem("user_token", result.data.user_token);
        localStorage.setItem("unlock_toast_pending", "true");

        showToast("🎉 Access Unlocked Successfully!");

      } else {

        showToast("❌ Invalid Access Code", "error");
      }

      setCouponCode("");

    } catch {

      showToast("⚠ Server Error. Try Again", "error");
    }
  };


  return (
    <Container fluid>

      {/* ================= TOAST ================= */}
      {toast.show && (
        <div className={`status-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* GREETING */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>

              <Row className="align-items-center">

                <Col md={8} className="text-center">
                  <h2>Welcome Back, {userEmail}!</h2>
                  <p>Your MCQ Performance</p>
                </Col>

                <Col md={4}>

                  {/* ✅ UPDATED UI */}
                  {!isUnlocked ? (

                    <>
                      <Form.Control
                        placeholder="Access Code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="mb-2"
                      />

                      <Button onClick={useCouponCode}>
                        Use Code
                      </Button>
                    </>

                  ) : (

                    <div className="text-success fw-bold text-center">
                      ✅ Access Unlocked
                    </div>

                  )}

                </Col>

              </Row>

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* STATS */}
      <Row className="mb-4">

        <Col md={3}>
          <Card className="text-center p-3">
            <Card.Header>Total MCQ Tests</Card.Header>
            <h4>{performanceData.totalAttempts}</h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center p-3">
            <Card.Header>MCQ Avg Score</Card.Header>
            <h4 className="text-success">
              {performanceData.averageScore}%
            </h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center p-3">
            <Card.Header>Program Tests</Card.Header>
            <h4>{programStats.totalTests}</h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center p-3">
            <Card.Header>Program Marks</Card.Header>
            <h4 className="text-primary">
              {programStats.averageMarks}
            </h4>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center p-3">
            <Card.Header>Program Total</Card.Header>
            <h4 className="text-success">
              {programTotal}
            </h4>
          </Card>
        </Col>

      </Row>

      {/* USER RESULTS */}
      <Row className="mb-4">

        <Col>

          <h4 className="mb-3">My MCQ Tests</h4>

          {mcqResults.map((test, index) => {

            const percent = Number(test.percentage);
            const pass = percent >= 60;

            return (
              <Card key={index} className="mb-3 shadow-sm">

                <Card.Body>

                  <Row>

                    <Col md={6}>
                      <p><b>Category:</b> {test.type}</p>
                      <p><b>Subtype:</b> {test.subtype}</p>
                      <p><b>Total:</b> {test.total_questions}</p>
                      <p><b>Correct:</b> {test.correct_answers}</p>
                    </Col>

                    <Col md={6} className="text-center">

                      <h3>
                        {test.marks}/{test.total_questions}
                      </h3>

                      <h5
                        className={pass ? "text-success" : "text-danger"}
                      >
                        {percent}%
                      </h5>

                      <ProgressBar
                        now={percent}
                        variant={pass ? "success" : "warning"}
                        label={`${percent}%`}
                      />

                      <p className="mt-2">
                        {pass ? "✔ PASSED" : "✖ FAILED"}
                      </p>

                    </Col>

                  </Row>

                </Card.Body>

              </Card>
            );
          })}

        </Col>

      </Row>

    </Container>
  );
};

export default Status;