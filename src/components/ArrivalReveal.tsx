import { motion } from 'framer-motion'
import { storyTexts } from '../data/storyTexts'
import { mediaUrl } from '../lib/media'
import Starfield from './Starfield'

export default function ArrivalReveal() {
  return (
    <section className="relative flex h-screen w-full snap-start flex-col items-center justify-center overflow-hidden bg-[#0b1030]">
      <img
        src={mediaUrl('warp-tunnel-earth-bg.png')}
        alt="워프 터널 끝에 보이는 지구"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <Starfield count={40} />
      {/* 지구가 있는 중심을 향해 번지는 글로우 — 도착의 순간을 강조 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.4 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 58%, rgba(255,250,225,0.35), transparent 55%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex max-w-xl flex-col items-center gap-3 rounded-[2.5rem] border border-white/20 bg-black/40 px-8 py-10 text-center shadow-2xl backdrop-blur-md md:px-14"
      >
        <span className="text-xs font-bold tracking-[0.2em] text-cockpit-mint">
          {storyTexts.arrival.kicker}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          {storyTexts.arrival.title}
        </h2>
        <motion.p
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="text-4xl font-bold text-cockpit-yellow drop-shadow-[0_0_25px_rgba(255,229,138,0.65)] md:text-5xl"
        >
          {storyTexts.arrival.subtitle}
        </motion.p>
        <p className="mt-2 text-white/85">{storyTexts.arrival.description}</p>
        <p className="mt-3 text-sm font-bold text-white/70">{storyTexts.arrival.closing}</p>
      </motion.div>
    </section>
  )
}
