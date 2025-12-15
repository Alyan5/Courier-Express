import { useEffect, useState } from 'react'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    transit: 0,
    delivered: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/staff/parcels')
        const parcels = res.data

        setStats({
          total: parcels.length,
          pending: parcels.filter(p => p.current_status === 'booked').length,
          transit: parcels.filter(p => p.current_status === 'in transit').length,
          delivered: parcels.filter(p => p.current_status === 'delivered').length
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load stats'
        console.error('Error details:', errorMsg)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-8 bg-gray-50">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Staff Dashboard</h2>

          {loading ? (
            <div className="text-center py-10 text-gray-600">Loading stats...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Parcels Today</h3>
                <p className="text-5xl font-bold text-blue-700 mt-4">{stats.total}</p>
                <div className="h-1 w-12 bg-blue-700 rounded mt-4"></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">Pending Assignment</h3>
                <p className="text-5xl font-bold text-red-600 mt-4">{stats.pending}</p>
                <div className="h-1 w-12 bg-red-600 rounded mt-4"></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">In Transit</h3>
                <p className="text-5xl font-bold text-amber-600 mt-4">{stats.transit}</p>
                <div className="h-1 w-12 bg-amber-600 rounded mt-4"></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">Delivered Today</h3>
                <p className="text-5xl font-bold text-teal-600 mt-4">{stats.delivered}</p>
                <div className="h-1 w-12 bg-teal-600 rounded mt-4"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}