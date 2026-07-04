import { useCallback, useState } from 'react'
import Preloader from './components/primitives/Preloader'
import EnvelopeIntro from './components/primitives/EnvelopeIntro'
import MusicControl from './components/primitives/MusicControl'
import CustomCursor from './components/primitives/CustomCursor'
import Hero from './components/sections/Hero'
import Countdown from './components/sections/Countdown'
import Verse from './components/sections/Verse'
import Story from './components/sections/Story'
import Events from './components/sections/Events'
import Family from './components/sections/Family'
import Venue from './components/sections/Venue'
import FloatingGallery from './components/sections/FloatingGallery'
import RSVP from './components/sections/RSVP'
import Footer from './components/sections/Footer'

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
      </main>
      <MusicControl autoPlay={envelopeDone} />
    </>
  )
}

export default App
