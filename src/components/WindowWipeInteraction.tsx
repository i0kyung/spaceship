import { useEffect, useRef, useState } from 'react'
import { storyTexts } from '../data/storyTexts'

const WIPE_RADIUS = 60
// 이 비율(0~1) 이상 지워지면 "다 닦았다"로 간주
const CLEAR_THRESHOLD = 0.55

export default function WindowWipeInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)
  const [isCleared, setIsCleared] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
    foggyImg.src = '/media/spaceship-window-foggy.png'
    foggyImg.onload = resizeAndDraw

    window.addEventListener('resize', resizeAndDraw)

    const wipeAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, WIPE_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }

    const checkClearedRatio = () => {
      const { width, height } = canvas
      if (width === 0 || height === 0) return
      // 성능을 위해 다운샘플링해서 알파 체크
      const sampleSize = 40
      const data = ctx.getImageData(0, 0, width, height).data
      let transparent = 0
      let total = 0
      const stepX = Math.max(1, Math.floor(width / sampleSize))
      const stepY = Math.max(1, Math.floor(height / sampleSize))
      for (let y = 0; y < height; y += stepY) {
        for (let x = 0; x < width; x += stepX) {
          const idx = (y * width + x) * 4 + 3
          if (data[idx] < 40) transparent++
          total++
        }
      }
      if (total > 0 && transparent / total > CLEAR_THRESHOLD) {
        setIsCleared(true)
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      isDrawingRef.current = true
      wipeAt(e.clientX, e.clientY)
    }
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      wipeAt(e.clientX, e.clientY)
    }
    const handlePointerUp = () => {
      if (isDrawingRef.current) checkClearedRatio()
      isDrawingRef.current = false
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('resize', resizeAndDraw)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-cockpit-mint"
    >
      <img
        src="/media/spaceship-window-clear.png"
        alt="맑은 우주 창밖 풍경"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: isCleared ? 'default' : 'crosshair' }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-12 z-20 flex flex-col items-center gap-2 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          {storyTexts.wipe.title}
        </h2>
        <p className="text-white/90">{storyTexts.wipe.description}</p>
        {!isCleared && (
          <p className="mt-2 animate-pulse text-white/70 text-sm">{storyTexts.wipe.hint}</p>
        )}
      </div>
    </section>
  )
}
