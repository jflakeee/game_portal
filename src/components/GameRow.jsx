import GameCard from './GameCard.jsx'
export default function GameRow({ title, games }) {
  if (!games?.length) return null
  return (
    <section className="game-row">
      <h2 className="game-row__title">{title}</h2>
      <div className="game-row__track">
        {games.map(g => <GameCard key={g.slug} game={g} />)}
      </div>
    </section>
  )
}
