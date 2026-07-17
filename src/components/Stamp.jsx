function Stamp({ label, variant }) {
  const getStatusClasses = (variant) => {
    switch (variant) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(variant)}`}>
      {label}
    </span>
  )
}

export default Stamp
