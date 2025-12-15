import { Link } from 'react-router-dom'

export default function RiderNavbar() {
  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <nav className="bg-blue-900 text-white shadow-md border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/rider/dashboard" className="text-xl font-bold tracking-tight">
              Courier System – Rider
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/rider/parcels" className="hover:text-blue-300 transition font-medium">
              My Deliveries
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
