import { useEffect, useState } from 'react'
import api from '../../services/api'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'
import StatusBadge from '../../assets/components/StatusBadge'

export default function AllParcels() {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchParcels()
  }, [])

  const fetchParcels = async () => {
    try {
      const res = await api.get('/staff/parcels')
      setParcels(res.data)
      setLoading(false)
    } catch (err) {
      alert('Failed to load parcels')
      setLoading(false)
    }
  }

  const filteredParcels = parcels.filter(parcel =>
    parcel.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    parcel.receiver_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">All Parcels</h2>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by tracking number or receiver..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-10">Loading parcels...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Tracking #</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Receiver</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Weight</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map(parcel => (
                      <tr key={parcel.parcel_id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6 font-mono text-primary">{parcel.tracking_number}</td>
                        <td className="py-4 px-6">{parcel.receiver_name}</td>
                        <td className="py-4 px-6">{parcel.weight_kg} kg</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={parcel.current_status} />
                        </td>
                        <td className="py-4 px-6">
                          <Link 
                            to={`/staff/parcel/${parcel.parcel_id}`}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-accent transition"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredParcels.length === 0 && (
                  <div className="p-10 text-center text-gray-500">No parcels found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}