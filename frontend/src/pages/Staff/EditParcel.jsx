import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../assets/components/Navbar'
import Sidebar from '../../assets/components/Sidebar'
import { User, Phone, MapPin, Weight } from 'lucide-react'

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
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-8">
            <div className="text-center py-10">Loading parcel details...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Edit Parcel</h2>
              <p className="text-gray-600">Update parcel details</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit}>
                {/* Receiver Name */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    <User className="inline mr-2" size={18} />
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Receiver Phone */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    <Phone className="inline mr-2" size={18} />
                    Receiver Phone
                  </label>
                  <input
                    type="tel"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Receiver Address */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    <MapPin className="inline mr-2" size={18} />
                    Receiver Address
                  </label>
                  <textarea
                    name="receiverAddress"
                    value={formData.receiverAddress}
                    onChange={handleChange}
                    placeholder="Street, City, Country"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Weight */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    <Weight className="inline mr-2" size={18} />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Rate: Rs.50 per kg</p>
                </div>

                {/* Estimated Charges */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Updated Charges:</span>
                    <span className="text-2xl font-bold text-blue-700">Rs.{estimatedCharges}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Updating...' : 'Update Parcel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/staff/parcels')}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
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
