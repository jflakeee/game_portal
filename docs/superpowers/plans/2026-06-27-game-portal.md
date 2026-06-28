# 게임 포털 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 자체 제작 게임 3종(Hexa Merge, Sudoku, Number Drop)을 모아 소개·즉시 플레이시키는 React + Vite 정적 웹 게임 포털을 구축한다.

**Architecture:** 무백엔드 정적 SPA. 게임 정보는 단일 레지스트리(`src/data/games.js`)로 데이터 주도. 개인 상태(최근 플레이·즐겨찾기·최고점)는 LocalStorage. 게임은 `public/games/<slug>/`에 복사해 iframe(`src="about:blank"`→클릭 시 주입)으로 격리 임베드. 광고는 모토를 코드화한 `AdPolicy` 레이어(상시 배너 / break-point 인터스티셜 / opt-in 보상형)로 추상화하며 지금은 라벨된 플레이스홀더.

**Tech Stack:** React 18, Vite 5, react-router-dom 6 (HashRouter), Vitest + @testing-library/react + jsdom, 순수 CSS(다크 테마).

**Spec:** `docs/superpowers/specs/2026-06-27-game-portal-design.md`

---

## 파일 구조

```
game_portal/
├─ index.html                      # Vite 진입
├─ vite.config.js                  # base:'./', vitest 설정
├─ package.json
├─ scripts/sync-games.mjs          # 게임 빌드 → public/games/<slug> 복사
├─ public/
│  ├─ games/<slug>/...             # 복사된 게임 빌드 (sync 스크립트 생성)
│  └─ thumbs/<slug>.png            # 썸네일 (수동/복사)
└─ src/
   ├─ main.jsx                     # ReactDOM + HashRouter
   ├─ App.jsx                      # 라우트 정의 + 공통 레이아웃
   ├─ data/games.js                # 게임 레지스트리 + 셀렉터
   ├─ store/playerStore.js         # LocalStorage 상태 훅
   ├─ ads/adPolicy.js              # 광고 정책 로직(순수 함수)
   ├─ ads/AdSlot.jsx               # 광고 플레이스홀더 컴포넌트
   ├─ components/
   │  ├─ Navbar.jsx  Footer.jsx
   │  ├─ GameCard.jsx  GameRow.jsx
   │  ├─ HeroCarousel.jsx  RankingList.jsx
   │  ├─ TagFilter.jsx  SearchBar.jsx
   │  ├─ GameFrame.jsx  PlayLayout.jsx
   └─ pages/
      ├─ Home.jsx  GamesList.jsx  GameDetail.jsx
      ├─ Play.jsx  Stats.jsx  About.jsx
```

---

## Task 1: 프로젝트 스캐폴드 + 테스트 인프라

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/setupTests.js`, `.gitignore`

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "game-portal",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "sync-games": "node scripts/sync-games.mjs"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: vite.config.js 작성**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 3: 진입 파일들 작성**

`index.html`:
```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>게임 포털</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`src/setupTests.js`:
```js
import '@testing-library/jest-dom'
```

`src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
```

`src/App.jsx` (라우트는 Task 7에서 채움 — 우선 최소):
```jsx
export default function App() {
  return <div>게임 포털</div>
}
```

`src/styles.css`:
```css
:root { color-scheme: dark; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Pretendard', system-ui, sans-serif; background: #0f1117; color: #e8eaed; }
```

`.gitignore`:
```
node_modules
dist
public/games
```

- [ ] **Step 4: 설치 및 빌드 검증**

Run: `npm install && npm run build`
Expected: `dist/` 생성, 에러 없음.

- [ ] **Step 5: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold vite react portal with vitest"
```

> 참고: 디렉터리가 아직 git 저장소가 아니면 `git init` 포함. 이미 저장소면 `git init` 생략.

---

## Task 2: 게임 빌드 동기화 스크립트

게임 3종의 정적 빌드를 `public/games/<slug>/`로 복사한다. 빌드 산출물이라 git에는 올리지 않고(.gitignore) 배포 전 생성한다.

**Files:**
- Create: `scripts/sync-games.mjs`

- [ ] **Step 1: 복사 스크립트 작성**

```js
// scripts/sync-games.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'public', 'games')

const SOURCES = [
  { slug: 'hexa-merge',  src: 'D:/htdocs/hexa_merge/hexa_merge_web' },
  { slug: 'sudoku',      src: 'D:/htdocs/sudoku/sudoku_clone/src' },
  { slug: 'number-drop', src: 'D:/htdocs/drop_merge/number_drop/frontend/dist' },
]

await rm(dest, { recursive: true, force: true })
await mkdir(dest, { recursive: true })

for (const { slug, src } of SOURCES) {
  if (!existsSync(src)) {
    console.error(`[sync-games] MISSING source: ${src}`)
    process.exitCode = 1
    continue
  }
  await cp(src, join(dest, slug), { recursive: true })
  console.log(`[sync-games] ${slug} <- ${src}`)
}
console.log('[sync-games] done')
```

- [ ] **Step 2: 실행 및 검증**

Run: `npm run sync-games`
Expected 출력:
```
[sync-games] hexa-merge <- D:/htdocs/hexa_merge/hexa_merge_web
[sync-games] sudoku <- D:/htdocs/sudoku/sudoku_clone/src
[sync-games] number-drop <- D:/htdocs/drop_merge/number_drop/frontend/dist
[sync-games] done
```

- [ ] **Step 3: 복사 확인**

Run: `node -e "console.log(require('fs').existsSync('public/games/hexa-merge/index.html'), require('fs').existsSync('public/games/sudoku/index.html'), require('fs').existsSync('public/games/number-drop/index.html'))"`
Expected: `true true true`

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-games.mjs
git commit -m "feat: add game build sync script"
```

