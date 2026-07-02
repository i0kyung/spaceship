import { useState } from 'react'
import { storyTexts } from '../data/storyTexts'
import { mediaUrl } from '../lib/media'
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

  const showCameraPreview = hand.status === 'requesting' || hand.status === 'loading' || hand.status === 'ready'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b1030] px-4 py-10">
      <img
        src={mediaUrl('spaceship-window-clear.png')}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white/95 p-6 shadow-2xl md:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cockpit-purple md:text-3xl">
            {storyTexts.boarding.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{storyTexts.boarding.description}</p>
        </div>

        <label className="flex flex-col gap-1.5 text-left">
          <span className="text-sm font-bold text-gray-700">{storyTexts.boarding.nicknameLabel}</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={storyTexts.boarding.nicknamePlaceholder}
            maxLength={20}
            className="rounded-xl border-2 border-cockpit-purple/30 px-4 py-3 text-base outline-none transition focus:border-cockpit-purple"
          />
        </label>

        <div className="flex flex-col items-center gap-3 rounded-2xl bg-cockpit-mint/40 p-4 text-center">
          {showCameraPreview && (
            <video
              ref={hand.videoRef}
              muted
              playsInline
              className="h-28 w-36 rounded-xl bg-black object-cover [transform:scaleX(-1)]"
            />
          )}
          <p className="text-sm font-bold text-gray-700">{handStatusText(hand)}</p>
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

        <button
          type="button"
          onClick={() => onBoard(nickname.trim())}
          className="rounded-full bg-cockpit-yellow px-6 py-3 text-lg font-bold text-cockpit-purple shadow-md transition hover:scale-105 active:scale-95"
        >
          {storyTexts.boarding.boardButton} →
        </button>
      </div>
    </div>
  )
}
