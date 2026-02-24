import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme()


ReactDOM.render(
  <BrowserRouter>
    <AuthProvider>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
