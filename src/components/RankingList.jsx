import { Link } from 'react-router-dom'
export default function RankingList({ games }) {
  return (
    <ol className="ranking-list">
      {games.map((g, i) => (
        <li key={g.slug} className="ranking-list__item">
          <span className="ranking-list__rank">{i + 1}</span>
          <Link to={`/game/${g.slug}`}>{g.title}</Link>
          <span className="ranking-list__genre">{g.genre}</span>
        </li>
      ))}
    </ol>
  )
}
