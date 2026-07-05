import { Suspense, lazy, useCallback, useState } from 'react'
import Preloader from './components/primitives/Preloader'
import EnvelopeIntro from './components/primitives/EnvelopeIntro'
import MusicControl from './components/primitives/MusicControl'
import CustomCursor from './components/primitives/CustomCursor'
import Hero from './components/sections/Hero'
import Countdown from './components/sections/Countdown'
import Verse from './components/sections/Verse'
import Events from './components/sections/Events'
import Family from './components/sections/Family'
import Footer from './components/sections/Footer'

const Story = lazy(() => import('./components/sections/Story'))
const Venue = lazy(() => import('./components/sections/Venue'))
const FloatingGallery = lazy(() => import('./components/sections/FloatingGallery'))
const RSVP = lazy(() => import('./components/sections/RSVP'))

function App() {
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
            <FloatingGallery />
            <RSVP />
            <Footer />
          </Suspense>
        )}
      </main>
      <MusicControl autoPlay={envelopeDone} />
    </>
  )
}

export default App
