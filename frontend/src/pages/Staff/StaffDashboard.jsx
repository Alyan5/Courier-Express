import { useEffect, useState } from 'react'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    transit: 0,
    delivered: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/staff/parcels')
        const parcels = res.data

        setStats({
          total: parcels.length,
          pending: parcels.filter(p => p.current_status === 'booked').length,
          transit: parcels.filter(p => p.current_status === 'in transit').length,
          delivered: parcels.filter(p => p.current_status === 'delivered').length
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load stats'
        console.error('Error details:', errorMsg)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>
            Staff Dashboard
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading stats...
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px' 
            }}>
              
              {/* Total Parcels Card */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Parcels Today
                </h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1d4ed8', marginTop: '16px' }}>
                  {stats.total}
                </p>
                <div style={{ height: '4px', width: '48px', backgroundColor: '#1d4ed8', borderRadius: '2px', marginTop: '16px' }}></div>
              </div>

              {/* Pending Assignment Card */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pending Assignment
                </h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#dc2626', marginTop: '16px' }}>
                  {stats.pending}
                </p>
                <div style={{ height: '4px', width: '48px', backgroundColor: '#dc2626', borderRadius: '2px', marginTop: '16px' }}></div>
              </div>

              {/* In Transit Card */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  In Transit
                </h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#d97706', marginTop: '16px' }}>
                  {stats.transit}
                </p>
                <div style={{ height: '4px', width: '48px', backgroundColor: '#d97706', borderRadius: '2px', marginTop: '16px' }}></div>
              </div>

              {/* Delivered Today Card */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Delivered Today
                </h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#0d9488', marginTop: '16px' }}>
                  {stats.delivered}
                </p>
                <div style={{ height: '4px', width: '48px', backgroundColor: '#0d9488', borderRadius: '2px', marginTop: '16px' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}