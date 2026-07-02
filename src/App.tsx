import { useRef, useState } from 'react'
import KumdoriMouseScrubHero from './components/KumdoriMouseScrubHero'
import WindowWipeInteraction from './components/WindowWipeInteraction'
import DestinationGacha from './components/DestinationGacha'
import ArrivalReveal from './components/ArrivalReveal'
import BoardingGate from './components/BoardingGate'
import TravelLoadingOverlay from './components/TravelLoadingOverlay'
import { useHandTracking } from './hooks/useHandTracking'

function App() {
  const hand = useHandTracking()
  const [hasBoarded, setHasBoarded] = useState(false)
  const [isTraveling, setIsTraveling] = useState(false)
  const gachaSectionRef = useRef<HTMLDivElement>(null)

  const handleTravelDone = () => {
    setIsTraveling(false)
    gachaSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="snap-y snap-mandatory">
      {!hasBoarded && <BoardingGate hand={hand} onBoard={() => setHasBoarded(true)} />}
      {isTraveling && <TravelLoadingOverlay onDone={handleTravelDone} />}

      {/* 1. 첫 만남 */}
      <KumdoriMouseScrubHero />
      {/* 2. 우주창 닦기 */}
      <WindowWipeInteraction hand={hand} onNext={() => setIsTraveling(true)} />
      {/* 3. 목적지 뽑기 */}
      <div ref={gachaSectionRef}>
        <DestinationGacha />
      </div>
      {/* 4. 이스터에그 / 확정 */}
      <ArrivalReveal />
    </main>
  )
}

export default App
