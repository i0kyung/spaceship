import { ReactNode, useEffect, useRef } from 'react'
import { storyTexts } from '../data/storyTexts'
import { mediaUrl } from '../lib/media'

// pointer가 영역을 벗어나면 영상을 중앙 프레임(duration / 2)으로 되돌릴지 여부.
// false로 바꾸면 마지막으로 보던 프레임에 멈춰 있습니다.
const RETURN_TO_CENTER = true

// currentTime이 targetTime을 따라가는 보간 속도 (0~1). 낮을수록 부드럽고 느리게 반응합니다.
const LERP_FACTOR = 0.08

interface KumdoriMouseScrubHeroProps {
  children?: ReactNode
}

export default function KumdoriMouseScrubHero({ children }: KumdoriMouseScrubHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    // video.duration이 아직 로드되지 않았을 때(NaN) 안전하게 중앙값으로 시작
    const getDuration = () => {
      const d = video.duration
      return Number.isFinite(d) && d > 0 ? d : 0
    }

    const setTargetFromRatio = (ratio: number) => {
      const duration = getDuration()
      if (duration === 0) return
      const clamped = Math.min(1, Math.max(0, ratio))
      targetTimeRef.current = clamped * duration
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      setTargetFromRatio(ratio)
    }

    const handlePointerLeave = () => {
      if (!RETURN_TO_CENTER) return
      const duration = getDuration()
      if (duration === 0) return
      targetTimeRef.current = duration / 2
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', handlePointerLeave)

    // 모바일 터치 대응 (pointermove가 터치도 커버하지만, 일부 브라우저 대비 명시적으로 처리)
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      const rect = container.getBoundingClientRect()
      const ratio = (touch.clientX - rect.left) / rect.width
      setTargetFromRatio(ratio)
    }
    container.addEventListener('touchmove', handleTouchMove, { passive: true })

    // 최초 로드 시 중앙 프레임에서 시작
    const handleLoadedMetadata = () => {
      const duration = getDuration()
      if (duration > 0) {
        targetTimeRef.current = duration / 2
        video.currentTime = duration / 2
      }
    }
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    const tick = () => {
      const duration = getDuration()
      // video.seeking 중에 currentTime을 또 덮어쓰면 seek이 영원히 끝나지 않아
      // 프레임이 렌더링되지 않는다 (브라우저가 항상 seeking=true로 멈춤).
      if (duration > 0 && !video.seeking) {
        const current = video.currentTime
        const target = targetTimeRef.current
        const diff = target - current
        // 이미 target에 충분히 가까우면 재할당하지 않아 불필요한 seek을 피한다.
        if (Math.abs(diff) > 0.005) {
          const next = current + diff * LERP_FACTOR
          if (Number.isFinite(next)) {
            video.currentTime = next
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
      container.removeEventListener('touchmove', handleTouchMove)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full snap-start overflow-hidden bg-cockpit-sky select-none"
    >
      {/* 배경: 영상 letterbox 여백을 자연스럽게 채우는 폴백 (영상 자체에 우주선 배경이 포함되어 있음) */}
      <img
        src={mediaUrl('spaceship-window-clear.png')}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* 꿈돌이 영상 레이어 — 잘리지 않도록 object-contain으로 전체 프레임을 보존하며 중앙 배치 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={mediaUrl('kumdori-look.mp4')}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          // 화면을 꽉 채우고 싶다면 object-cover로 바꿀 수 있지만, 얼굴/몸통이 잘릴 수 있습니다.
          className="h-auto max-h-[85%] w-auto max-w-[92%] object-contain drop-shadow-2xl"
        />
      </div>

      {/* 하단 텍스트 가독성을 위한 얇은 그라데이션 스크림 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

      {/* 투명한 pointer 감지 영역 (전체를 덮되 UI 클릭은 막지 않음) */}
      <div className="absolute inset-0 z-10" />

      {/* 텍스트 / UI */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 grid gap-5 px-4 md:bottom-10 md:grid-cols-[minmax(0,1fr)_360px] md:items-end md:px-10">
        <div className="flex max-w-3xl flex-col gap-2 text-center md:text-left">
          <span className="text-sm tracking-widest text-white/80">{storyTexts.hero.eyebrow}</span>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
            {storyTexts.hero.title}
          </h1>
          <p className="text-lg text-white/90 md:text-xl">{storyTexts.hero.subtitle}</p>
          <p className="mt-2 animate-pulse text-sm text-white/70">{storyTexts.hero.hint}</p>
        </div>
        <div className="pointer-events-auto justify-self-center md:justify-self-end">
          {children}
        </div>
      </div>
    </section>
  )
}
