export interface DebugState {
  enabled: boolean
  logs: string[]
  maxLogs: number
}

export function createDebugState(): DebugState {
  return {
    enabled: false,
    logs: [],
    maxLogs: 100,
  }
}

export function logDebug(state: DebugState, msg: string): void {
  if (!state.enabled) return
  const entry = `[Engine] ${msg}`
  state.logs.push(entry)
  if (state.logs.length > state.maxLogs) {
    state.logs.shift()
  }
}
