import { createContext } from 'react'
import type Lenis from 'lenis'

export interface SmoothScrollContextValue {
  lenis: Lenis | null
}

export const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
})
