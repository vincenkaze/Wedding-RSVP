import { supabase } from './supabase'
import type { RsvpRow } from './rsvp'

const SESSION_KEY = 'admin_session'
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

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
  const session: Session = { token, expiresAt: Date.now() + TOKEN_TTL_MS }
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
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { apikey: apiKey } : {}),
      },
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
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    const res = await fetch(functionUrl, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        ...(apiKey ? { apikey: apiKey } : {}),
      },
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
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    const res = await fetch(`${functionUrl}?format=csv`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        ...(apiKey ? { apikey: apiKey } : {}),
      },
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
  if (!supabase) return { ok: false, error: 'Supabase not configured.' }

  const { error } = await supabase.from('rsvps').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
