import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'

export default function EditParcel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    weightKg: ''
  })

  useEffect(() => {
    fetchParcel()
  }, [id])

  const fetchParcel = async () => {
    try {
      const res = await api.get(`/staff/parcel/${id}`)
      const parcel = res.data
      setFormData({
        receiverName: parcel.receiver_name || '',
        receiverPhone: parcel.receiver_phone || '',
        receiverAddress: parcel.receiver_address || '',
        weightKg: parcel.weight_kg || ''
      })
      setLoading(false)
    } catch (err) {
      console.error('Failed to load parcel:', err)
      alert('Failed to load parcel details')
      navigate('/staff/parcels')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.put(`/staff/parcel/${id}`, {
        receiver_name: formData.receiverName,
        receiver_phone: formData.receiverPhone,
        receiver_address: formData.receiverAddress,
        weight_kg: parseFloat(formData.weightKg)
      })

      alert('Parcel updated successfully!')
      navigate('/staff/parcels')
    } catch (err) {
      console.error('Failed to update parcel:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update parcel'
      alert(`Error: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const estimatedCharges = formData.weightKg ? (parseFloat(formData.weightKg) * 50).toFixed(2) : '0.00'

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Navbar />
          <div style={{ padding: '32px' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading parcel details...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Edit Parcel</h2>
              <p style={{ color: '#6b7280' }}>Update parcel details</p>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
              <form onSubmit={handleSubmit}>
                {/* Receiver Name */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    style={{ 
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                {/* Receiver Phone */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                    Receiver Phone
                  </label>
                  <input
                    type="tel"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                    style={{ 
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>

                {/* Receiver Address */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                    Receiver Address
                  </label>
                  <textarea
                    name="receiverAddress"
                    value={formData.receiverAddress}
                    onChange={handleChange}
                    placeholder="Street, City, Country"
                    rows="3"
                    style={{ 
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>

                {/* Weight */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    placeholder="5.5"
                    step="0.1"
                    min="0.1"
                    style={{ 
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Rate: Rs.50 per kg</p>
                </div>

                {/* Estimated Charges */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#374151', fontWeight: '600' }}>Updated Charges:</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>Rs.{estimatedCharges}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ 
                      flex: 1,
                      backgroundColor: submitting ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {submitting ? 'Updating...' : 'Update Parcel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/staff/parcels')}
                    style={{ 
                      padding: '12px 24px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontWeight: '600',
                      color: '#374151',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
