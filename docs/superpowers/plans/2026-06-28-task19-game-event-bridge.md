# Task 19: Game-Event postMessage Bridge + Policy-Gated Interstitial

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the already-implemented `recordScore` and `canShowInterstitial` to a real live path via a postMessage bridge from embedded game iframes, with a placeholder interstitial shown at gameover break-points.

**Architecture:** Pure parser (`gameBridge.js`) validates iframe postMessage payloads. `Play.jsx` listens for messages, records scores on `'score'` events, and gates an `Interstitial` overlay on `'gameover'` events using the existing `canShowInterstitial` policy. If a game emits nothing, everything safely no-ops.

**Tech Stack:** React 18, Vite 5, Vitest + @testing-library/react + jsdom, existing `recordScore`/`canShowInterstitial` APIs.

---

## File Structure

```
src/
├─ play/
│  ├─ gameBridge.js          CREATE  pure parser for postMessage payloads
│  └─ gameBridge.test.js     CREATE  unit tests for parser
├─ components/
│  ├─ Interstitial.jsx       CREATE  placeholder overlay component
│  └─ Interstitial.test.jsx  CREATE  component test
├─ pages/
│  ├─ Play.jsx               MODIFY  add message listener + interstitial state
│  └─ Play.test.jsx          MODIFY  add score-recording test
└─ styles.css                MODIFY  append interstitial CSS
docs/superpowers/specs/2026-06-27-game-portal-design.md  MODIFY  §11 note
```

---

## Task A: gameBridge parser (pure, TDD)

**Files:**
- Create: `src/play/gameBridge.test.js`
- Create: `src/play/gameBridge.js`

- [ ] **Step A1: Write the failing test**

Create `src/play/gameBridge.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { parseGameMessage } from './gameBridge.js'

describe('parseGameMessage', () => {
  it('유효한 score 메시지를 정규화한다', () => {
    expect(parseGameMessage({ type: 'score', value: 1500 })).toEqual({ type: 'score', value: 1500 })
  })
  it('gameover 메시지를 인식한다', () => {
    expect(parseGameMessage({ type: 'gameover' })).toEqual({ type: 'gameover' })
  })
  it('음수 점수/비숫자/알 수 없는 타입/잡음은 null', () => {
    expect(parseGameMessage({ type: 'score', value: -1 })).toBeNull()
    expect(parseGameMessage({ type: 'score', value: 'x' })).toBeNull()
    expect(parseGameMessage({ type: 'nope' })).toBeNull()
    expect(parseGameMessage('hello')).toBeNull()
    expect(parseGameMessage(null)).toBeNull()
  })
})
```

- [ ] **Step A2: Run test to confirm FAIL**

Run: `npx vitest run src/play/gameBridge.test.js`
Expected: FAIL with "Cannot find module './gameBridge.js'"

- [ ] **Step A3: Implement the parser**

Create `src/play/gameBridge.js`:
```js
// Normalizes a postMessage payload from an embedded game iframe.
// Recognized: { type: 'score', value: <number >= 0> } | { type: 'gameover' }.
// Returns the normalized event, or null for anything unrecognized.
export function parseGameMessage(data) {
  if (!data || typeof data !== 'object') return null
  if (data.type === 'score' && typeof data.value === 'number' && data.value >= 0) {
    return { type: 'score', value: data.value }
  }
  if (data.type === 'gameover') return { type: 'gameover' }
  return null
}
```

- [ ] **Step A4: Run test to confirm PASS**

Run: `npx vitest run src/play/gameBridge.test.js`
Expected: 4 tests PASS

---

## Task B: Interstitial placeholder component (TDD)

**Files:**
- Create: `src/components/Interstitial.test.jsx`
- Create: `src/components/Interstitial.jsx`

- [ ] **Step B1: Write the failing test**

Create `src/components/Interstitial.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Interstitial from './Interstitial.jsx'

describe('Interstitial', () => {
  it('"광고" 라벨과 계속하기 버튼을 렌더하고 클릭 시 onContinue 호출', async () => {
    const onContinue = vi.fn()
    render(<Interstitial onContinue={onContinue} />)
    expect(screen.getByRole('dialog', { name: /광고/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /계속하기/ }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step B2: Run test to confirm FAIL**

Run: `npx vitest run src/components/Interstitial.test.jsx`
Expected: FAIL with "Cannot find module './Interstitial.jsx'"

- [ ] **Step B3: Implement the component**

Create `src/components/Interstitial.jsx`:
```jsx
// 정책 게이트를 통과한 break-point에서만 표시되는 플레이스홀더 인터스티셜.
// 강제 영상/자동재생 없음 — 사용자가 "계속하기"로 즉시 닫을 수 있는 예측 가능한 광고 면.
export default function Interstitial({ onContinue }) {
  return (
    <div className="interstitial" role="dialog" aria-label="광고" aria-modal="true">
      <div className="interstitial__box">
        <span className="interstitial__label">광고</span>
        <p className="interstitial__note">게임 사이에 표시되는 광고입니다.</p>
        <button className="btn btn--primary" onClick={onContinue}>계속하기</button>
      </div>
    </div>
  )
}
```

- [ ] **Step B4: Run test to confirm PASS**

Run: `npx vitest run src/components/Interstitial.test.jsx`
Expected: 1 test PASS

---

## Task C: Wire bridge into Play.jsx (TDD)

**Files:**
- Modify: `src/pages/Play.test.jsx` (append new test inside describe block)
- Modify: `src/pages/Play.jsx` (replace entire file)

- [ ] **Step C1: Add failing test to Play.test.jsx**

Append inside the `describe('Play', ...)` block:
```jsx
  it('게임이 보낸 score 메시지를 기록한다', async () => {
    const { getBestScore } = await import('../store/playerStore.js')
    renderAt('sudoku')
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'score', value: 4321 },
      origin: window.location.origin,
    }))
    expect(getBestScore('sudoku')).toBe(4321)
  })
