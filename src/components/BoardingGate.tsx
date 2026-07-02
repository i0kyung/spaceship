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

export default function BoardingGate({ hand, onBoard }: BoardingGateProps) {
  const [nickname, setNickname] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const showCameraPreview = hand.status === 'requesting' || hand.status === 'loading' || hand.status === 'ready'
  const isFallback = hand.status === 'error'

  return (
    <div className="w-[min(100%,360px)] rounded-3xl border border-white/45 bg-white/88 p-4 text-left text-[#1e2a4a] shadow-2xl backdrop-blur-md md:p-5">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-cockpit-purple">
            {storyTexts.boarding.kicker}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#26305f]">{storyTexts.boarding.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{storyTexts.boarding.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onBoard(nickname.trim())}
            className="rounded-full bg-cockpit-yellow px-4 py-3 text-sm font-bold text-[#3b2c76] shadow-md transition hover:scale-[1.03] active:scale-95"
          >
            {storyTexts.boarding.boardButton}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="rounded-full bg-[#3b2c76] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.03] active:scale-95"
          >
            {isOpen ? storyTexts.boarding.closeButton : storyTexts.boarding.prepareButton}
          </button>
        </div>

        <div className="rounded-2xl bg-white/60 px-3 py-2 text-center text-xs text-slate-600">
          {hand.status === 'ready'
            ? storyTexts.boarding.readyCompact
            : isFallback
              ? storyTexts.boarding.fallbackCompact
              : storyTexts.boarding.compactHint}
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-4 border-t border-[#26305f]/10 pt-4">
        <label className="flex flex-col gap-1.5 text-left">
          <span className="text-sm font-bold text-slate-700">{storyTexts.boarding.nicknameLabel}</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={storyTexts.boarding.nicknamePlaceholder}
            maxLength={20}
            className="rounded-xl border-2 border-cockpit-purple/30 px-4 py-3 text-base outline-none transition focus:border-cockpit-purple"
          />
        </label>

        <div className="flex flex-col items-center gap-3 rounded-2xl bg-cockpit-mint/45 p-4 text-center">
          {showCameraPreview && (
            <video
              ref={hand.videoRef}
              muted
              playsInline
              className="h-28 w-36 rounded-xl bg-black object-cover [transform:scaleX(-1)]"
            />
          )}
          <p className="text-sm font-bold text-slate-700">{handStatusText(hand)}</p>
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
            <span className="h-6 w-6 animate-spin rounded-full border-4 border-cockpit-purple/30 border-t-cockpit-purple" />
          )}
        </div>
      </div>
      )}
    </div>
  )
}
