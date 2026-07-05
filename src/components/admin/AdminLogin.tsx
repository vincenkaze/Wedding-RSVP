import { useState, type FormEvent } from 'react'
import { login } from '../../lib/admin'

interface Props {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    const result = await login(password)
    setLoading(false)

    if (result.ok) {
      onLogin()
    } else {
      setError(result.error ?? 'Login failed.')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8"
      >
        <h1 className="mb-2 text-center font-serif text-2xl font-semibold text-white">
          Admin
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Enter the guest list password
        </p>

        <label htmlFor="admin-password" className="sr-only">
          Password
        </label>
        <div className="relative mb-4">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 pr-12 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
