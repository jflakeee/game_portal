import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameBySlug } from '../data/games.js'
import { recordPlay } from '../store/playerStore.js'
import GameFrame from '../components/GameFrame.jsx'
import PlayLayout from '../components/PlayLayout.jsx'

export default function Play() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)
  useEffect(() => { if (game) recordPlay(slug) }, [slug, game])
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
    </div>
  )
}
