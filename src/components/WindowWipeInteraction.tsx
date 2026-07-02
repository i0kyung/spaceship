import { useEffect, useRef, useState } from 'react'
import { storyTexts } from '../data/storyTexts'
import { mediaUrl } from '../lib/media'
import type { useHandTracking } from '../hooks/useHandTracking'

const WIPE_RADIUS = 65
// 진행률(0~100)이 이 값 이상이면 "다 닦았다"로 간주
const CLEAR_THRESHOLD = 70
const PROGRESS_SAMPLE_INTERVAL_MS = 150

interface WindowWipeInteractionProps {
  hand: ReturnType<typeof useHandTracking>
  onNext: () => void
}

export default function WindowWipeInteraction({ hand, onNext }: WindowWipeInteractionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef(false)
  const lastSampleAtRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [isCleared, setIsCleared] = useState(false)
  const [brushPos, setBrushPos] = useState<{ x: number; y: number } | null>(null)

  const isHandMode = hand.status === 'ready'

  // 캔버스 초기화 + 뿌연 창문 이미지 그리기
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    let foggyImg: HTMLImageElement | null = null

    const resizeAndDraw = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      if (foggyImg) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(foggyImg, 0, 0, canvas.width, canvas.height)
      }
    }

    foggyImg = new Image()
    foggyImg.src = mediaUrl('spaceship-window-foggy.png')
    foggyImg.onload = resizeAndDraw

    window.addEventListener('resize', resizeAndDraw)
    return () => window.removeEventListener('resize', resizeAndDraw)
  }, [])

  // 부드러운 glow 브러시로 지우기 + 진행률 샘플링 (마우스/손 공용)
  const wipeAt = (x: number, y: number) => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas || isCleared) return

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, WIPE_RADIUS)
    gradient.addColorStop(0, 'rgba(0,0,0,1)')
    gradient.addColorStop(0.6, 'rgba(0,0,0,1)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, WIPE_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    setBrushPos({ x, y })

    const now = performance.now()
    if (now - lastSampleAtRef.current < PROGRESS_SAMPLE_INTERVAL_MS) return
    lastSampleAtRef.current = now

    const { width, height } = canvas
    if (width === 0 || height === 0) return
    const sampleSize = 40
    const data = ctx.getImageData(0, 0, width, height).data
    let transparent = 0
    let total = 0
    const stepX = Math.max(1, Math.floor(width / sampleSize))
    const stepY = Math.max(1, Math.floor(height / sampleSize))
    for (let sy = 0; sy < height; sy += stepY) {
      for (let sx = 0; sx < width; sx += stepX) {
        const idx = (sy * width + sx) * 4 + 3
        if (data[idx] < 40) transparent++
        total++
      }
    }
    if (total === 0) return
    const pct = Math.round((transparent / total) * 100)
    setProgress((prev) => (pct > prev ? pct : prev))
    if (pct >= CLEAR_THRESHOLD) setIsCleared(true)
  }

  // 마우스 / 터치 드래그 닦기 (손 인식 모드가 아닐 때)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handlePointerDown = (e: PointerEvent) => {
      if (isHandMode) return
      isDrawingRef.current = true
      const rect = canvas.getBoundingClientRect()
      wipeAt(e.clientX - rect.left, e.clientY - rect.top)
    }
    const handlePointerMove = (e: PointerEvent) => {
      if (isHandMode || !isDrawingRef.current) return
      const rect = canvas.getBoundingClientRect()
      wipeAt(e.clientX - rect.left, e.clientY - rect.top)
    }
    const handlePointerUp = () => {
      isDrawingRef.current = false
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHandMode, isCleared])

  // 손 인식 모드일 때 손가락 좌표로 닦기
  useEffect(() => {
    if (!isHandMode || !hand.isHandVisible || !hand.point) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    wipeAt(hand.point.x * rect.width, hand.point.y * rect.height)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHandMode, hand.isHandVisible, hand.point])

  return (
    <section
      ref={containerRef}
      className="relative flex h-screen w-full snap-start flex-col items-center justify-center overflow-hidden bg-cockpit-mint"
    >
      <img
        src={mediaUrl('spaceship-window-clear.png')}
        alt="맑은 우주 창밖 풍경"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: isCleared || isHandMode ? 'default' : 'crosshair' }}
      />

      {/* 부드러운 glow 브러시 커서 */}
      {brushPos && !isCleared && (
        <div
          className="pointer-events-none absolute z-10 rounded-full"
          style={{
            left: brushPos.x,
            top: brushPos.y,
            width: WIPE_RADIUS * 1.6,
            height: WIPE_RADIUS * 1.6,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)',
            boxShadow: '0 0 30px 10px rgba(255,255,255,0.35)',
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-10 z-20 flex flex-col items-center gap-2 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          {storyTexts.wipe.title}
        </h2>
        <p className="text-white/90">{storyTexts.wipe.description}</p>
      </div>

      {/* 손 인식 상태 패널 */}
      <div className="pointer-events-none absolute right-4 top-24 z-20 flex flex-col items-center gap-2 rounded-2xl bg-black/40 p-3 text-center backdrop-blur-sm md:right-8">
        {isHandMode && (
          <video
            ref={hand.videoRef}
            muted
            playsInline
            className="h-16 w-20 rounded-lg bg-black object-cover [transform:scaleX(-1)]"
          />
        )}
        <span className="text-xs font-bold text-white">
          {isHandMode ? storyTexts.wipe.modeHand : storyTexts.wipe.modeMouse}
        </span>
      </div>

      {/* 닦기 진행률 게이지 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex flex-col items-center gap-2 px-4">
        <div className="h-2 w-56 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-cockpit-yellow transition-all duration-150"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {!isCleared ? (
          <p className="animate-pulse text-sm text-white/70">
            {isHandMode ? storyTexts.wipe.hint : storyTexts.wipe.hintMouse}
          </p>
        ) : (
          <div className="pointer-events-auto flex flex-col items-center gap-3">
            <p className="text-base font-bold text-white drop-shadow">{storyTexts.wipe.cleared}</p>
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-white/90 px-6 py-2.5 text-sm font-bold text-cockpit-mint shadow-lg transition hover:scale-105 active:scale-95"
            >
              {storyTexts.wipe.nextButton}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
