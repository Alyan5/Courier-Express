import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import CustomerNavbar from '../../assets/components/CustomerNavbar'
import CustomerSidebar from '../../assets/components/CustomerSidebar'
import StatusBadge from '../../assets/components/StatusBadge'

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <CustomerSidebar />
      <div style={{ flex: 1 }}>
        <CustomerNavbar />
        <div style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>My Parcels</h2>

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
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading your parcels...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Tracking #</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Receiver</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Weight</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Charges</th>
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
                        <td style={{ padding: '16px 24px' }}>{parcel.receiver_name || 'N/A'}</td>
                        <td style={{ padding: '16px 24px' }}>{parcel.weight_kg || 0} kg</td>
                        <td style={{ padding: '16px 24px' }}>Rs. {parcel.charges || 0}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <StatusBadge status={parcel.current_status || 'unknown'} />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <a 
                            href={`#track-${parcel.tracking_number}`}
                            onClick={(e) => {
                              e.preventDefault()
                              alert(`Tracking: ${parcel.tracking_number}\nStatus: ${parcel.current_status}\nReceiver: ${parcel.receiver_name}`)
                            }}
                            style={{ 
                              backgroundColor: '#2563eb',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              display: 'inline-block'
                            }}
                            title="Track Parcel"
                          >
                            Track
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredParcels.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
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
