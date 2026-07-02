import { useState } from 'react'
import { storyTexts } from '../data/storyTexts'
import type { useHandTracking } from '../hooks/useHandTracking'

interface BoardingGateProps {
  hand: ReturnType<typeof useHandTracking>
  onBoard: (nickname: string) => void
}

function handStatusText(hand: BoardingGateProps['hand']): string {
  switch (hand.status) {
    case 'idle':
      return storyTexts.boarding.handIdle
    case 'requesting':
      return storyTexts.boarding.handRequesting
    case 'loading':
      return storyTexts.boarding.handLoading
    case 'ready':
      return storyTexts.boarding.handReady
    case 'error':
      return hand.errorMessage ?? storyTexts.boarding.handError
    default:
      return storyTexts.boarding.handIdle
  }
}

// 첫 화면에서는 두 개의 가벼운 버튼만 보이고, "손 인식 준비하기"를 눌렀을 때만
// 닉네임/카메라 패널이 펼쳐진다 — 첫 화면 전체를 막는 설정창이 되지 않도록 하기 위함.
export default function BoardingGate({ hand, onBoard }: BoardingGateProps) {
  const [nickname, setNickname] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const showCameraPreview = hand.status === 'requesting' || hand.status === 'loading' || hand.status === 'ready'
  const isFallback = hand.status === 'error'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onBoard(nickname.trim())}
          className="rounded-full bg-cockpit-yellow px-7 py-3 text-sm font-bold text-[#3b2c76] shadow-lg transition hover:scale-105 active:scale-95"
        >
          {storyTexts.boarding.boardButton}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          {isOpen ? storyTexts.boarding.closeButton : storyTexts.boarding.prepareButton}
        </button>
      </div>

      {isOpen && (
        <div className="w-[min(88vw,360px)] rounded-3xl border border-white/25 bg-black/45 p-4 text-left text-white shadow-2xl backdrop-blur-md">
          <p className="text-xs leading-relaxed text-white/70">{storyTexts.boarding.description}</p>

          <label className="mt-3 flex flex-col gap-1.5 text-left">
            <span className="text-sm font-bold text-white/90">{storyTexts.boarding.nicknameLabel}</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={storyTexts.boarding.nicknamePlaceholder}
              maxLength={20}
              className="rounded-xl border-2 border-white/25 bg-white/10 px-4 py-2.5 text-base text-white outline-none transition placeholder:text-white/40 focus:border-cockpit-yellow"
            />
          </label>

          <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-3 text-center">
            {showCameraPreview && (
              <video
                ref={hand.videoRef}
                muted
                playsInline
                className="h-24 w-32 rounded-xl bg-black object-cover [transform:scaleX(-1)]"
              />
            )}
            <p className="text-sm font-bold text-white/90">{handStatusText(hand)}</p>
            {hand.status === 'idle' && (
              <button
                type="button"
                onClick={hand.start}
                className="rounded-full bg-cockpit-purple px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95"
              >
                {storyTexts.boarding.startButton}
              </button>
            )}
            {(hand.status === 'requesting' || hand.status === 'loading') && (
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-cockpit-yellow" />
            )}
          </div>

          <p className="mt-2 text-center text-[11px] text-white/60">
            {hand.status === 'ready'
              ? storyTexts.boarding.readyCompact
              : isFallback
                ? storyTexts.boarding.fallbackCompact
                : storyTexts.boarding.compactHint}
          </p>
        </div>
      )}
    </div>
  )
}
