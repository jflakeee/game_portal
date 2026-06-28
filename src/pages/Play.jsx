import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameBySlug } from '../data/games.js'
import { recordPlay, recordScore } from '../store/playerStore.js'
import { canShowInterstitial } from '../ads/adPolicy.js'
import { parseGameMessage } from '../play/gameBridge.js'
import GameFrame from '../components/GameFrame.jsx'
import PlayLayout from '../components/PlayLayout.jsx'
import Interstitial from '../components/Interstitial.jsx'

export default function Play() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)
  const sessionStartRef = useRef(Date.now())
  const lastAdRef = useRef(null)
  const [interstitial, setInterstitial] = useState(false)

  useEffect(() => { if (game) recordPlay(slug) }, [slug, game])

  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== window.location.origin) return
      const msg = parseGameMessage(e.data)
      if (!msg) return
      if (msg.type === 'score') recordScore(slug, msg.value)
      if (msg.type === 'gameover') {
        const now = Date.now()
        if (canShowInterstitial({ sessionStartMs: sessionStartRef.current, lastAdMs: lastAdRef.current, nowMs: now })) {
          lastAdRef.current = now
          setInterstitial(true)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [slug])

  if (!game) return <div className="page"><p>게임을 찾을 수 없습니다.</p><Link to="/games">전체 게임으로</Link></div>

  return (
    <div className="play-page">
      <div className="play-page__bar">
        <Link to={`/game/${slug}`} className="btn btn--ghost">← 나가기</Link>
        <span>{game.title}</span>
      </div>
      <PlayLayout>
        <GameFrame key={slug} src={game.playPath} title={game.title} />
      </PlayLayout>
      {interstitial && <Interstitial onContinue={() => setInterstitial(false)} />}
    </div>
  )
}
