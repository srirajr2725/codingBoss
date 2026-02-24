import React from 'react'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './TrainerDashboard'
import VendorDashboard from './VendorDashboard'

const Dashboard = () => {
  const { user } = useAuth()

  if (!user) return <div>Please log in</div>

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'vendor':
      return <VendorDashboard />
    default:
      return <UserDashboard />
  }
}

export default Dashboard
