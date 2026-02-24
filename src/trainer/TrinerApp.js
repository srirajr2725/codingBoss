import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavbarComponent from './components/Navbar' // Adjust the path based on your folder structure
import CalendarView from './components/CalendarView'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VendorDashboard from './pages/VendorDashboard'
import CreativeForm from './components/CreativeForm'

const TrinerApp = () => {
  const { user } = useAuth()

  // Mocked user details for Navbar (replace with real context values)
  const isLoggedIn = !!user // Determine login state
  const username = user?.name || 'Guest'
  const userRole = user?.role || 'member'

  const handleLogout = () => {
    console.log('User logged out')
    // Add your logout logic here (e.g., clearing tokens, updating context)
  }

  return (
    <>
      {/* Include NavbarComponent */}
      <NavbarComponent
        isLoggedIn={isLoggedIn}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      {/* Define routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/vendor-dashboard"
          element={user ? <VendorDashboard /> : <Navigate to="/login" />}
        />
        <Route path="/complete-profile" element={<CreativeForm />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default TrinerApp
