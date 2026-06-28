import { useState } from 'react'

export default function GameFrame({ src, title }) {
  const [started, setStarted] = useState(false)
  return (
    <div className="game-frame">
      {!started && (
        <button className="game-frame__start btn btn--primary btn--lg"
          onClick={() => setStarted(true)}>▶ 게임 시작</button>
      )}
      <iframe
        title={title}
        className="game-frame__iframe"
        src={started ? src : 'about:blank'}
        allow="autoplay; screen-wake-lock; fullscreen"
        style={{ touchAction: 'none', border: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
