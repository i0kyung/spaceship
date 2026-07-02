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
  const windowRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef(false)
  const lastSampleAtRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [isCleared, setIsCleared] = useState(false)
  const [brushPos, setBrushPos] = useState<{ x: number; y: number } | null>(null)

  const isHandMode = hand.status === 'ready'

  const drawFrostedGlass = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'source-over'

    const baseGradient = ctx.createLinearGradient(0, 0, width, height)
    baseGradient.addColorStop(0, 'rgba(11, 26, 66, 0.88)')
    baseGradient.addColorStop(0.48, 'rgba(26, 97, 128, 0.76)')
    baseGradient.addColorStop(1, 'rgba(8, 18, 52, 0.9)')
    ctx.fillStyle = baseGradient
    ctx.fillRect(0, 0, width, height)

    const hazeGradient = ctx.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, width * 0.7)
    hazeGradient.addColorStop(0, 'rgba(210, 255, 250, 0.4)')
    hazeGradient.addColorStop(0.45, 'rgba(180, 235, 245, 0.18)')
    hazeGradient.addColorStop(1, 'rgba(6, 12, 42, 0)')
    ctx.fillStyle = hazeGradient
    ctx.fillRect(0, 0, width, height)

    ctx.lineCap = 'round'
    for (let i = 0; i < 34; i += 1) {
      const t = i / 34
      const x = ((Math.sin(i * 12.989) * 43758.5453) % 1 + 1) % 1
      const y = ((Math.sin(i * 78.233) * 24634.6345) % 1 + 1) % 1
      const length = width * (0.08 + (i % 5) * 0.025)
      ctx.strokeStyle = `rgba(230, 255, 255, ${0.12 + (i % 4) * 0.035})`
      ctx.lineWidth = 2 + (i % 3)
      ctx.beginPath()
      ctx.moveTo(x * width, y * height)
      ctx.quadraticCurveTo(x * width + length * 0.35, y * height - height * 0.04, x * width + length, y * height + Math.sin(t * 9) * height * 0.04)
      ctx.stroke()
    }

    for (let i = 0; i < 28; i += 1) {
      const x = (((Math.sin(i * 4.71) * 10000) % 1 + 1) % 1) * width
      const y = (((Math.cos(i * 5.37) * 10000) % 1 + 1) % 1) * height
      const radius = 10 + (i % 6) * 5
      const drop = ctx.createRadialGradient(x, y, 0, x, y, radius)
      drop.addColorStop(0, 'rgba(240, 255, 255, 0.2)')
      drop.addColorStop(0.55, 'rgba(190, 235, 240, 0.1)')
      drop.addColorStop(1, 'rgba(190, 235, 240, 0)')
      ctx.fillStyle = drop
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 캔버스 초기화 + 중앙 창문 안에 어두운 유리막/성에 질감 그리기
  useEffect(() => {
    const canvas = canvasRef.current
    const windowEl = windowRef.current
    if (!canvas || !windowEl) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    const resizeAndDraw = (resetProgress = true) => {
      const rect = windowEl.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      drawFrostedGlass(ctx, canvas.width, canvas.height)
      if (resetProgress) {
        setProgress(0)
        setIsCleared(false)
        setBrushPos(null)
      }
    }

    resizeAndDraw(false)

    const handleResize = () => resizeAndDraw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
      className="relative flex h-screen w-full snap-start flex-col items-center justify-center overflow-hidden bg-[#07102f] px-4 py-10"
    >
      <img
        src={mediaUrl('spaceship-window-clear.png')}
        alt="맑은 우주 창밖 풍경"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#06102b]/55 backdrop-blur-[2px]" />

      <div className="pointer-events-none relative z-20 mb-5 flex max-w-3xl flex-col items-center gap-2 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          {storyTexts.wipe.title}
        </h2>
        <p className="text-white/90">{storyTexts.wipe.description}</p>
      </div>

      <div
        ref={windowRef}
        className={`relative z-10 aspect-[16/9] w-[min(92vw,980px)] max-h-[58vh] overflow-hidden rounded-[2rem] border-[10px] border-cockpit-mint/80 bg-cockpit-sky shadow-[0_0_0_1px_rgba(255,255,255,0.45),0_28px_90px_rgba(11,16,48,0.55)] transition duration-700 md:rounded-[3rem] md:border-[16px] ${
          isCleared ? 'shadow-[0_0_45px_rgba(255,229,138,0.75),0_28px_90px_rgba(11,16,48,0.45)]' : ''
        }`}
      >
        <img
          src={mediaUrl('spaceship-window-clear.png')}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
            isCleared ? 'scale-105 brightness-110 saturate-125' : 'scale-100 brightness-95 saturate-90'
          }`}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] border border-white/45 md:rounded-[2rem]" />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${
            isCleared ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ cursor: isCleared || isHandMode ? 'default' : 'crosshair' }}
        />

        {/* 부드러운 glow 브러시 커서 */}
        {brushPos && !isCleared && (
          <div
            className="pointer-events-none absolute z-10 rounded-full"
            style={{
              left: brushPos.x,
              top: brushPos.y,
              width: WIPE_RADIUS * 1.8,
              height: WIPE_RADIUS * 1.8,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.24) 42%, rgba(255,255,255,0) 72%)',
              boxShadow: '0 0 35px 14px rgba(255,255,255,0.35)',
            }}
          />
        )}

        {isCleared && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,245,170,0.28),transparent_45%)]" />
        )}
      </div>

      {/* 손 인식 상태 패널 */}
      <div className="pointer-events-none absolute right-4 top-24 z-20 flex flex-col items-center gap-2 rounded-2xl bg-black/45 p-3 text-center backdrop-blur-sm md:right-8">
        <span className="text-xs font-bold text-white">
          {isHandMode ? storyTexts.wipe.modeHand : storyTexts.wipe.modeMouse}
        </span>
        {hand.status === 'error' && (
          <span className="max-w-36 text-[11px] leading-snug text-white/70">
            {hand.errorMessage}
          </span>
        )}
      </div>

      {/* 닦기 진행률 게이지 */}
      <div className="pointer-events-none relative z-20 mt-5 flex flex-col items-center gap-2 px-4">
        <div className="h-2 w-56 overflow-hidden rounded-full bg-white/25 shadow-inner">
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
              className="rounded-full bg-white/95 px-6 py-2.5 text-sm font-bold text-[#186277] shadow-lg transition hover:scale-105 active:scale-95"
            >
              {storyTexts.wipe.nextButton}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
