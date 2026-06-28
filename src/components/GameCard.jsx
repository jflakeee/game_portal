import { Link } from 'react-router-dom'

export default function GameCard({ game }) {
  return (
    <article className="game-card">
      <Link to={`/game/${game.slug}`} className="game-card__thumb" aria-label={game.title}>
        <img src={game.thumbnail} alt={game.title} loading="lazy" />
      </Link>
      <div className="game-card__body">
        <h3>{game.title}</h3>
        <p className="game-card__tagline">{game.tagline}</p>
        <div className="game-card__tags">
          {game.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <div className="game-card__actions">
          <Link to={`/game/${game.slug}`} className="btn btn--ghost">상세</Link>
          <Link to={`/play/${game.slug}`} className="btn btn--primary">▶ 플레이</Link>
        </div>
      </div>
    </article>
  )
}
