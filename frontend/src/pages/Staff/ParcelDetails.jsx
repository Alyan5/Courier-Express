import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'
import StatusBadge from '../../assets/components/StatusBadge'

export default function ParcelDetails() {
  const { id } = useParams()
  const [parcel, setParcel] = useState(null)
  const [riders, setRiders] = useState([])
  const [selectedRider, setSelectedRider] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParcel()
    setRiders([
      { user_id: 3, name: "Rider Ahmed" },
      { user_id: 4, name: "Rider Ali" },
      { user_id: 5, name: "Rider Hassan" }
    ])
  }, [id])

  const fetchParcel = async () => {
    try {
      const res = await api.get(`/customer/parcel/track/${id}`)
      setParcel(res.data)
      setLoading(false)
    } catch (err) {
      alert('Parcel not found')
      setLoading(false)
    }
  }

  const assignRider = async () => {
    if (!selectedRider) return alert('Select a rider')
    try {
      await api.post('/staff/assign-rider', { parcel_id: parseInt(id), rider_id: parseInt(selectedRider) })
      alert('Rider assigned successfully!')
    } catch (err) {
      alert('Failed to assign rider')
    }
  }

  const updateStatus = async () => {
    if (!newStatus) return alert('Select a status')
    try {
      await api.put(`/rider/update-status/${id}`, null, { params: { new_status: newStatus } })
      setParcel({...parcel, current_status: newStatus})
      alert('Status updated!')
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!parcel) return <div className="p-10 text-center">Parcel not found</div>

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Parcel Details</h2>

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
            <h2 className="text-xl font-bold mb-6">Assign Rider</h2>
            <div className="flex gap-4 items-center">
              <select className="flex-1 p-3 border rounded-lg" value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)}>
                <option value="">Choose a rider</option>
                {riders.map(rider => (
                  <option key={rider.user_id} value={rider.user_id}>{rider.name}</option>
                ))}
              </select>
              <button onClick={assignRider} className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-accent transition">
                Assign Rider
              </button>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold mb-6">Update Parcel Status</h2>
            <div className="flex gap-4 items-center">
              <select className="flex-1 p-3 border rounded-lg" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">Select new status</option>
                <option value="packed">Packed</option>
                <option value="in transit">In Transit</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
              <button onClick={updateStatus} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}