import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import GamesList from './pages/GamesList.jsx'
import GameDetail from './pages/GameDetail.jsx'
import Play from './pages/Play.jsx'
import Stats from './pages/Stats.jsx'
import About from './pages/About.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/play/:slug" element={<Play />} />
      <Route path="*" element={<Shell />} />
    </Routes>
  )
}

function Shell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<GamesList />} />
          <Route path="/game/:slug" element={<GameDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
