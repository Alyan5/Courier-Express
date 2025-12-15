import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import CustomerNavbar from '../../assets/components/CustomerNavbar'
import CustomerSidebar from '../../assets/components/CustomerSidebar'
import StatusBadge from '../../assets/components/StatusBadge'
import { Search, Eye } from 'lucide-react'

export default function MyParcels() {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchParcels()
  }, [])

  const fetchParcels = async () => {
    try {
      const res = await api.get('/customer/my-parcels')
      setParcels(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load parcels:', err)
      alert('Failed to load your parcels')
      setLoading(false)
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
      <CustomerSidebar />
      <div className="flex-1">
        <CustomerNavbar />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">My Parcels</h2>

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
              <div className="text-center py-10">Loading your parcels...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Tracking #</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Receiver</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Weight</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Charges</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map(parcel => (
                      <tr key={parcel.parcel_id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6 font-mono text-blue-600">{parcel.tracking_number || 'N/A'}</td>
                        <td className="py-4 px-6">{parcel.receiver_name || 'N/A'}</td>
                        <td className="py-4 px-6">{parcel.weight_kg || 0} kg</td>
                        <td className="py-4 px-6">Rs. {parcel.charges || 0}</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={parcel.current_status || 'unknown'} />
                        </td>
                        <td className="py-4 px-6">
                          <a 
                            href={`#track-${parcel.tracking_number}`}
                            onClick={(e) => {
                              e.preventDefault()
                              alert(`Tracking: ${parcel.tracking_number}\nStatus: ${parcel.current_status}\nReceiver: ${parcel.receiver_name}`)
                            }}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition flex items-center gap-1 inline-flex"
                            title="Track Parcel"
                          >
                            <Eye size={16} />
                            Track
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredParcels.length === 0 && (
                  <div className="p-10 text-center text-gray-500">
                    {search ? 'No parcels found matching your search' : 'No parcels yet'}
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
