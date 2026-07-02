import { useEffect, useState } from 'react'
import { storyTexts } from '../data/storyTexts'

const PHRASE_INTERVAL_MS = 800
const { phrases } = storyTexts.loading
const TOTAL_MS = phrases.length * PHRASE_INTERVAL_MS

export default function TravelLoadingOverlay({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const tickTimer = setInterval(() => {
      setIndex((prev) => Math.min(prev + 1, phrases.length - 1))
    }, PHRASE_INTERVAL_MS)
    const doneTimer = setTimeout(onDone, TOTAL_MS)
    return () => {
      clearInterval(tickTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0b1030]">
      <p className="text-xl font-bold text-white md:text-2xl">{phrases[index]}</p>
      <div className="h-2 w-64 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-cockpit-yellow transition-all ease-linear"
          style={{ width: `${((index + 1) / phrases.length) * 100}%`, transitionDuration: `${PHRASE_INTERVAL_MS}ms` }}
        />
      </div>
    </div>
  )
}
