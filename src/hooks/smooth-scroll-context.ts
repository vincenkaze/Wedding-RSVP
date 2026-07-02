import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

export interface SmoothScrollContextValue {
  lenis: Lenis | null
}

export const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
})

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}
