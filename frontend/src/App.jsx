import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import StaffDashboard from './pages/Staff/StaffDashboard'
import AllParcels from './pages/Staff/AllParcels'
import ParcelDetails from './pages/Staff/ParcelDetails'

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role
    
    if (allowedRole && userRole !== allowedRole) {
      return <Navigate to="/login" replace />
    }
    
    return children
  } catch (err) {
    localStorage.removeItem('token')
    return <Navigate to="/login" replace />
  }
}

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  
  // Listen for token changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'))
    }
    
    // Listen for storage changes in other tabs/windows
    window.addEventListener('storage', handleStorageChange)
    
    // Poll localStorage every 500ms to catch changes made in the same tab
    const interval = setInterval(handleStorageChange, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const role = payload.role
      
      if (role === 'staff') {
        return (
          <Routes>
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/parcels" element={<ProtectedRoute allowedRole="staff"><AllParcels /></ProtectedRoute>} />
            <Route path="/staff/parcel/:id" element={<ProtectedRoute allowedRole="staff"><ParcelDetails /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
          </Routes>
        )
      } else if (role === 'customer') {
        return (
          <Routes>
            <Route path="/customer/dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold">Customer Dashboard (Coming Soon)</h1></div>} />
            <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
          </Routes>
        )
      } else if (role === 'rider') {
        return (
          <Routes>
            <Route path="/rider/dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold">Rider Dashboard (Coming Soon)</h1></div>} />
            <Route path="*" element={<Navigate to="/rider/dashboard" replace />} />
          </Routes>
        )
      }
    } catch (err) {
      localStorage.removeItem('token')
      setToken(null)
    }
  }

  // Not logged in - show auth routes
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App