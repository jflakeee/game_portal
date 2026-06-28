import { Link } from 'react-router-dom'
import { games, getGameBySlug, allTags, getGamesByTag } from '../data/games.js'
import { getRecentlyPlayed, getBestScore, getFavorites } from '../store/playerStore.js'

export default function Stats() {
  const recent = getRecentlyPlayed().map(getGameBySlug).filter(Boolean)
  const favs = getFavorites()
  const scored = games.map(g => ({ g, best: getBestScore(g.slug) })).filter(x => x.best > 0)
  const hasData = recent.length || favs.length || scored.length

  return (
    <div className="page page--stats">
      <h1>내 기록</h1>
      {!hasData && <p className="empty">아직 기록이 없습니다. 게임을 플레이해 보세요!</p>}

      {scored.length > 0 && (
        <section>
          <h2>개인 최고점</h2>
          <ul className="stats__scores">
            {scored.map(({ g, best }) => (
              <li key={g.slug}><Link to={`/game/${g.slug}`}>{g.title}</Link> <strong>{best}</strong></li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2>최근 플레이</h2>
          <ul>{recent.map(g => <li key={g.slug}><Link to={`/game/${g.slug}`}>{g.title}</Link></li>)}</ul>
        </section>
      )}

      <section>
        <h2>카탈로그 통계</h2>
        <p>총 {games.length}개 게임</p>
        <ul className="stats__tags">
          {allTags().map(t => <li key={t}>{t}: {getGamesByTag(t).length}개</li>)}
        </ul>
      </section>
    </div>
  )
}
