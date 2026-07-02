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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex max-w-xl flex-col items-center gap-3 text-center px-4"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          {storyTexts.arrival.title}
        </h2>
        <p className="text-4xl md:text-5xl font-bold text-cockpit-yellow drop-shadow-lg">
          {storyTexts.arrival.subtitle}
        </p>
        <p className="mt-4 text-white/85">{storyTexts.arrival.description}</p>
      </motion.div>
    </section>
  )
}
