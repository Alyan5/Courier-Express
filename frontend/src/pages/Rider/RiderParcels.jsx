import { useEffect, useState } from 'react'
import api from '../../services/api'
import RiderNavbar from '../../assets/components/RiderNavbar'
import RiderSidebar from '../../assets/components/RiderSidebar'
import StatusBadge from '../../assets/components/StatusBadge'
import { Search, CheckCircle } from 'lucide-react'

export default function RiderParcels() {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchParcels()
  }, [])

  const fetchParcels = async () => {
    try {
      const res = await api.get('/rider/my-parcels')
      setParcels(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load parcels:', err)
      alert('Failed to load your deliveries')
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (parcelId, currentStatus) => {
    // Determine next status
    let newStatus = ''
    if (currentStatus === 'booked' || currentStatus === 'packed') {
      newStatus = 'in transit'
    } else if (currentStatus === 'in transit') {
      newStatus = 'out for delivery'
    } else if (currentStatus === 'out for delivery') {
      newStatus = 'delivered'
    } else {
      alert('Parcel already delivered')
      return
    }

    if (!confirm(`Update status to "${newStatus}"?`)) return

    setUpdating(parcelId)
    try {
      await api.put(`/rider/update-status/${parcelId}?new_status=${encodeURIComponent(newStatus)}`)
      alert(`Status updated to: ${newStatus}`)
      fetchParcels() // Refresh list
    } catch (err) {
      console.error('Failed to update status:', err)
      const errorMsg = err.response?.data?.detail || 'Failed to update status'
      alert(errorMsg)
    } finally {
      setUpdating(null)
    }
  }

  const filteredParcels = parcels.filter(parcel => {
    const searchLower = search.toLowerCase()
    const trackingNumber = parcel.tracking_number?.toLowerCase() || ''
    const receiverName = parcel.receiver_name?.toLowerCase() || ''
    return trackingNumber.includes(searchLower) || receiverName.includes(searchLower)
  })

  return (
    <div className="flex min-h-screen bg-gray-100">
      <RiderSidebar />
      <div className="flex-1">
        <RiderNavbar />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">My Deliveries</h2>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by tracking number or receiver..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-10">Loading your deliveries...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Tracking #</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Receiver</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Weight</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map(parcel => (
                      <tr key={parcel.parcel_id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6 font-mono text-blue-600">{parcel.tracking_number || 'N/A'}</td>
                        <td className="py-4 px-6">
                          <div>{parcel.receiver_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{parcel.receiver_phone}</div>
                        </td>
                        <td className="py-4 px-6 text-sm">{parcel.receiver_address || 'N/A'}</td>
                        <td className="py-4 px-6">{parcel.weight_kg || 0} kg</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={parcel.current_status || 'unknown'} />
                        </td>
                        <td className="py-4 px-6">
                          {parcel.current_status !== 'delivered' ? (
                            <button
                              onClick={() => handleUpdateStatus(parcel.parcel_id, parcel.current_status)}
                              disabled={updating === parcel.parcel_id}
                              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition flex items-center gap-1 disabled:bg-gray-400"
                              title="Update Status"
                            >
                              <CheckCircle size={16} />
                              {updating === parcel.parcel_id ? 'Updating...' : 'Update'}
                            </button>
                          ) : (
                            <span className="text-green-600 font-semibold">✓ Complete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredParcels.length === 0 && (
                  <div className="p-10 text-center text-gray-500">
                    {search ? 'No parcels found matching your search' : 'No deliveries assigned yet'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
