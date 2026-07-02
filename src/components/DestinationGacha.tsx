import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { destinations } from '../data/destinations'
import { storyTexts } from '../data/storyTexts'
import { mediaUrl } from '../lib/media'

const SHUFFLE_TICKS = 12
const SHUFFLE_INTERVAL_MS = 90

const earthDestination = destinations.find((d) => d.isRealDestination) ?? destinations[0]

export default function DestinationGacha() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<typeof earthDestination | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  return (
    <section className="relative flex h-screen w-full snap-start flex-col items-center justify-center overflow-hidden bg-cockpit-purple">
      <img
        src={mediaUrl('spaceship-gacha-bg.png')}
        alt="목적지 뽑기 캡슐 기계"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* 화려한 배경 위에서도 글이 묻히지 않도록 하는 dark scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f57]/20 via-[#2a1f57]/45 to-[#2a1f57]/70" />

      <div className="relative z-10 flex flex-col items-center gap-4 rounded-[2.5rem] border border-white/20 bg-black/35 px-8 py-10 text-center shadow-2xl backdrop-blur-md md:px-14">
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          {storyTexts.gacha.title}
        </h2>
        <p className="text-white/90">{storyTexts.gacha.description}</p>

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
              className={`mt-6 rounded-2xl bg-white/95 px-10 py-6 shadow-2xl ${
                result ? 'shadow-[0_0_45px_rgba(255,229,138,0.65)]' : ''
              }`}
            >
              <p className="text-sm text-gray-500">
                {isSpinning ? '뽑는 중...' : '뽑힌 목적지'}
              </p>
              <p className="text-2xl font-bold text-cockpit-purple">{displayName}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isSpinning && !result && (
          <p className="mt-2 animate-pulse text-white/70 text-sm">{storyTexts.gacha.hint}</p>
        )}
      </div>
    </section>
  )
}
