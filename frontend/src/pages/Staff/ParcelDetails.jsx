import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'
import StatusBadge from '../../assets/components/StatusBadge'
import { Edit2 } from 'lucide-react'

export default function ParcelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [parcel, setParcel] = useState(null)
  const [riders, setRiders] = useState([])
  const [selectedRider, setSelectedRider] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParcel()
    fetchRiders()
  }, [id])

  const fetchParcel = async () => {
    try {
      const res = await api.get(`/staff/parcel/${id}`)
      setParcel(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch parcel:', err)
      alert('Parcel not found')
      setLoading(false)
    }
  }

  const fetchRiders = async () => {
    try {
      const res = await api.get('/staff/riders')
      setRiders(res.data)
    } catch (err) {
      console.error('Failed to fetch riders:', err)
    }
  }

  const assignRider = async () => {
    if (!selectedRider) return alert('Please select a rider')
    try {
      await api.post(`/staff/assign-rider?parcel_id=${id}&rider_id=${selectedRider}`)
      alert('Rider assigned successfully!')
      setSelectedRider('')
    } catch (err) {
      console.error('Failed to assign rider:', err)
      const errorMsg = err.response?.data?.detail || 'Failed to assign rider'
      alert(errorMsg)
    }
  }

  const updateStatus = async () => {
    if (!newStatus) return alert('Please select a status')
    try {
      await api.put(`/rider/update-status/${id}`, null, { params: { new_status: newStatus } })
      setParcel({...parcel, current_status: newStatus})
      alert('Status updated successfully!')
      setNewStatus('')
    } catch (err) {
      console.error('Failed to update status:', err)
      const errorMsg = err.response?.data?.detail || 'Failed to update status'
      alert(errorMsg)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-10 text-center">Loading parcel details...</div>
      </div>
    </div>
  )
  
  if (!parcel) return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-10 text-center">Parcel not found</div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Parcel Details</h2>
            <button
              onClick={() => navigate(`/staff/edit-parcel/${id}`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Edit2 size={20} />
              Edit Parcel
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Tracking Number</h3>
                <p className="text-2xl font-mono text-primary">{parcel.tracking_number}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Current Status</h3>
                <StatusBadge status={parcel.current_status} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Receiver</h3>
                <p className="text-lg">{parcel.receiver_name}</p>
                <p className="text-gray-600">{parcel.receiver_phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Delivery Address</h3>
                <p className="text-lg">{parcel.receiver_address}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Weight & Charges</h3>
                <p className="text-lg">{parcel.weight_kg} kg - Rs. {parcel.charges}</p>
              </div>
            </div>
          </div>

          {/* Assign Rider */}
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Assign Rider</h2>
            {riders.length > 0 ? (
              <div className="flex gap-4 items-center">
                <select 
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  value={selectedRider} 
                  onChange={(e) => setSelectedRider(e.target.value)}
                >
                  <option value="">Choose a rider</option>
                  {riders.map(rider => (
                    <option key={rider.user_id} value={rider.user_id}>
                      {rider.name} ({rider.email}) {rider.phone && `- ${rider.phone}`}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={assignRider} 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Assign Rider
                </button>
              </div>
            ) : (
              <p className="text-gray-600">No riders available. Please create rider accounts first.</p>
            )}
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Update Parcel Status</h2>
            <div className="flex gap-4 items-center">
              <select 
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Select new status</option>
                <option value="booked">Booked</option>
                <option value="packed">Packed</option>
                <option value="in transit">In Transit</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
              <button 
                onClick={updateStatus} 
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
