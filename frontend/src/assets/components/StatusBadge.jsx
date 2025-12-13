export default function StatusBadge({ status }) {
  const getColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'bg-gray-600 text-white'
      case 'packed':
        return 'bg-blue-700 text-white'
      case 'in transit':
        return 'bg-amber-600 text-white'
      case 'out for delivery':
        return 'bg-orange-600 text-white'
      case 'delivered':
        return 'bg-teal-600 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getColor(status)} shadow-sm`}>
      {status || 'Unknown'}
    </span>
  )
}