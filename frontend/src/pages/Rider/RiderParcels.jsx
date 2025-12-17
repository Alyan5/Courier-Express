import { useEffect, useState } from 'react'
import api from '../../services/api'
import RiderNavbar from '../../assets/components/RiderNavbar'
import RiderSidebar from '../../assets/components/RiderSidebar'
import StatusBadge from '../../assets/components/StatusBadge'

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <RiderSidebar />
      <div style={{ flex: 1 }}>
        <RiderNavbar />
        <div style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>My Deliveries</h2>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search by tracking number or receiver..."
                style={{ 
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading your deliveries...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Tracking #</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Receiver</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Address</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Weight</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map(parcel => (
                      <tr key={parcel.parcel_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#2563eb' }}>
                          {parcel.tracking_number || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div>{parcel.receiver_name || 'N/A'}</div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{parcel.receiver_phone}</div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px' }}>{parcel.receiver_address || 'N/A'}</td>
                        <td style={{ padding: '16px 24px' }}>{parcel.weight_kg || 0} kg</td>
                        <td style={{ padding: '16px 24px' }}>
                          <StatusBadge status={parcel.current_status || 'unknown'} />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {parcel.current_status !== 'delivered' ? (
                            <button
                              onClick={() => handleUpdateStatus(parcel.parcel_id, parcel.current_status)}
                              disabled={updating === parcel.parcel_id}
                              style={{ 
                                backgroundColor: updating === parcel.parcel_id ? '#9ca3af' : '#16a34a',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: updating === parcel.parcel_id ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                              title="Update Status"
                            >
                              {updating === parcel.parcel_id ? 'Updating...' : 'Update'}
                            </button>
                          ) : (
                            <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Complete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredParcels.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
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
