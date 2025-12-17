import { useEffect, useState } from 'react'
import api from '../../services/api'
import { Link } from 'react-router-dom'
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
      console.error('Failed to load parcels:', err)
      
      // Don't show alert for 401 (handled by interceptor redirect)
      if (err.response?.status !== 401) {
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load parcels'
        alert(`Error: ${errorMsg}\n\nPlease ensure you are logged in as a staff member.`)
      }
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
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '32px' }}>
          
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>All Parcels</h2>
            <Link 
              to="/staff/add-parcel"
              style={{ 
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Add New Parcel
            </Link>
          </div>

          {/* Main Content Box */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
            
            {/* Search Box */}
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading parcels...
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>
                        Tracking #
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>
                        Receiver
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>
                        Weight
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>
                        Status
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontWeight: '600', color: '#374151' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map(parcel => (
                      <tr key={parcel.parcel_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#2563eb' }}>
                          {parcel.tracking_number || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {parcel.receiver_name || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {parcel.weight_kg || 0} kg
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <StatusBadge status={parcel.current_status || 'unknown'} />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link 
                              to={`/staff/parcel/${parcel.parcel_id}`}
                              style={{ 
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '14px'
                              }}
                              title="View Details"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/staff/edit-parcel/${parcel.parcel_id}`}
                              style={{ 
                                backgroundColor: '#16a34a',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '14px'
                              }}
                              title="Edit Parcel"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredParcels.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No parcels found
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