import type { RsvpRow } from './rsvp'

const SESSION_KEY = 'admin_session'

interface Session {
  token: string
  expiresAt: number
}

function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function setSession(token: string): void {
  const session: Session = { token, expiresAt: Date.now() + 12 * 60 * 60 * 1000 }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function login(
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const functionUrl = import.meta.env.VITE_ADMIN_FUNCTION_URL as
    | string
    | undefined
  if (!functionUrl) {
    return { ok: false, error: 'Admin function not configured.' }
  }

  const passwordHash = await hashPassword(password)

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordHash }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return {
        ok: false,
        error: body?.error ?? `Authentication failed (${res.status})`,
      }
    }

    const { token } = (await res.json()) as { token: string }
    setSession(token)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error. Please try again.' }
  }
}

export async function fetchRows(): Promise<{
  rows: RsvpRow[]
  error?: string
}> {
  const session = getSession()
  if (!session) return { rows: [], error: 'Not authenticated.' }

  const functionUrl = import.meta.env.VITE_ADMIN_FUNCTION_URL as
    | string
    | undefined
  if (!functionUrl) return { rows: [], error: 'Admin function not configured.' }

  try {
    const res = await fetch(functionUrl, {
      headers: { Authorization: `Bearer ${session.token}` },
    })

    if (!res.ok) {
      logout()
      return { rows: [], error: 'Session expired. Please log in again.' }
    }

    const { rows } = (await res.json()) as { rows: RsvpRow[] }
    return { rows }
  } catch {
    return { rows: [], error: 'Network error.' }
  }
}

export async function downloadCsv(): Promise<void> {
  const session = getSession()
  if (!session) return

  const functionUrl = import.meta.env.VITE_ADMIN_FUNCTION_URL as
    | string
    | undefined
  if (!functionUrl) return

  try {
    const res = await fetch(`${functionUrl}?format=csv`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })

    if (!res.ok) return

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    /* silent */
  }
}

export async function deleteRow(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = getSession()
  if (!session) return { ok: false, error: 'Not authenticated.' }

  const functionUrl = import.meta.env.VITE_ADMIN_FUNCTION_URL as
    | string
    | undefined
  if (!functionUrl) return { ok: false, error: 'Admin function not configured.' }

  try {
    const res = await fetch(functionUrl, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ id }),
    })

    if (!res.ok) return { ok: false, error: 'Delete failed.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error.' }
  }
}
