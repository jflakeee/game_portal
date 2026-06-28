import { Link, NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: '홈', end: true },
  { to: '/games', label: '전체 게임' },
  { to: '/stats', label: '내 기록' },
  { to: '/about', label: '소개' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">🎮 GAME PORTAL</Link>
      <nav className="navbar__links">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => isActive ? 'active' : undefined}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
