import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import RiderNavbar from '../../assets/components/RiderNavbar'
import RiderSidebar from '../../assets/components/RiderSidebar'
import { Package, TrendingUp } from 'lucide-react'

export default function RiderDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    transit: 0,
    delivered: 0
  })
  const [recentParcels, setRecentParcels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/rider/my-parcels')
      const parcels = res.data

      setStats({
        total: parcels.length,
        pending: parcels.filter(p => p.current_status === 'booked' || p.current_status === 'packed').length,
        transit: parcels.filter(p => p.current_status === 'in transit' || p.current_status === 'out for delivery').length,
        delivered: parcels.filter(p => p.current_status === 'delivered').length
      })

      // Get 5 most recent parcels
      setRecentParcels(parcels.slice(-5).reverse())
      setLoading(false)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RiderSidebar />
      <div className="flex-1">
        <RiderNavbar />
        <div className="p-8">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Rider Dashboard</h2>

          {loading ? (
            <div className="text-center py-10 text-gray-600">Loading dashboard...</div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                  <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Assigned</h3>
                  <p className="text-5xl font-bold text-blue-700 mt-4">{stats.total}</p>
                  <div className="h-1 w-12 bg-blue-700 rounded mt-4"></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                  <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">Pending Pickup</h3>
                  <p className="text-5xl font-bold text-amber-600 mt-4">{stats.pending}</p>
                  <div className="h-1 w-12 bg-amber-600 rounded mt-4"></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                  <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">In Transit</h3>
                  <p className="text-5xl font-bold text-purple-600 mt-4">{stats.transit}</p>
                  <div className="h-1 w-12 bg-purple-600 rounded mt-4"></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                  <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">Delivered</h3>
                  <p className="text-5xl font-bold text-teal-600 mt-4">{stats.delivered}</p>
                  <div className="h-1 w-12 bg-teal-600 rounded mt-4"></div>
                </div>
              </div>

              {/* Recent Parcels */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">My Deliveries</h3>
                  <Link 
                    to="/rider/parcels" 
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    View All
                    <TrendingUp size={18} />
                  </Link>
                </div>
                
                {recentParcels.length > 0 ? (
                  <div className="space-y-4">
                    {recentParcels.map(parcel => (
                      <div 
                        key={parcel.parcel_id} 
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Package className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <p className="font-mono font-semibold text-gray-800">{parcel.tracking_number}</p>
                            <p className="text-sm text-gray-600">To: {parcel.receiver_name}</p>
                            <p className="text-xs text-gray-500">{parcel.receiver_address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            parcel.current_status === 'delivered' ? 'bg-green-100 text-green-700' :
                            parcel.current_status === 'in transit' || parcel.current_status === 'out for delivery' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {parcel.current_status}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{parcel.weight_kg} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">No parcels assigned yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
