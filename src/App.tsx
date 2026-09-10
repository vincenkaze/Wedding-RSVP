import { Suspense, lazy, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Preloader from './components/primitives/Preloader'
import EnvelopeIntro from './components/primitives/EnvelopeIntro'
import StickyActionBar from './components/primitives/StickyActionBar'
import MusicControl from './components/primitives/MusicControl'
import CustomCursor from './components/primitives/CustomCursor'
import ScrollProgress from './components/primitives/ScrollProgress'
import SectionProgress from './components/primitives/SectionProgress'
import { SmoothScrollContext } from './hooks/smooth-scroll-context'
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

  const { lenis } = useContext(SmoothScrollContext)

  // Always start at the top: the browser would otherwise restore a stale
  // scroll offset (e.g. Countdown) since above-fold content now mounts
  // immediately behind the intro overlays.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  // Lock scroll until the intro completes so the user always lands on
  // Hero and sees its entrance animation first.
  useEffect(() => {
    if (envelopeDone) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    lenis?.stop()
    return () => {
      document.body.style.overflow = prevOverflow
      lenis?.start()
    }
  }, [envelopeDone, lenis])

  return (
    <>
      <CustomCursor />
      {!loaded && <Preloader onComplete={handlePreloaderComplete} />}
      {loaded && !envelopeDone && (
        <EnvelopeIntro onComplete={handleEnvelopeComplete} onReveal={handleReveal} />
      )}
      <main className="min-h-dvh bg-bg">
        {/* Above-fold content renders immediately so LCP fires fast;
            Preloader/EnvelopeIntro sit on top as fixed overlays.
            Hero's entrance holds until the envelope punch-through hands off. */}
        <Hero ref={heroRef} startAnimations={envelopeDone} />
        <Countdown />
        <Verse />
        {envelopeDone && (
          <Suspense fallback={null}>
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
      />
      <MusicControl autoPlay={envelopeDone} playTrigger={musicTriggered} />
      <ScrollProgress />
      {envelopeDone && <SectionProgress />}
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