---

## Task 3: 게임 레지스트리 + 셀렉터 (TDD)

**Files:**
- Create: `src/data/games.js`
- Test: `src/data/games.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

```js
// src/data/games.test.js
import { describe, it, expect } from 'vitest'
import { games, getGameBySlug, getGamesByTag, allTags } from './games.js'

describe('games registry', () => {
  it('3종 게임을 가진다', () => {
    expect(games).toHaveLength(3)
    expect(games.map(g => g.slug).sort()).toEqual(['hexa-merge', 'number-drop', 'sudoku'])
  })
  it('각 게임은 필수 필드를 가진다', () => {
    for (const g of games) {
      expect(g.slug).toBeTruthy()
      expect(g.title).toBeTruthy()
      expect(g.playPath).toMatch(/^games\/.+\/index\.html$/)
      expect(Array.isArray(g.tags)).toBe(true)
    }
  })
  it('getGameBySlug는 slug로 게임을 찾는다', () => {
    expect(getGameBySlug('sudoku').title).toBe('Sudoku')
    expect(getGameBySlug('none')).toBeUndefined()
  })
  it('getGamesByTag는 태그로 필터한다', () => {
    expect(getGamesByTag('퍼즐').length).toBeGreaterThanOrEqual(2)
  })
  it('allTags는 중복 없는 태그 목록을 반환한다', () => {
    const t = allTags()
    expect(new Set(t).size).toBe(t.length)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/data/games.test.js`
Expected: FAIL (`Cannot find module './games.js'`)

- [ ] **Step 3: 레지스트리 구현**

```js
// src/data/games.js
export const games = [
  {
    slug: 'hexa-merge',
    title: 'Hexa Merge',
    tagline: '육각 블록을 합쳐 점수를 올리는 머지 퍼즐',
    description: '같은 숫자의 육각 타일을 인접 배치해 합치는 캐주얼 머지 퍼즐. 한 손으로 즐기는 직관적 조작.',
    tags: ['퍼즐', '머지', '캐주얼'],
    genre: '퍼즐',
    tech: 'Unity WebGL',
    thumbnail: 'thumbs/hexa-merge.png',
    screenshots: ['thumbs/hexa-merge.png'],
    playPath: 'games/hexa-merge/index.html',
    controls: '드래그하여 타일 배치, 같은 숫자를 합치세요.',
    year: 2026,
    featured: true,
  },
  {
    slug: 'sudoku',
    title: 'Sudoku',
    tagline: '클래식 스도쿠, 가볍게 즐기는 로직 퍼즐',
    description: '9x9 격자를 논리로 채우는 정통 스도쿠. PWA로 오프라인에서도 동작.',
    tags: ['퍼즐', '로직', '클래식'],
    genre: '퍼즐',
    tech: 'JavaScript PWA',
    thumbnail: 'thumbs/sudoku.png',
    screenshots: ['thumbs/sudoku.png'],
    playPath: 'games/sudoku/index.html',
    controls: '칸을 선택하고 숫자를 입력하세요.',
    year: 2026,
    featured: true,
  },
  {
    slug: 'number-drop',
    title: 'Number Drop',
    tagline: '숫자를 떨어뜨려 합치는 드롭 머지',
    description: '떨어지는 숫자 블록을 같은 값끼리 합쳐 더 큰 수를 만드는 캐주얼 아케이드.',
    tags: ['캐주얼', '머지', '아케이드'],
    genre: '캐주얼',
    tech: 'Vite Web',
    thumbnail: 'thumbs/number-drop.png',
    screenshots: ['thumbs/number-drop.png'],
    playPath: 'games/number-drop/index.html',
    controls: '좌우로 이동, 같은 숫자를 떨어뜨려 합치세요.',
    year: 2026,
    featured: false,
  },
]

export function getGameBySlug(slug) {
  return games.find(g => g.slug === slug)
}

export function getGamesByTag(tag) {
  return games.filter(g => g.tags.includes(tag))
}

export function allTags() {
  return [...new Set(games.flatMap(g => g.tags))]
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/data/games.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: 썸네일 준비**

Number Drop은 기존 스크린샷을 썸네일로 복사, 나머지는 임시로 동일 적용(추후 교체).
Run:
```bash
mkdir -p public/thumbs
cp "D:/htdocs/drop_merge/number_drop/game_screen.png" public/thumbs/number-drop.png
cp "D:/htdocs/hexa_merge/hexa_merge_web/res/benchmark_hex_zoom.png" public/thumbs/hexa-merge.png
node -e "require('fs').copyFileSync('public/thumbs/number-drop.png','public/thumbs/sudoku.png')"
```
Expected: `public/thumbs/`에 3개 png. (sudoku 썸네일은 추후 실제 스크린샷으로 교체 — 자산은 별도 리소스 사용 예정)

- [ ] **Step 6: Commit**

```bash
git add src/data/games.js src/data/games.test.js public/thumbs
git commit -m "feat: add game registry with selectors and thumbnails"
```

---

## Task 4: 플레이어 상태 스토어 (LocalStorage, TDD)

최근 플레이·즐겨찾기·개인 최고점을 LocalStorage에 저장하는 순수 모듈 + React 훅.

**Files:**
- Create: `src/store/playerStore.js`
- Test: `src/store/playerStore.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

```js
// src/store/playerStore.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordPlay, getRecentlyPlayed,
  toggleFavorite, isFavorite, getFavorites,
  recordScore, getBestScore,
} from './playerStore.js'

beforeEach(() => localStorage.clear())

describe('playerStore', () => {
  it('최근 플레이는 최신순, 중복 제거, 최대 10개', () => {
    recordPlay('a'); recordPlay('b'); recordPlay('a')
    expect(getRecentlyPlayed()).toEqual(['a', 'b'])
    for (let i = 0; i < 12; i++) recordPlay('g' + i)
    expect(getRecentlyPlayed()).toHaveLength(10)
    expect(getRecentlyPlayed()[0]).toBe('g11')
  })
  it('즐겨찾기 토글', () => {
    expect(isFavorite('sudoku')).toBe(false)
    toggleFavorite('sudoku')
    expect(isFavorite('sudoku')).toBe(true)
    expect(getFavorites()).toContain('sudoku')
    toggleFavorite('sudoku')
    expect(isFavorite('sudoku')).toBe(false)
  })
  it('최고점은 더 높은 값만 갱신', () => {
    recordScore('hexa-merge', 100)
    recordScore('hexa-merge', 50)
    expect(getBestScore('hexa-merge')).toBe(100)
    recordScore('hexa-merge', 200)
    expect(getBestScore('hexa-merge')).toBe(200)
    expect(getBestScore('none')).toBe(0)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/store/playerStore.test.js`
Expected: FAIL (`Cannot find module`)

- [ ] **Step 3: 스토어 구현**

```js
// src/store/playerStore.js
const KEYS = { recent: 'gp.recent', fav: 'gp.fav', best: 'gp.best' }
const MAX_RECENT = 10

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function recordPlay(slug) {
  const next = [slug, ...read(KEYS.recent, []).filter(s => s !== slug)].slice(0, MAX_RECENT)
  write(KEYS.recent, next)
}
export function getRecentlyPlayed() { return read(KEYS.recent, []) }

export function toggleFavorite(slug) {
  const cur = read(KEYS.fav, [])
  const next = cur.includes(slug) ? cur.filter(s => s !== slug) : [...cur, slug]
  write(KEYS.fav, next)
  return next.includes(slug)
}
export function isFavorite(slug) { return read(KEYS.fav, []).includes(slug) }
export function getFavorites() { return read(KEYS.fav, []) }

export function recordScore(slug, score) {
  const best = read(KEYS.best, {})
  if (score > (best[slug] ?? 0)) { best[slug] = score; write(KEYS.best, best) }
}
export function getBestScore(slug) { return read(KEYS.best, {})[slug] ?? 0 }
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/store/playerStore.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/store/playerStore.js src/store/playerStore.test.js
git commit -m "feat: add localStorage player store (recent/favorites/best score)"
```

---

## Task 5: 광고 정책 로직 (TDD)

모토를 코드화: 첫 광고 지연, 쿨다운, 빈도캡. 순수 함수로 구현해 테스트 가능하게.

**Files:**
- Create: `src/ads/adPolicy.js`
- Test: `src/ads/adPolicy.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

```js
// src/ads/adPolicy.test.js
import { describe, it, expect } from 'vitest'
import { canShowInterstitial, AD_CONFIG } from './adPolicy.js'

const base = { sessionStartMs: 0, lastAdMs: null }

describe('canShowInterstitial', () => {
  it('세션 첫 N초 동안은 광고 금지', () => {
    expect(canShowInterstitial({ ...base, nowMs: AD_CONFIG.firstAdDelayMs - 1 })).toBe(false)
    expect(canShowInterstitial({ ...base, nowMs: AD_CONFIG.firstAdDelayMs + 1 })).toBe(true)
  })
  it('쿨다운 내 재요청은 거부', () => {
    const now = AD_CONFIG.firstAdDelayMs + 10_000
    expect(canShowInterstitial({ sessionStartMs: 0, lastAdMs: now - (AD_CONFIG.cooldownMs - 1), nowMs: now })).toBe(false)
    expect(canShowInterstitial({ sessionStartMs: 0, lastAdMs: now - (AD_CONFIG.cooldownMs + 1), nowMs: now })).toBe(true)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/ads/adPolicy.test.js`
Expected: FAIL (`Cannot find module`)

- [ ] **Step 3: 구현**

```js
// src/ads/adPolicy.js
// 시장조사 근거: 인터스티셜 120~240초 간격, 오프닝 수 초 금지 (Playgama/CrazyGames/Poki)
export const AD_CONFIG = {
  firstAdDelayMs: 60_000,   // 세션 시작 후 60초 전 광고 금지
  cooldownMs: 180_000,      // 인터스티셜 간 최소 3분
}

export function canShowInterstitial({ sessionStartMs, lastAdMs, nowMs }) {
  if (nowMs - sessionStartMs < AD_CONFIG.firstAdDelayMs) return false
  if (lastAdMs != null && nowMs - lastAdMs < AD_CONFIG.cooldownMs) return false
  return true
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/ads/adPolicy.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/ads/adPolicy.js src/ads/adPolicy.test.js
git commit -m "feat: add ad policy logic (first-ad delay + cooldown)"
```

---

## Task 6: AdSlot 컴포넌트 (플레이스홀더)

예측 가능한 고정 크기·"광고" 라벨·CLS 0. 벤더 중립. 추후 Google GPT/H5 연동 지점.

**Files:**
- Create: `src/ads/AdSlot.jsx`
- Test: `src/ads/AdSlot.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/ads/AdSlot.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdSlot from './AdSlot.jsx'

describe('AdSlot', () => {
  it('"광고" 라벨과 고정 크기를 렌더한다', () => {
    render(<AdSlot variant="persistent-banner" />)
    const slot = screen.getByRole('complementary', { name: /광고/ })
    expect(slot).toBeInTheDocument()
    expect(slot).toHaveStyle({ height: '90px' })
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/ads/AdSlot.test.jsx`
Expected: FAIL (`Cannot find module`)

- [ ] **Step 3: 구현**

```jsx
// src/ads/AdSlot.jsx
const SIZES = {
  'persistent-banner': { width: '100%', height: '90px' }, // 728x90 / 320x50 반응형은 CSS에서
  'detail-rectangle': { width: '300px', height: '250px' },
}

export default function AdSlot({ variant = 'persistent-banner' }) {
  const size = SIZES[variant] ?? SIZES['persistent-banner']
  return (
    <aside
      aria-label="광고"
      className={`ad-slot ad-slot--${variant}`}
      style={{ ...size, display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: '#161922', border: '1px solid #262b38', color: '#5b6472', fontSize: 12 }}
    >
      광고
    </aside>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/ads/AdSlot.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ads/AdSlot.jsx src/ads/AdSlot.test.jsx
git commit -m "feat: add AdSlot placeholder component"
```

---

## Task 7: 레이아웃(Navbar/Footer) + 라우팅

**Files:**
- Create: `src/components/Navbar.jsx`, `src/components/Footer.jsx`
- Modify: `src/App.jsx`
- Test: `src/components/Navbar.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/components/Navbar.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar.jsx'

describe('Navbar', () => {
  it('주요 네비 링크를 렌더한다', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '전체 게임' })).toHaveAttribute('href', '/games')
    expect(screen.getByRole('link', { name: '내 기록' })).toHaveAttribute('href', '/stats')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/components/Navbar.test.jsx`
Expected: FAIL

- [ ] **Step 3: Navbar/Footer 구현**

```jsx
// src/components/Navbar.jsx
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
```

```jsx
// src/components/Footer.jsx
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
```

- [ ] **Step 4: App.jsx 라우팅으로 교체**

```jsx
// src/App.jsx
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
```

> Play는 풀스크린이라 Shell(Navbar/Footer) 밖에 둔다.

- [ ] **Step 5: 페이지 스텁 생성 (빌드용 임시)**

각 페이지 파일을 최소 스텁으로 생성 (다음 태스크에서 채움):
```jsx
// src/pages/Home.jsx (그리고 GamesList, GameDetail, Play, Stats, About 동일 패턴)
export default function Home() { return <div>Home</div> }
```
GamesList/GameDetail/Play/Stats/About도 각 컴포넌트명으로 동일하게 생성.

- [ ] **Step 6: 테스트 + 빌드 검증**

Run: `npx vitest run src/components/Navbar.test.jsx && npm run build`
Expected: 테스트 PASS, 빌드 성공.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/Navbar.jsx src/components/Footer.jsx src/components/Navbar.test.jsx src/pages
git commit -m "feat: add layout (navbar/footer) and routing with page stubs"
```

---

## Task 8: GameCard + GameRow + 발견 컴포넌트 (TDD)

**Files:**
- Create: `src/components/GameCard.jsx`, `src/components/GameRow.jsx`, `src/components/SearchBar.jsx`, `src/components/TagFilter.jsx`
- Test: `src/components/GameCard.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/components/GameCard.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GameCard from './GameCard.jsx'

const game = {
  slug: 'sudoku', title: 'Sudoku', tagline: '로직 퍼즐',
  tags: ['퍼즐'], thumbnail: 'thumbs/sudoku.png',
}

describe('GameCard', () => {
  it('제목/태그라인과 상세 링크, Play 링크를 렌더한다', () => {
    render(<MemoryRouter><GameCard game={game} /></MemoryRouter>)
    expect(screen.getByText('Sudoku')).toBeInTheDocument()
    expect(screen.getByText('로직 퍼즐')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /상세/ })).toHaveAttribute('href', '/game/sudoku')
    expect(screen.getByRole('link', { name: /플레이/ })).toHaveAttribute('href', '/play/sudoku')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/components/GameCard.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
// src/components/GameCard.jsx
import { Link } from 'react-router-dom'

export default function GameCard({ game }) {
  return (
    <article className="game-card">
      <Link to={`/game/${game.slug}`} className="game-card__thumb" aria-label={`${game.title} 상세`}>
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
```

```jsx
// src/components/GameRow.jsx
import GameCard from './GameCard.jsx'
export default function GameRow({ title, games }) {
  if (!games.length) return null
  return (
    <section className="game-row">
      <h2 className="game-row__title">{title}</h2>
      <div className="game-row__track">
        {games.map(g => <GameCard key={g.slug} game={g} />)}
      </div>
    </section>
  )
}
```

```jsx
// src/components/SearchBar.jsx
export default function SearchBar({ value, onChange }) {
  return (
    <input className="search-bar" type="search" placeholder="게임 검색…"
      value={value} onChange={e => onChange(e.target.value)} aria-label="게임 검색" />
  )
}
```

```jsx
// src/components/TagFilter.jsx
export default function TagFilter({ tags, active, onSelect }) {
  return (
    <div className="tag-filter" role="group" aria-label="태그 필터">
      <button className={!active ? 'tag tag--active' : 'tag'} onClick={() => onSelect(null)}>전체</button>
      {tags.map(t => (
        <button key={t} className={active === t ? 'tag tag--active' : 'tag'}
          onClick={() => onSelect(t)}>{t}</button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/components/GameCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/GameCard.jsx src/components/GameRow.jsx src/components/SearchBar.jsx src/components/TagFilter.jsx src/components/GameCard.test.jsx
git commit -m "feat: add discovery components (card/row/search/tag-filter)"
```

---

## Task 9: HeroCarousel + RankingList (TDD)

**Files:**
- Create: `src/components/HeroCarousel.jsx`, `src/components/RankingList.jsx`
- Test: `src/components/RankingList.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/components/RankingList.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RankingList from './RankingList.jsx'

const games = [
  { slug: 'a', title: 'A', genre: '퍼즐', tags: [] },
  { slug: 'b', title: 'B', genre: '캐주얼', tags: [] },
]

describe('RankingList', () => {
  it('순위 번호와 게임 제목을 렌더한다', () => {
    render(<MemoryRouter><RankingList games={games} /></MemoryRouter>)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /A/ })).toHaveAttribute('href', '/game/a')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/components/RankingList.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
// src/components/RankingList.jsx
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
```

```jsx
// src/components/HeroCarousel.jsx
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/components/RankingList.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroCarousel.jsx src/components/RankingList.jsx src/components/RankingList.test.jsx
git commit -m "feat: add hero carousel and ranking list"
```

---

## Task 10: Home 페이지 조립

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: 구현 (스텁 교체)**

```jsx
// src/pages/Home.jsx
import { games } from '../data/games.js'
import { getRecentlyPlayed } from '../store/playerStore.js'
import { getGameBySlug } from '../data/games.js'
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
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: assemble home page"
```

---

## Task 11: GamesList 페이지 (검색 + 태그 필터)

**Files:**
- Modify: `src/pages/GamesList.jsx`
- Test: `src/pages/GamesList.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/pages/GamesList.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import GamesList from './GamesList.jsx'

describe('GamesList', () => {
  it('검색어로 게임을 필터한다', async () => {
    render(<MemoryRouter><GamesList /></MemoryRouter>)
    expect(screen.getByText('Sudoku')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('게임 검색'), 'hexa')
    expect(screen.queryByText('Sudoku')).not.toBeInTheDocument()
    expect(screen.getByText('Hexa Merge')).toBeInTheDocument()
  })
})
```

> 의존성: `@testing-library/user-event`. 없으면 devDependencies에 추가 후 `npm install`.

- [ ] **Step 2: user-event 설치 + 테스트 실패 확인**

Run: `npm install -D @testing-library/user-event@^14 && npx vitest run src/pages/GamesList.test.jsx`
Expected: FAIL (스텁이라 검색 입력 없음)

- [ ] **Step 3: 구현**

```jsx
// src/pages/GamesList.jsx
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/pages/GamesList.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/GamesList.jsx src/pages/GamesList.test.jsx package.json package-lock.json
git commit -m "feat: add games list page with search and tag filter"
```

---

## Task 12: GameDetail 페이지 (즐겨찾기 토글)

**Files:**
- Modify: `src/pages/GameDetail.jsx`
- Test: `src/pages/GameDetail.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/pages/GameDetail.test.jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GameDetail from './GameDetail.jsx'

function renderAt(slug) {
  return render(
    <MemoryRouter initialEntries={[`/game/${slug}`]}>
      <Routes><Route path="/game/:slug" element={<GameDetail />} /></Routes>
    </MemoryRouter>
  )
}
beforeEach(() => localStorage.clear())

describe('GameDetail', () => {
  it('게임 정보와 플레이 링크를 보여준다', () => {
    renderAt('sudoku')
    expect(screen.getByRole('heading', { name: 'Sudoku' })).toBeInTheDocument()
    expect(screen.getByText('칸을 선택하고 숫자를 입력하세요.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /플레이/ })).toHaveAttribute('href', '/play/sudoku')
  })
  it('없는 slug면 안내를 보여준다', () => {
    renderAt('nope')
    expect(screen.getByText(/찾을 수 없/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/pages/GameDetail.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
// src/pages/GameDetail.jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameBySlug } from '../data/games.js'
import { toggleFavorite, isFavorite } from '../store/playerStore.js'
import AdSlot from '../ads/AdSlot.jsx'

export default function GameDetail() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)
  const [fav, setFav] = useState(() => game ? isFavorite(slug) : false)
  if (!game) return <div className="page"><p>게임을 찾을 수 없습니다.</p><Link to="/games">전체 게임으로</Link></div>

  return (
    <div className="page page--detail">
      <div className="detail__media">
        <img src={game.screenshots[0]} alt={game.title} />
      </div>
      <div className="detail__info">
        <h1>{game.title}</h1>
        <p className="detail__tagline">{game.tagline}</p>
        <div className="detail__tags">{game.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        <p>{game.description}</p>
        <h3>조작법</h3>
        <p>{game.controls}</p>
        <p className="detail__meta">{game.tech} · {game.year}</p>
        <div className="detail__actions">
          <Link to={`/play/${game.slug}`} className="btn btn--primary btn--lg">▶ 플레이</Link>
          <button className="btn btn--ghost" aria-pressed={fav}
            onClick={() => setFav(toggleFavorite(slug))}>
            {fav ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
          </button>
        </div>
        <AdSlot variant="detail-rectangle" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/pages/GameDetail.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/GameDetail.jsx src/pages/GameDetail.test.jsx
git commit -m "feat: add game detail page with favorite toggle"
```

---

## Task 13: GameFrame + PlayLayout (g123 임베드 패턴, TDD)

**Files:**
- Create: `src/components/GameFrame.jsx`, `src/components/PlayLayout.jsx`
- Test: `src/components/GameFrame.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/components/GameFrame.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameFrame from './GameFrame.jsx'

describe('GameFrame', () => {
  it('초기엔 about:blank, "게임 시작" 클릭 시 src 주입 + wake-lock 허용', async () => {
    render(<GameFrame src="games/sudoku/index.html" title="Sudoku" />)
    const iframe = screen.getByTitle('Sudoku')
    expect(iframe).toHaveAttribute('src', 'about:blank')
    expect(iframe.getAttribute('allow')).toContain('screen-wake-lock')
    await userEvent.click(screen.getByRole('button', { name: /게임 시작/ }))
    expect(screen.getByTitle('Sudoku')).toHaveAttribute('src', 'games/sudoku/index.html')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/components/GameFrame.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현 (g123 RE 차용: about:blank → 클릭 주입, wake-lock)**

```jsx
// src/components/GameFrame.jsx
import { useState } from 'react'

export default function GameFrame({ src, title }) {
  const [started, setStarted] = useState(false)
  return (
    <div className="game-frame">
      {!started && (
        <button className="game-frame__start btn btn--primary btn--lg"
          onClick={() => setStarted(true)}>▶ 게임 시작</button>
      )}
      <iframe
        title={title}
        className="game-frame__iframe"
        src={started ? src : 'about:blank'}
        allow="autoplay; screen-wake-lock; fullscreen"
        style={{ touchAction: 'none', border: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
```

```jsx
// src/components/PlayLayout.jsx
import AdSlot from '../ads/AdSlot.jsx'
// 게임 영역과 상시 배너 영역을 분리 — 광고가 게임을 가리지 않음 (CLS 0)
export default function PlayLayout({ children }) {
  return (
    <div className="play-layout">
      <div className="play-layout__game">{children}</div>
      <div className="play-layout__ad"><AdSlot variant="persistent-banner" /></div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/components/GameFrame.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/GameFrame.jsx src/components/PlayLayout.jsx src/components/GameFrame.test.jsx
git commit -m "feat: add GameFrame (about:blank inject + wake-lock) and PlayLayout"
```

---

## Task 14: Play 페이지 (풀스크린 + 최근 플레이 기록)

**Files:**
- Modify: `src/pages/Play.jsx`
- Test: `src/pages/Play.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/pages/Play.test.jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Play from './Play.jsx'
import { getRecentlyPlayed } from '../store/playerStore.js'

function renderAt(slug) {
  return render(
    <MemoryRouter initialEntries={[`/play/${slug}`]}>
      <Routes><Route path="/play/:slug" element={<Play />} /></Routes>
    </MemoryRouter>
  )
}
beforeEach(() => localStorage.clear())

describe('Play', () => {
  it('게임 iframe과 상시 배너 광고를 렌더하고 최근 플레이에 기록한다', () => {
    renderAt('sudoku')
    expect(screen.getByTitle('Sudoku')).toBeInTheDocument()
    expect(screen.getByLabelText('광고')).toBeInTheDocument()
    expect(getRecentlyPlayed()).toContain('sudoku')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/pages/Play.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
// src/pages/Play.jsx
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameBySlug } from '../data/games.js'
import { recordPlay } from '../store/playerStore.js'
import GameFrame from '../components/GameFrame.jsx'
import PlayLayout from '../components/PlayLayout.jsx'

export default function Play() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)
  useEffect(() => { if (game) recordPlay(slug) }, [slug, game])
  if (!game) return <div className="page"><p>게임을 찾을 수 없습니다.</p><Link to="/games">전체 게임으로</Link></div>

  return (
    <div className="play-page">
      <div className="play-page__bar">
        <Link to={`/game/${slug}`} className="btn btn--ghost">← 나가기</Link>
        <span>{game.title}</span>
      </div>
      <PlayLayout>
        <GameFrame src={game.playPath} title={game.title} />
      </PlayLayout>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/pages/Play.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Play.jsx src/pages/Play.test.jsx
git commit -m "feat: add fullscreen play page with persistent banner and play recording"
```

---

## Task 15: Stats 페이지 (개인 기록 + 큐레이션 통계)

**Files:**
- Modify: `src/pages/Stats.jsx`
- Test: `src/pages/Stats.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/pages/Stats.test.jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Stats from './Stats.jsx'
import { recordScore, recordPlay } from '../store/playerStore.js'

beforeEach(() => localStorage.clear())

describe('Stats', () => {
  it('개인 최고점과 최근 플레이를 보여준다', () => {
    recordScore('sudoku', 1234)
    recordPlay('sudoku')
    render(<MemoryRouter><Stats /></MemoryRouter>)
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText(/최근 플레이/)).toBeInTheDocument()
  })
  it('기록이 없으면 안내를 보여준다', () => {
    render(<MemoryRouter><Stats /></MemoryRouter>)
    expect(screen.getByText(/아직 기록이 없습니다/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/pages/Stats.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
// src/pages/Stats.jsx
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/pages/Stats.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/Stats.jsx src/pages/Stats.test.jsx
git commit -m "feat: add stats page (personal records + catalog stats)"
```

---

## Task 16: About 페이지 (광고 약속 명문화)

**Files:**
- Modify: `src/pages/About.jsx`
- Test: `src/pages/About.test.jsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```jsx
// src/pages/About.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import About from './About.jsx'

describe('About', () => {
  it('광고 약속(모토)을 명문화해 보여준다', () => {
    render(<About />)
    expect(screen.getByText(/강제 재생 광고 금지/)).toBeInTheDocument()
    expect(screen.getByText(/예측 가능한 광고/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/pages/About.test.jsx`
Expected: FAIL

- [ ] **Step 3: 구현**

```jsx
// src/pages/About.jsx
export default function About() {
  return (
    <div className="page page--about">
      <h1>소개</h1>
      <p>자체 제작 게임을 모아 로그인 없이 바로 즐기는 캐주얼 게임 포털입니다.</p>

      <h2>광고 약속 (Ad Promise)</h2>
      <ul className="ad-promise">
        <li>✓ 강제 재생 광고 금지 — 영상 광고로 플레이 진입을 막지 않습니다.</li>
        <li>✓ 예측 가능한 광고만 부착 — 고정 위치·고정 크기, "광고" 라벨, 레이아웃 흔들림 없음.</li>
        <li>✓ 사용자 편의와 즐거움 우선 — 보상형 광고는 100% 선택(opt-in)입니다.</li>
      </ul>

      <h2>게임</h2>
      <p>Hexa Merge · Sudoku · Number Drop — 모두 직접 만든 게임입니다.</p>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/pages/About.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/About.jsx src/pages/About.test.jsx
git commit -m "feat: add about page with ad promise"
```

---

## Task 17: 스타일/테마 폴리시

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: 다크 테마 + 레이아웃 CSS 작성**

`src/styles.css`에 추가 (반응형 그리드, 카드, 버튼, 네비, 플레이 레이아웃, 상시 배너 반응형):

```css
:root {
  --bg: #0f1117; --panel: #161922; --line: #262b38;
  --text: #e8eaed; --muted: #8b93a3; --accent: #6c5ce7; --accent2: #00d2ff;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.app-main { flex: 1; max-width: 1100px; margin: 0 auto; width: 100%; padding: 16px; }

.navbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 24px;
  padding: 12px 20px; background: rgba(15,17,23,.9); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.navbar__logo { font-weight: 800; letter-spacing: .5px; }
.navbar__links { display: flex; gap: 18px; }
.navbar__links a.active { color: var(--accent2); }
.footer { border-top: 1px solid var(--line); padding: 20px; text-align: center; color: var(--muted); display:flex; flex-direction:column; gap:8px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
  border: 1px solid var(--line); background: var(--panel); color: var(--text); cursor: pointer; font-size: 14px; }
.btn--primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); border: 0; font-weight: 700; }
.btn--ghost { background: transparent; }
.btn--lg { padding: 12px 22px; font-size: 16px; }

.tag { display: inline-block; padding: 3px 10px; border-radius: 999px; background: #1e2230; color: var(--muted); font-size: 12px; border: 1px solid var(--line); }
.tag--active { background: var(--accent); color: #fff; }
.tag-filter { display: flex; gap: 8px; flex-wrap: wrap; }
.tag-filter .tag { cursor: pointer; }

.games__grid, .game-row__track { display: grid; gap: 16px; }
.games__grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.game-row__track { grid-auto-flow: column; grid-auto-columns: minmax(220px, 1fr); overflow-x: auto; padding-bottom: 8px; }
.game-card { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; transition: transform .15s; }
.game-card:hover { transform: translateY(-3px); }
.game-card__thumb img { aspect-ratio: 16/10; object-fit: cover; width: 100%; }
.game-card__body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.game-card__tagline { color: var(--muted); font-size: 13px; }
.game-card__actions { display: flex; gap: 8px; margin-top: 4px; }

.hero { position: relative; height: 320px; border-radius: 18px; overflow: hidden; margin-bottom: 24px; display: flex; align-items: flex-end; }
.hero__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(.45); }
.hero__content { position: relative; padding: 28px; display: flex; flex-direction: column; gap: 12px; }
.hero__content h1 { font-size: 36px; }
.hero__dots { position: absolute; bottom: 14px; right: 18px; display: flex; gap: 8px; }
.dot { width: 9px; height: 9px; border-radius: 50%; border: 0; background: #ffffff66; cursor: pointer; }
.dot--active { background: #fff; }

.game-row, .home__ranking, .page > section { margin: 28px 0; }
.game-row__title { margin-bottom: 12px; }
.ranking-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.ranking-list__item { display: flex; align-items: center; gap: 14px; padding: 10px 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }
.ranking-list__rank { font-weight: 800; color: var(--accent2); width: 24px; }
.ranking-list__genre { margin-left: auto; color: var(--muted); font-size: 12px; }

.games__controls { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }
.search-bar { padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); color: var(--text); width: 100%; max-width: 360px; }

.page--detail { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.detail__media img { border-radius: 14px; }
.detail__info { display: flex; flex-direction: column; gap: 10px; }
.detail__actions { display: flex; gap: 10px; margin: 12px 0; }
.detail__meta { color: var(--muted); font-size: 13px; }

/* Play: 게임 영역과 상시 배너 분리 */
.play-page { position: fixed; inset: 0; background: #000; display: flex; flex-direction: column; }
.play-page__bar { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #0b0d12; color: var(--text); }
.play-layout { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.play-layout__game { flex: 1; min-height: 0; position: relative; }
.play-layout__ad { display: flex; justify-content: center; align-items: center; background: #0b0d12; padding: 4px; }
.game-frame { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
.game-frame__start { position: absolute; z-index: 2; }
.ad-slot--persistent-banner { max-width: 728px; }

@media (max-width: 720px) {
  .page--detail { grid-template-columns: 1fr; }
  .navbar { gap: 12px; }
  .ad-slot--persistent-banner { height: 50px !important; max-width: 320px; }
}
```

- [ ] **Step 2: 빌드 + 전체 테스트**

Run: `npm run build && npm test`
Expected: 빌드 성공, 모든 테스트 PASS.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "style: add dark theme and responsive layout"
```

---

## Task 18: 전체 검증 (수동 + 빌드)

**Files:** 없음 (검증 전용)

- [ ] **Step 1: 게임 동기화 + 프로덕션 빌드**

Run: `npm run sync-games && npm run build`
Expected: `public/games/*/index.html` 3개 존재, `dist/` 생성 성공.

- [ ] **Step 2: 프리뷰 서버로 수동 확인**

Run: `npm run preview` 후 표시되는 URL(예: http://localhost:4173)을 브라우저에서 열어 확인:
- 홈: 히어로 캐러셀 회전, 게임 카드 그리드, 랭킹 표시
- `/games`: 검색 "sudoku" 시 1개로 필터, 태그 클릭 필터 동작
- 게임 카드 → 상세 → 즐겨찾기 토글(★ 유지)
- `/play/sudoku`: "게임 시작" 클릭 → iframe에 실제 게임 로드, 하단 상시 배너 표시, 게임 화면 안 가림
- `/stats`: 플레이 후 최근 플레이/통계 반영
- `/about`: 광고 약속 3항목 표시
- 새로고침(F5) 시 HashRouter로 라우트 유지

- [ ] **Step 3: 전체 자동 테스트 최종 실행**

Run: `npm test`
Expected: 모든 테스트 PASS (개수 출력 확인).

- [ ] **Step 4: 최종 Commit**

```bash
git add -A
git commit -m "chore: verify full portal build and tests"
```

---

## Self-Review 체크 결과

- **Spec 커버리지**: 아키텍처(Task 1,7) · 게임 동기화(2) · 레지스트리(3) · LocalStorage 상태(4) · 광고정책(5,6) · 6개 페이지(10~16) · g123 임베드 패턴 about:blank+wake-lock(13) · 상시 배너(13,14) · 광고 약속(16) · 통계 정직 범위(15) · 반응형/AVIF 썸네일·테마(17) 모두 매핑됨.
- **타입/이름 일관성**: `playPath`(레지스트리)→`GameFrame src`(13,14), `recordPlay/getRecentlyPlayed/toggleFavorite/isFavorite/getBestScore/recordScore`(4) 사용처 일치, `AdSlot variant`(`persistent-banner`/`detail-rectangle`) 일관.
- **플레이스홀더**: 모든 코드 스텝에 실제 코드 포함. (게임별 `recordScore` 실제 호출은 게임 빌드 내부 로직 영역 — 포털 범위 밖, Stats는 저장된 값 표시까지 담당.)
- **알려진 한계**: sudoku 썸네일은 임시(자산 별도 리소스 예정), 광고는 플레이스홀더(실연동은 범위 밖, Google GPT/H5가 1차 타깃).
