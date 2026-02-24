import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { Box, Button, TextField, Typography, Tabs, Tab } from '@mui/material'
import { styled, keyframes } from '@mui/system'

// Define animation for fade-in effect
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`

// Define a gradient background for the main container
const GradientBackground = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  animation: `${fadeIn} 1s ease-in-out`,
})

const LoginBox = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  padding: '2rem',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  animation: `${fadeIn} 0.5s ease-in-out`,
})

const AnimatedButton = styled(Button)({
  marginTop: '1.5rem',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
})

const LinkText = styled(Typography)({
  marginTop: '1rem',
  color: '#666',
  cursor: 'pointer',
  textAlign: 'center',
  '&:hover': {
    textDecoration: 'underline',
  },
})

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true) // Toggle between login and signup
  const [error, setError] = useState('')

  const handleLogin = () => {
     const userData = {
       email,
       role:
         email === 'admin@example.com'
           ? 'admin'
           : email === 'vendor@example.com'
           ? 'vendor'
           : 'user',
     }
    login(userData)
    if (userData.role === 'admin') {
      navigate('/dashboard')
    } else if (userData.role === 'vendor') {
      navigate('/vendor-dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const handleSignup = () => {
    if (password !== confirmPassword) {
      setError('Passwords must be same')
      return
    }
    const userData = {
      email,
      role: 'user', // Default role
    }
    login(userData)
    navigate('/dashboard') // Redirect after signup
  }

  const handleGoogleSignup = () => {
    // Mock Google signup function
    const userData = {
      email: 'googleuser@example.com', // Example Google user
      role: 'user',
    }
    login(userData)
    navigate('/dashboard') // Redirect after signup
  }

  return (
    <GradientBackground>
      <LoginBox>
        <Tabs
          value={isLogin ? 0 : 1}
          onChange={() => setIsLogin(!isLogin)}
          indicatorColor="primary"
          textColor="primary"
          centered
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
          />
        )}

        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}

        <AnimatedButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={isLogin ? handleLogin : handleSignup}
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </AnimatedButton>

        {!isLogin && (
          <AnimatedButton
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleGoogleSignup}
            style={{ marginTop: '1rem' }}
          >
            Sign Up with Google
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
      </LoginBox>
    </GradientBackground>
  )
}

export default Login