```

- [ ] **Step C2: Run to confirm new test FAIL, existing test PASS**

Run: `npx vitest run src/pages/Play.test.jsx`
Expected: 1 PASS (existing), 1 FAIL (new score test)

- [ ] **Step C3: Update Play.jsx**

Replace `src/pages/Play.jsx` entirely:
```jsx
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameBySlug } from '../data/games.js'
import { recordPlay, recordScore } from '../store/playerStore.js'
import { canShowInterstitial } from '../ads/adPolicy.js'
import { parseGameMessage } from '../play/gameBridge.js'
import GameFrame from '../components/GameFrame.jsx'
import PlayLayout from '../components/PlayLayout.jsx'
import Interstitial from '../components/Interstitial.jsx'

export default function Play() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)
  const sessionStartRef = useRef(Date.now())
  const lastAdRef = useRef(null)
  const [interstitial, setInterstitial] = useState(false)

  useEffect(() => { if (game) recordPlay(slug) }, [slug, game])

  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== window.location.origin) return
      const msg = parseGameMessage(e.data)
      if (!msg) return
      if (msg.type === 'score') recordScore(slug, msg.value)
      if (msg.type === 'gameover') {
        const now = Date.now()
        if (canShowInterstitial({ sessionStartMs: sessionStartRef.current, lastAdMs: lastAdRef.current, nowMs: now })) {
          lastAdRef.current = now
          setInterstitial(true)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [slug])

  if (!game) return <div className="page"><p>게임을 찾을 수 없습니다.</p><Link to="/games">전체 게임으로</Link></div>

  return (
    <div className="play-page">
      <div className="play-page__bar">
        <Link to={`/game/${slug}`} className="btn btn--ghost">← 나가기</Link>
        <span>{game.title}</span>
      </div>
      <PlayLayout>
        <GameFrame key={slug} src={game.playPath} title={game.title} />
      </PlayLayout>
      {interstitial && <Interstitial onContinue={() => setInterstitial(false)} />}
    </div>
  )
}
```

- [ ] **Step C4: Run Play.test.jsx — all PASS**

Run: `npx vitest run src/pages/Play.test.jsx`
Expected: 2 tests PASS

---

## Task D: Interstitial CSS

**Files:**
- Modify: `src/styles.css` (append)

- [ ] **Step D1: Append CSS**

Append to `src/styles.css`:
```css
.interstitial { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.72); }
.interstitial__box { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 28px 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; min-width: 280px; }
.interstitial__label { font-size: 12px; color: var(--muted); letter-spacing: 2px; }
.interstitial__note { color: var(--muted); font-size: 14px; }
```

---

## Task E: Full test run + build + spec note + commit

- [ ] **Step E1: Run full test suite**

Run: `npx vitest run`
Expected: all tests PASS (~26 across ~15 files)

- [ ] **Step E2: Build**

Run: `npm run build`
Expected: success, no errors

- [ ] **Step E3: Update spec §11**

Append to §11 범위 밖 in `docs/superpowers/specs/2026-06-27-game-portal-design.md`:
```
- 보상형(rewarded) opt-in 광고는 게임 내부 트리거가 필요해 현재 미연동(딜레이드). 점수/게임오버 브리지는 game→portal postMessage({type:'score'|'gameover'})로 연동되며, 게임이 신호를 emit하면 자동 동작.
```

- [ ] **Step E4: Commit**

```bash
git add src/play/gameBridge.js src/play/gameBridge.test.js \
        src/components/Interstitial.jsx src/components/Interstitial.test.jsx \
        src/pages/Play.jsx src/pages/Play.test.jsx \
        src/styles.css \
        docs/superpowers/specs/2026-06-27-game-portal-design.md \
        docs/superpowers/plans/2026-06-28-task19-game-event-bridge.md
git commit -m "feat: add game-event postMessage bridge (score recording + policy-gated interstitial)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CTVHGR6BzREMmBiYCG4VAQ"
```
