import { Suspense, lazy, useCallback, useRef, useState } from 'react'
import Preloader from './components/primitives/Preloader'
import EnvelopeIntro from './components/primitives/EnvelopeIntro'
import StickyActionBar from './components/primitives/StickyActionBar'
import CustomCursor from './components/primitives/CustomCursor'
import ScrollProgress from './components/primitives/ScrollProgress'
import Hero from './components/sections/Hero'
import Countdown from './components/sections/Countdown'
import Verse from './components/sections/Verse'

const AdminGate = lazy(() => import('./components/admin/AdminGate'))
const Story = lazy(() => import('./components/sections/Story'))
const Events = lazy(() => import('./components/sections/Events'))
const Family = lazy(() => import('./components/sections/Family'))
const Venue = lazy(() => import('./components/sections/Venue'))
const Gallery = lazy(() => import('./components/sections/Gallery'))
const RSVP = lazy(() => import('./components/sections/RSVP'))
const Footer = lazy(() => import('./components/sections/Footer'))

function isAdminRoute() {
  return (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin')
  )
}

function WeddingSite() {
  const [loaded, setLoaded] = useState(false)
  const [envelopeDone, setEnvelopeDone] = useState(false)
  const [musicTriggered, setMusicTriggered] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const rsvpRef = useRef<HTMLElement | null>(null)

  const handlePreloaderComplete = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleEnvelopeComplete = useCallback(() => {
    setEnvelopeDone(true)
  }, [])

  const handleReveal = useCallback(() => {
    setMusicTriggered(true)
  }, [])

  return (
    <>
      <CustomCursor />
      {!loaded && <Preloader onComplete={handlePreloaderComplete} />}
      {loaded && !envelopeDone && (
        <EnvelopeIntro onComplete={handleEnvelopeComplete} onReveal={handleReveal} />
      )}
      <main className="min-h-dvh bg-bg">
        {envelopeDone && (
          <Suspense fallback={<div className="min-h-dvh" />}>
            <Hero ref={heroRef} />
            <Countdown />
            <Verse />
            <Story />
            <Events />
            <Family />
            <Venue />
            <Gallery />
            <RSVP ref={rsvpRef} />
            <Footer />
          </Suspense>
        )}
      </main>
      <StickyActionBar
        heroRef={heroRef}
        rsvpRef={rsvpRef}
        autoPlay={envelopeDone}
        playTrigger={musicTriggered}
      />
      <ScrollProgress />
    </>
  )
}

function App() {
  if (isAdminRoute()) {
    return (
      <Suspense>
        <AdminGate />
      </Suspense>
    )
  }

  return <WeddingSite />
}

export default App
