import { Suspense, lazy, useCallback, useState } from 'react'
import Preloader from './components/primitives/Preloader'
import EnvelopeIntro from './components/primitives/EnvelopeIntro'
import MusicControl from './components/primitives/MusicControl'
import CustomCursor from './components/primitives/CustomCursor'
import ScrollProgress from './components/primitives/ScrollProgress'
import Hero from './components/sections/Hero'
import Countdown from './components/sections/Countdown'
import Verse from './components/sections/Verse'
import Events from './components/sections/Events'
import Family from './components/sections/Family'
import Footer from './components/sections/Footer'

const AdminGate = lazy(() => import('./components/admin/AdminGate'))
const Story = lazy(() => import('./components/sections/Story'))
const Venue = lazy(() => import('./components/sections/Venue'))
const Gallery = lazy(() => import('./components/sections/Gallery'))
const RSVP = lazy(() => import('./components/sections/RSVP'))

function isAdminRoute() {
  return (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin')
  )
}

function WeddingSite() {
  const [loaded, setLoaded] = useState(false)
  const [envelopeDone, setEnvelopeDone] = useState(false)

  const handlePreloaderComplete = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleEnvelopeComplete = useCallback(() => {
    setEnvelopeDone(true)
  }, [])

  return (
    <>
      <CustomCursor />
      {!loaded && <Preloader onComplete={handlePreloaderComplete} />}
      {loaded && !envelopeDone && (
        <EnvelopeIntro onComplete={handleEnvelopeComplete} />
      )}
      <main className="min-h-dvh bg-bg">
        {envelopeDone && (
          <Suspense>
            <Hero />
            <Countdown />
            <Verse />
            <Story />
            <Events />
            <Family />
            <Venue />
            <Gallery />
            <RSVP />
            <Footer />
          </Suspense>
        )}
      </main>
      <MusicControl autoPlay={envelopeDone} />
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
