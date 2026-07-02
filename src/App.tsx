import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import KumdoriMouseScrubHero from './components/KumdoriMouseScrubHero'
import WindowWipeInteraction from './components/WindowWipeInteraction'
import DestinationGacha from './components/DestinationGacha'
import ArrivalReveal from './components/ArrivalReveal'
import BoardingGate from './components/BoardingGate'
import { useHandTracking } from './hooks/useHandTracking'

type Stage = 'intro' | 'wipe' | 'gacha' | 'arrival'

function App() {
  const hand = useHandTracking()
  const [activeStage, setActiveStage] = useState<Stage>('intro')

  const goToWipe = useCallback(() => setActiveStage('wipe'), [])
  const goToGacha = useCallback(() => setActiveStage('gacha'), [])
  const goToArrival = useCallback(() => setActiveStage('arrival'), [])

  const renderStage = () => {
    switch (activeStage) {
      case 'intro':
        return (
          <KumdoriMouseScrubHero onComplete={goToWipe}>
            <BoardingGate hand={hand} onBoard={goToWipe} />
          </KumdoriMouseScrubHero>
        )
      case 'wipe':
        return <WindowWipeInteraction hand={hand} onNext={goToGacha} />
      case 'gacha':
        return <DestinationGacha onComplete={goToArrival} />
      case 'arrival':
        return <ArrivalReveal />
      default:
        return null
    }
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[#0b1030]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, filter: 'blur(14px)', scale: 1.015 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(18px)', scale: 0.985 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {renderStage()}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

export default App
