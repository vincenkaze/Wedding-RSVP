import { useState } from 'react'
import { isLoggedIn } from '../../lib/admin'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminGate() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn())

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />
  }

  return <AdminDashboard />
}
