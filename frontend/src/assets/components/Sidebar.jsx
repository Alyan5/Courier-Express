import { Link, useLocation } from 'react-router-dom'
import { Package, Home, LogOut } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const menuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: Home },
    { path: '/staff/parcels', label: 'All Parcels', icon: Package },
  ]

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-5 border-r border-slate-800">
      <div className="text-2xl font-bold mb-12 tracking-tight">Courier Staff</div>
      <nav className="space-y-2">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
              location.pathname === item.path 
                ? 'bg-blue-700 text-white shadow-sm' 
                : 'text-gray-200 hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-700 w-full text-left font-medium text-gray-200 transition mt-6"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  )
}