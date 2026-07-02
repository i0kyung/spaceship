import { useCallback, useEffect, useRef, useState } from 'react'

// MediaPipe Hands는 npm 설치 없이 CDN 스크립트로 런타임 로드합니다 (번들에 포함되지 않음).
// 카메라 권한 거부, 스크립트 로드 실패, 일정 시간 내 손 미검출 시 자동으로 'error' 상태가 되어
// 호출부에서 마우스 모드로 폴백할 수 있습니다.
const MEDIAPIPE_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
const DETECT_TIMEOUT_MS = 9000

export type HandTrackingStatus = 'idle' | 'requesting' | 'loading' | 'ready' | 'error'

export interface HandPoint {
  x: number // 0~1, 카메라 좌우 반전 보정 완료 (사용자가 보는 화면 기준)
  y: number // 0~1
}

interface HandsInstance {
  setOptions: (opts: Record<string, unknown>) => void
  onResults: (cb: (results: HandsResults) => void) => void
  send: (opts: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

interface HandsResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number }>>
}

declare global {
  interface Window {
    Hands?: new (config: { locateFile: (file: string) => string }) => HandsInstance
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`손 인식 모듈을 불러오지 못했습니다: ${src}`))
    document.head.appendChild(script)
  })
}

export function useHandTracking() {
  const [status, setStatus] = useState<HandTrackingStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [point, setPoint] = useState<HandPoint | null>(null)
  const [isHandVisible, setIsHandVisible] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const handsRef = useRef<HandsInstance | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasDetectedOnceRef = useRef(false)
  const startedRef = useRef(false)

  const fail = useCallback((message: string) => {
    setStatus('error')
    setErrorMessage(message)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    if (handsRef.current) {
      handsRef.current.close()
      handsRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (!navigator.mediaDevices?.getUserMedia) {
      fail('이 브라우저는 카메라를 지원하지 않아 마우스 닦기 모드로 전환했어요.')
      return
    }

    setStatus('requesting')

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 480, height: 360 },
          audio: false,
        })
        streamRef.current = stream
        const video = videoRef.current
        if (!video) throw new Error('camera video element missing')
        video.srcObject = stream
        await video.play()

        setStatus('loading')
        await loadScript(`${MEDIAPIPE_BASE}/hands.js`)
        if (!window.Hands) throw new Error('MediaPipe Hands 전역 객체를 찾을 수 없습니다.')

        const hands = new window.Hands({
          locateFile: (file) => `${MEDIAPIPE_BASE}/${file}`,
        })
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        })
        hands.onResults((results) => {
          const landmarks = results.multiHandLandmarks?.[0]
          if (landmarks && landmarks[8]) {
            const tip = landmarks[8] // 검지 손가락 끝
            // 셀피 카메라는 좌우가 반전되어 있으므로 x를 뒤집어 사용자가 보는 화면과 맞춘다.
            setPoint({ x: 1 - tip.x, y: tip.y })
            setIsHandVisible(true)
            if (!hasDetectedOnceRef.current) {
              hasDetectedOnceRef.current = true
              setStatus('ready')
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
            }
          } else {
            setIsHandVisible(false)
          }
        })
        handsRef.current = hands

        timeoutRef.current = setTimeout(() => {
          if (!hasDetectedOnceRef.current) {
            fail('카메라를 사용할 수 없어 마우스 닦기 모드로 전환했어요.')
          }
        }, DETECT_TIMEOUT_MS)

        const detectFrame = async () => {
          if (video.readyState >= 2 && handsRef.current) {
            try {
              await handsRef.current.send({ image: video })
            } catch {
              // 개별 프레임 추론 실패는 무시하고 다음 프레임을 시도한다.
            }
          }
          rafRef.current = requestAnimationFrame(detectFrame)
        }
        rafRef.current = requestAnimationFrame(detectFrame)
      } catch (err) {
        fail('카메라를 사용할 수 없어 마우스 닦기 모드로 전환했어요.')
        void err
      }
    })()
  }, [fail])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (handsRef.current) handsRef.current.close()
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return { status, errorMessage, point, isHandVisible, start, videoRef }
}
