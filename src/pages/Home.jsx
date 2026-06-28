import { games, getGameBySlug } from '../data/games.js'
import { getRecentlyPlayed } from '../store/playerStore.js'
import HeroCarousel from '../components/HeroCarousel.jsx'
import GameRow from '../components/GameRow.jsx'
import RankingList from '../components/RankingList.jsx'
import AdSlot from '../ads/AdSlot.jsx'

export default function Home() {
  const featured = games.filter(g => g.featured)
  const recent = getRecentlyPlayed().map(getGameBySlug).filter(Boolean)
  const newGames = [...games].sort((a, b) => b.year - a.year)

  return (
    <div className="page page--home">
      <HeroCarousel games={featured} />
      {recent.length > 0 && <GameRow title="이어하기" games={recent} />}
      <GameRow title="인기 게임" games={games} />
      <GameRow title="신규 게임" games={newGames} />
      <div className="home__ad"><AdSlot variant="persistent-banner" /></div>
      <section className="home__ranking">
        <h2>랭킹</h2>
        <RankingList games={games} />
      </section>
    </div>
  )
}
