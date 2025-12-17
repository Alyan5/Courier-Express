import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'
import StatusBadge from '../../assets/components/StatusBadge'

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading parcel details...</div>
      </div>
    </div>
  )
  
  if (!parcel) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '40px', textAlign: 'center' }}>Parcel not found</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>Parcel Details</h2>
            <button
              onClick={() => navigate(`/staff/edit-parcel/${id}`)}
              style={{ 
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Edit Parcel
            </button>
          </div>

          {/* Parcel Info */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Tracking Number</h3>
                <p style={{ fontSize: '24px', fontFamily: 'monospace', color: '#2563eb' }}>{parcel.tracking_number}</p>
              </div>
              <div>
                <h3 style={{ fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Current Status</h3>
                <StatusBadge status={parcel.current_status} />
              </div>
              <div>
                <h3 style={{ fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Receiver</h3>
                <p style={{ fontSize: '18px' }}>{parcel.receiver_name}</p>
                <p style={{ color: '#6b7280' }}>{parcel.receiver_phone}</p>
              </div>
              <div>
                <h3 style={{ fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Delivery Address</h3>
                <p style={{ fontSize: '18px' }}>{parcel.receiver_address}</p>
              </div>
              <div>
                <h3 style={{ fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Weight & Charges</h3>
                <p style={{ fontSize: '18px' }}>{parcel.weight_kg} kg - Rs. {parcel.charges}</p>
              </div>
            </div>
          </div>

          {/* Assign Rider */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>Assign Rider</h2>
            {riders.length > 0 ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <select 
                  style={{ 
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
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
                  style={{ 
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Assign Rider
                </button>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No riders available. Please create rider accounts first.</p>
            )}
          </div>

          {/* Update Status */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>Update Parcel Status</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <select 
                style={{ 
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
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
                style={{ 
                  backgroundColor: '#16a34a',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
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
