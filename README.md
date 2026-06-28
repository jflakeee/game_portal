# 🎮 Game Portal

자체 제작 게임을 모아 **로그인 없이 바로 플레이**하는 정적 웹 게임 포털. [g123.jp](https://g123.jp)를 벤치마크로, "강제 재생 광고 금지 · 예측 가능한 광고만 · 사용자 편의 우선" 모토를 코드로 구현했습니다.

수록 게임 3종: **Hexa Merge** · **Sudoku** · **Number Drop** (모두 직접 제작).

## ✨ 주요 기능

- **즉시 플레이** — 다운로드·로그인 없이 카드 클릭 → 풀스크린 플레이. iframe 격리(`about:blank` → "게임 시작" 클릭 시 주입, `screen-wake-lock`으로 화면 꺼짐 방지).
- **6개 페이지** — 메인(히어로 캐러셀·인기·신규·랭킹) / 전체 게임(검색·태그 필터) / 게임 상세 / 풀스크린 플레이 / 내 기록 / 소개(광고 약속).
- **무백엔드 개인 기록** — 최근 플레이·즐겨찾기·개인 최고점을 LocalStorage에 저장.
- **점수/게임오버 브리지** — 게임이 `postMessage({type:'score'|'gameover'})`를 보내면 포털이 최고점 기록 + 정책 기반 인터스티셜을 처리(게임이 신호를 안 보내면 안전하게 no-op).
- **모토 기반 광고 정책** — Google AdSense 기반. **승인 전에는 광고 자리를 완전히 숨김**(플레이스홀더·예약 공간 없음), 승인 후 배너 표시. 인터스티셜은 게임오버 시점만(첫 광고 지연 + 쿨다운). 강제 전면·자동재생 영상 없음.

## 🛠 기술 스택

React 18 · Vite 5 · react-router-dom 6 (HashRouter) · Vitest + Testing Library · 순수 CSS(다크 테마). 백엔드/빌드 의존 외부 서비스 없음 — 전체 정적 배포.

## 🚀 시작하기

```bash
npm install         # 의존성 설치
npm run sync-games  # 게임 빌드를 public/games/<slug>/ 로 복사 (필수)
npm run dev         # 개발 서버
```

> `npm run sync-games`는 게임 원본 빌드를 `public/games/`로 복사합니다(이 폴더는 git 추적 제외 = 빌드 산출물). 게임 원본 경로는 `scripts/sync-games.mjs`의 `SOURCES`에 정의돼 있습니다.

### 빌드 / 배포

```bash
npm run sync-games && npm run build   # dist/ 생성 (games 포함)
npm run preview                       # 빌드 결과 로컬 확인
```

`dist/`를 GitHub Pages 등 정적 호스팅에 업로드하면 됩니다. `vite.config.js`의 `base: './'` + HashRouter 조합으로 서브경로 배포·새로고침에서도 안전합니다.

### 테스트

```bash
npm test            # 전체 테스트 (Vitest)
```

## 📁 구조

```
src/
├─ data/games.js        # 게임 레지스트리(단일 소스) + 셀렉터
├─ store/playerStore.js # LocalStorage: 최근 플레이/즐겨찾기/최고점
├─ ads/                 # adConfig·adsense(로더)·adPolicy·AdSlot
├─ play/gameBridge.js   # game→portal postMessage 파서
├─ components/          # Navbar/Footer/GameCard/GameRow/HeroCarousel/
│                       # RankingList/SearchBar/TagFilter/GameFrame/
│                       # PlayLayout/Interstitial
└─ pages/               # Home/GamesList/GameDetail/Play/Stats/About
scripts/sync-games.mjs  # 게임 빌드 동기화
public/
├─ games/<slug>/        # 복사된 게임 빌드 (gitignore)
└─ thumbs/<slug>.png    # 게임 썸네일
```

### 게임 추가하기

1. 게임의 정적 빌드 경로를 `scripts/sync-games.mjs`의 `SOURCES`에 추가.
2. `src/data/games.js` 레지스트리에 항목 1개 추가(slug/title/tags/playPath 등).
3. `public/thumbs/<slug>.png` 썸네일 추가.

페이지 코드 수정 없이 게임이 전 페이지에 자동 노출됩니다.

## 📢 광고 (선택적 활성화)

광고는 **Google AdSense** 기반이며, AdSense 승인 전(env 미설정)에는 광고 자리가 **완전히 숨겨집니다** — 플레이스홀더도 예약 공간도 없음. 승인 후 아래 세 값을 `.env.local`에 설정하고 빌드하면 배너 광고가 활성화됩니다:

```bash
# .env.local
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX   # AdSense 게시자 ID
VITE_ADSENSE_SLOT_BANNER=1234567890           # 플레이 배너 광고 단위 ID
VITE_ADSENSE_SLOT_RECT=0987654321             # 상세 페이지 직사각형 광고 단위 ID
```

세 값이 모두 설정되어야 해당 슬롯이 표시됩니다. 하나라도 비어 있으면 그 슬롯은 숨겨집니다.

## 📐 설계 문서

- 설계 스펙: [`docs/superpowers/specs/2026-06-27-game-portal-design.md`](docs/superpowers/specs/2026-06-27-game-portal-design.md)
- 구현 계획: [`docs/superpowers/plans/2026-06-27-game-portal.md`](docs/superpowers/plans/2026-06-27-game-portal.md)
