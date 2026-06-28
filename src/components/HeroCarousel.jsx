import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HeroCarousel({ games }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (games.length < 2) return
    const id = setInterval(() => setI(p => (p + 1) % games.length), 5000)
    return () => clearInterval(id)
  }, [games.length])
  if (!games.length) return null
  const g = games[i]
  return (
    <section className="hero" aria-roledescription="carousel">
      <img className="hero__bg" src={g.thumbnail} alt="" />
      <div className="hero__content">
        <h1>{g.title}</h1>
        <p>{g.tagline}</p>
        <Link to={`/play/${g.slug}`} className="btn btn--primary btn--lg">▶ 지금 플레이</Link>
      </div>
      <div className="hero__dots">
        {games.map((_, k) => (
          <button key={k} aria-label={`슬라이드 ${k + 1}`}
            className={k === i ? 'dot dot--active' : 'dot'} onClick={() => setI(k)} />
        ))}
      </div>
    </section>
  )
}
