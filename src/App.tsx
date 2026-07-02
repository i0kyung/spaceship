import KumdoriMouseScrubHero from './components/KumdoriMouseScrubHero'
import WindowWipeInteraction from './components/WindowWipeInteraction'
import DestinationGacha from './components/DestinationGacha'
import ArrivalReveal from './components/ArrivalReveal'

function App() {
  return (
    <main>
      {/* 1. 첫 만남 */}
      <KumdoriMouseScrubHero />
      {/* 2. 우주창 닦기 */}
      <WindowWipeInteraction />
      {/* 3. 목적지 뽑기 */}
      <DestinationGacha />
      {/* 4. 이스터에그 / 확정 */}
      <ArrivalReveal />
    </main>
  )
}

export default App
