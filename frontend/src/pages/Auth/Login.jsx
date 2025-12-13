import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('handleLogin called', { email, role })
    if (loading) return
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: email,
        password: password,
        role: role
      })
      console.log('Login response:', res.data)
      localStorage.setItem('token', res.data.access_token)
      
      const payload = JSON.parse(atob(res.data.access_token.split('.')[1]))
      console.log('JWT payload:', payload)
      
      // Redirect based on actual role from token (not the form dropdown)
      const userRole = payload.role
      if (userRole === "staff") {
        console.log('Redirecting to staff dashboard')
        navigate('/staff/dashboard')
      } else if (userRole === "customer") {
        console.log('Redirecting to customer dashboard')
        navigate('/customer/dashboard')
      } else if (userRole === "rider") {
        console.log('Redirecting to rider dashboard')
        navigate('/rider/dashboard')
      } else {
        console.error('Unknown role:', userRole)
        alert(`Unknown role: ${userRole}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      let errorMsg = 'Login failed'
      
      if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : err.message
      } else if (err.response?.data) {
        errorMsg = typeof err.response.data === 'string' 
          ? err.response.data 
          : err.message
      } else if (err.message) {
        errorMsg = err.message
      }
      
      console.error('Final error message:', errorMsg)
      alert(errorMsg)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Courier Express</h1>
          <p className="text-gray-600 text-sm font-medium">Fast & Reliable Delivery</p>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold text-sm mb-2">Account Type</label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800 bg-white font-medium"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="rider">Rider</option>
            </select>
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold text-sm mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-7">
            <label className="block text-gray-700 font-semibold text-sm mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={50}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors duration-200 mb-5 disabled:opacity-50">
            {loading ? 'Signing in…' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
        <div className="pt-5 border-t border-gray-200 text-center">
          <p className="text-gray-700 text-sm">Don't have an account? <Link to="/signup" className="text-blue-900 font-bold hover:text-blue-800 transition-colors">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}