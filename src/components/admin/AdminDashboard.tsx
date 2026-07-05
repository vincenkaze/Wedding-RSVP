import { useState, useEffect, useMemo } from 'react'
import { fetchRows, logout, downloadCsv, deleteRow } from '../../lib/admin'
import type { RsvpRow } from '../../lib/rsvp'

export default function AdminDashboard() {
  const [rows, setRows] = useState<RsvpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await fetchRows()
      setRows(result.rows)
      if (result.error) setError(result.error)
      setLoading(false)
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        r.dietary.toLowerCase().includes(q),
    )
  }, [rows, search])

  const stats = useMemo(() => {
    const totalGuests = rows.reduce((sum, r) => sum + r.guests, 0)
    const dietaryMap: Record<string, number> = {}
    for (const r of rows) {
      const key = r.dietary || 'None'
      dietaryMap[key] = (dietaryMap[key] || 0) + 1
    }
    return { total: rows.length, totalGuests, dietaryMap }
  }, [rows])

  async function handleDelete(id: string) {
    const result = await deleteRow(id)
    if (result.ok) {
      setRows((prev) => prev.filter((r) => r.id !== id))
    } else {
      setError(result.error ?? 'Delete failed.')
    }
    setConfirmDelete(null)
  }

  function handleLogout() {
    logout()
    window.location.reload()
  }

  return (
    <div className="min-h-dvh bg-gray-950 text-white">
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="font-serif text-xl font-semibold">RSVP Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void downloadCsv()}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
            >
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading && (
          <p className="py-12 text-center text-gray-500">Loading responses...</p>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Responses" value={stats.total} />
              <StatCard label="Total Guests" value={stats.totalGuests} />
              <StatCard
                label="Dietary Notes"
                value={Object.keys(stats.dietaryMap).length}
              />
              <StatCard
                label="Avg Guests"
                value={
                  stats.total > 0
                    ? (stats.totalGuests / stats.total).toFixed(1)
                    : '0'
                }
              />
            </div>

            {/* Dietary breakdown */}
            {Object.keys(stats.dietaryMap).length > 0 && (
              <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
                <h2 className="mb-3 text-sm font-medium text-gray-400">
                  Dietary Breakdown
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.dietaryMap).map(([key, count]) => (
                    <span
                      key={key}
                      className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
                    >
                      {key}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, message, or dietary..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-800 bg-gray-900 text-xs text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Guests</th>
                    <th className="px-4 py-3">Events</th>
                    <th className="px-4 py-3">Dietary</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        {rows.length === 0
                          ? 'No responses yet.'
                          : 'No matches found.'}
                      </td>
                    </tr>
                  )}
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-gray-900/50"
                    >
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.guests}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {row.events.length > 0
                          ? row.events.join(', ')
                          : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {row.dietary || '\u2014'}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-gray-300">
                        {row.message || '\u2014'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {new Date(row.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDelete === row.id ? (
                          <span className="flex items-center gap-2">
                            <button
                              onClick={() => void handleDelete(row.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-gray-500 hover:text-gray-300"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(row.id)}
                            className="text-xs text-gray-500 hover:text-red-400"
                            aria-label={`Delete ${row.name}`}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
