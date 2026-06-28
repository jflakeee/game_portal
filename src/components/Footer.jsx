import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 Game Portal · 자체 제작 게임 모음</p>
      <nav>
        <Link to="/about">소개 · 광고 약속</Link>
      </nav>
    </footer>
  )
}
