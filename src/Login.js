import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";

// Define animation for fade-in effect
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Define a gradient background for the main container
const GradientBackground = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background:
    "linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgb(7, 87, 87) 50%, rgba(0, 212, 255, 1) 100%)",
  animation: `${fadeIn} 1s ease-in-out`,
});

// Login form container with Glassmorphism effect
const LoginBox = styled(Box)({
  width: "100%",
  maxWidth: "400px",
  padding: "2rem",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "15px",
  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  textAlign: "center",
  animation: `${fadeIn} 0.5s ease-in-out`,
});

// Button with animation effect
const AnimatedButton = styled(Button)({
  marginTop: "1.5rem",
  width: "100%",
  padding: "12px",
  backgroundColor: "#026370",
  color: "#fff",
  fontSize: "1.1em",
  borderRadius: "8px",
  transition: "transform 0.3s ease, background-color 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    backgroundColor: "#0097a7",
  },
});

// Link text style
const LinkText = styled(Typography)({
  marginTop: "1rem",
  color: "#fff",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
  },
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [isForgot, setIsForgot] = useState(true); // Toggle between login and forgot password
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading
  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      const userData = {
        email,
        role:
          email === "admin@example.com"
            ? "admin"
            : email === "vendor@example.com"
            ? "vendor"
            : "user",
      };
      await login(userData); // Simulate async login
      navigate(userData.role === "admin" ? "/dashboard" : "/vendor-dashboard");
    } catch (err) {
      setError("Login failed! Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords must be the same");
      return;
    }
    setLoading(true); // Start loading
    try {
      const userData = { email, role: "user" };
      await login(userData); // Simulate async signup
      navigate("/dashboard");
    } catch (err) {
      setError("Signup failed! Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleForgot = async () => {
    setLoading(true); // Start loading
    try {
      const userData = { email: "googleuser@example.com", role: "user" };
      await login(userData); // Simulate async Google signup
      navigate("/forgot");
    } catch (err) {
      setError("Google signup failed! Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true); // Start loading
    try {
      const userData = { email: "googleuser@example.com", role: "user" };
      await login(userData); // Simulate async Google signup
      navigate("/dashboard");
    } catch (err) {
      setError("Google signup failed! Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <GradientBackground>
      <LoginBox>
        <Typography variant="h4" color="white" gutterBottom>
          Welcome to Login
        </Typography>
        <Tabs
          value={isLogin ? 0 : 1}
          onChange={() => setIsLogin(!isLogin)}
          textColor="inherit"
          centered
          sx={{ color: "white" }}
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          InputProps={{ style: { color: "white" } }}
          InputLabelProps={{ style: { color: "white" } }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{ style: { color: "white" } }}
          InputLabelProps={{ style: { color: "white" } }}
        />

        {!isLogin && (
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "white" } }}
          />
        )}

        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}

        <AnimatedButton
          onClick={isLogin ? handleLogin : handleSignup}
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" />{" "}
              {isLogin ? "Logging In..." : "Signing Up..."}
            </>
          ) : isLogin ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </AnimatedButton>

        {!isLogin && (
          <AnimatedButton
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignup}
            style={{ marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" /> Signing Up...
              </>
            ) : (
              "Sign Up with Google"
            )}
          </AnimatedButton>
        )}

        {isLogin ? (
          <LinkText onClick={() => setIsLogin(false)}>
            Don't have an account? Register
          </LinkText>
        ) : (
          <LinkText onClick={() => setIsLogin(true)}>
            Have an account? Sign In
          </LinkText>
        )}

        <button onClick={() => setIsForgot(true)}>Forgot Password</button>
      </LoginBox>
    </GradientBackground>
  );
};

export default Login;
