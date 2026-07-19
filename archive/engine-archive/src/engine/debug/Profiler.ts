export interface ProfilerEntry {
  name: string
  duration: number
  timestamp: number
}

export class Profiler {
  private entries: ProfilerEntry[] = []
  private maxEntries = 100
  private marks: Map<string, number> = new Map()

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string): number {
    const start = this.marks.get(name)
    if (start === undefined) return 0
    const duration = performance.now() - start
    this.marks.delete(name)

    this.entries.push({
      name,
      duration,
      timestamp: performance.now(),
    })

    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }

    return duration
  }

  getEntries(): ProfilerEntry[] {
    return [...this.entries]
  }

  getAverage(name: string): number {
    const matching = this.entries.filter((e) => e.name === name)
    if (matching.length === 0) return 0
    const total = matching.reduce((sum, e) => sum + e.duration, 0)
    return total / matching.length
  }

  clear(): void {
    this.entries = []
    this.marks.clear()
  }
}
