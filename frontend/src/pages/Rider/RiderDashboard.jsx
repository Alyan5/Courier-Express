import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import RiderNavbar from '../../assets/components/RiderNavbar'
import RiderSidebar from '../../assets/components/RiderSidebar'

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <RiderSidebar />
      <div style={{ flex: 1 }}>
        <RiderNavbar />
        <div style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>Rider Dashboard</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading dashboard...</div>
          ) : (
            <>
              {/* Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Assigned</h3>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1d4ed8', marginTop: '16px' }}>{stats.total}</p>
                  <div style={{ height: '4px', width: '48px', backgroundColor: '#1d4ed8', borderRadius: '2px', marginTop: '16px' }}></div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Pickup</h3>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#d97706', marginTop: '16px' }}>{stats.pending}</p>
                  <div style={{ height: '4px', width: '48px', backgroundColor: '#d97706', borderRadius: '2px', marginTop: '16px' }}></div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Transit</h3>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#9333ea', marginTop: '16px' }}>{stats.transit}</p>
                  <div style={{ height: '4px', width: '48px', backgroundColor: '#9333ea', borderRadius: '2px', marginTop: '16px' }}></div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivered</h3>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#0d9488', marginTop: '16px' }}>{stats.delivered}</p>
                  <div style={{ height: '4px', width: '48px', backgroundColor: '#0d9488', borderRadius: '2px', marginTop: '16px' }}></div>
                </div>
              </div>

              {/* Recent Parcels */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>My Deliveries</h3>
                  <Link 
                    to="/rider/parcels" 
                    style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}
                  >
                    View All
                  </Link>
                </div>
                
                {recentParcels.length > 0 ? (
                  <div>
                    {recentParcels.map(parcel => (
                      <div 
                        key={parcel.parcel_id} 
                        style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}
                      >
                        <div>
                          <p style={{ fontFamily: 'monospace', fontWeight: '600', color: '#1f2937' }}>{parcel.tracking_number}</p>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>To: {parcel.receiver_name}</p>
                          <p style={{ fontSize: '12px', color: '#9ca3af' }}>{parcel.receiver_address}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: parcel.current_status === 'delivered' ? '#dcfce7' : (parcel.current_status === 'in transit' || parcel.current_status === 'out for delivery') ? '#dbeafe' : '#fef3c7',
                            color: parcel.current_status === 'delivered' ? '#15803d' : (parcel.current_status === 'in transit' || parcel.current_status === 'out for delivery') ? '#1d4ed8' : '#a16207'
                          }}>
                            {parcel.current_status}
                          </span>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{parcel.weight_kg} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#6b7280' }}>No parcels assigned yet</p>
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
