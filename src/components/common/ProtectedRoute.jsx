import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute({ children, roles }) {
  const { auth }   = useAuth()
  const location   = useLocation()

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(auth.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
