import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { destinations } from '../data/destinations'
import { storyTexts } from '../data/storyTexts'
import { mediaUrl } from '../lib/media'

const SHUFFLE_TICKS = 12
const SHUFFLE_INTERVAL_MS = 90
const AUTO_ARRIVAL_DELAY_MS = 1500

const earthDestination = destinations.find((d) => d.isRealDestination) ?? destinations[0]

interface DestinationGachaProps {
  onComplete?: () => void
}

export default function DestinationGacha({ onComplete }: DestinationGachaProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<typeof earthDestination | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePick = () => {
    if (isSpinning || result) return
    setIsSpinning(true)

    let ticks = 0
    const runTick = () => {
      const random = destinations[Math.floor(Math.random() * destinations.length)]
      setDisplayName(random.name)
      ticks += 1
      if (ticks < SHUFFLE_TICKS) {
        tickTimerRef.current = setTimeout(runTick, SHUFFLE_INTERVAL_MS)
      } else {
        // 스토리상 최종 결과는 항상 지구(대전)로 수렴
        setDisplayName(earthDestination.name)
        setResult(earthDestination)
        setIsSpinning(false)
      }
    }
    runTick()
  }

  useEffect(() => {
    if (!result || !onComplete || completeTimerRef.current) return
    completeTimerRef.current = setTimeout(onComplete, AUTO_ARRIVAL_DELAY_MS)
  }, [onComplete, result])

  useEffect(() => {
    return () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    }
  }, [])

  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-cockpit-sky px-4">
      <img
        src={mediaUrl('spaceship-gacha-bg.png')}
        alt="목적지 뽑기 캡슐 기계"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-white/35" />

      <div className="relative z-10 flex flex-col items-center gap-4 rounded-[2.5rem] border border-white/70 bg-white/72 px-8 py-10 text-center shadow-[0_24px_80px_rgba(50,130,145,0.28)] backdrop-blur-sm md:px-14">
        <h2 className="text-3xl md:text-4xl font-bold text-[#3b2c76] drop-shadow-sm">
          {storyTexts.gacha.title}
        </h2>
        <p className="text-[#315566]/85">{storyTexts.gacha.description}</p>

        {!result && !isSpinning && (
          <motion.button
            type="button"
            onClick={handlePick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 rounded-full bg-cockpit-yellow px-8 py-4 text-xl font-bold text-[#3b2c76] shadow-[0_0_25px_rgba(255,229,138,0.55)] transition"
          >
            캡슐 뽑기
          </motion.button>
        )}

        <AnimatePresence>
          {(isSpinning || result) && displayName && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={
                result
                  ? { scale: [0.6, 1.12, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: result ? 0.6 : 0.2, ease: 'easeOut' }}
              className={`mt-6 rounded-[2rem] bg-white/95 px-10 py-7 shadow-2xl ${
                result ? 'shadow-[0_0_45px_rgba(255,229,138,0.65)]' : ''
              }`}
            >
              {isSpinning ? (
                <>
                  <p className="text-sm text-gray-500">신호 탐색 중...</p>
                  <p className="text-2xl font-bold text-cockpit-purple">{displayName}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-500">{storyTexts.gacha.resultReady}</p>
                  <p className="my-3 text-7xl drop-shadow-[0_0_18px_rgba(255,229,138,0.75)]" aria-label={result?.name}>
                    🌍
                  </p>
                  <p className="text-sm text-[#315566]/70">{storyTexts.gacha.autoArrival}</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isSpinning && !result && (
          <p className="mt-2 animate-pulse text-sm text-[#315566]/70">{storyTexts.gacha.hint}</p>
        )}
      </div>
    </section>
  )
}
