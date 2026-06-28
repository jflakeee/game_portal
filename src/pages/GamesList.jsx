import { useState, useMemo } from 'react'
import { games, allTags } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import TagFilter from '../components/TagFilter.jsx'

export default function GamesList() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState(null)
  const filtered = useMemo(() => games.filter(g => {
    const matchQ = (g.title + g.tagline).toLowerCase().includes(q.toLowerCase())
    const matchTag = !tag || g.tags.includes(tag)
    return matchQ && matchTag
  }), [q, tag])

  return (
    <div className="page page--games">
      <h1>전체 게임</h1>
      <div className="games__controls">
        <SearchBar value={q} onChange={setQ} />
        <TagFilter tags={allTags()} active={tag} onSelect={setTag} />
      </div>
      <div className="games__grid">
        {filtered.map(g => <GameCard key={g.slug} game={g} />)}
        {filtered.length === 0 && <p className="empty">검색 결과가 없습니다.</p>}
      </div>
    </div>
  )
}
