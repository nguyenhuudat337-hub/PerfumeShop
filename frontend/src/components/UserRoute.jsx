import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="text-center py-10">Đang tải...</p>
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/products" replace />

  return children
}