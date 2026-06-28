import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameBySlug } from '../data/games.js'
import { toggleFavorite, isFavorite } from '../store/playerStore.js'
import AdSlot from '../ads/AdSlot.jsx'

export default function GameDetail() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)
  const [fav, setFav] = useState(() => game ? isFavorite(slug) : false)
  if (!game) return <div className="page"><p>게임을 찾을 수 없습니다.</p><Link to="/games">전체 게임으로</Link></div>

  return (
    <div className="page page--detail">
      <div className="detail__media">
        <img src={game.screenshots[0]} alt={game.title} />
      </div>
      <div className="detail__info">
        <h1>{game.title}</h1>
        <p className="detail__tagline">{game.tagline}</p>
        <div className="detail__tags">{game.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        <p>{game.description}</p>
        <h3>조작법</h3>
        <p>{game.controls}</p>
        <p className="detail__meta">{game.tech} · {game.year}</p>
        <div className="detail__actions">
          <Link to={`/play/${game.slug}`} className="btn btn--primary btn--lg">▶ 플레이</Link>
          <button className="btn btn--ghost" aria-pressed={fav}
            onClick={() => setFav(toggleFavorite(slug))}>
            {fav ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
          </button>
        </div>
        <AdSlot variant="detail-rectangle" />
      </div>
    </div>
  )
}
