# 게임 포털 사이트 설계 (Design Spec)

- **작성일**: 2026-06-27
- **상태**: 확정 (v3.1 — 시장조사 + g123 벤치마크 RE 반영)
- **목적**: 자체 제작 게임 3종(Hexa Merge, Sudoku, Number Drop)을 모아 소개·플레이시키는 정적 웹 게임 포털 구축

## 1. 배경 / 모토

벤치마크 사이트는 [g123.jp](https://g123.jp) (H5 인스턴트 게임 포털). 핵심 모토:

- **강제 재생 광고 금지** — 인터스티셜·전면·자동재생 영상 광고로 플레이 진입을 막지 않는다.
- **예측 가능한 광고만 부착** — 광고는 고정 위치·고정 크기·"광고" 라벨, 레이아웃 시프트 0.
- **사용자를 위한 편의성과 즐거움 우선**.

## 2. 시장조사 결론 → 설계 원칙

(deep-research 검증 결과: 25개 클레임 전부 confirmed)

| 검증된 시장 결론 | 설계 반영 |
|---|---|
| 즉시 플레이·무로그인이 표준 (G123/Poki/CrazyGames). 게스트 진행도는 LocalStorage, 추후 로그인 시 동기화 | 로그인 없이 즉시 플레이. 기록은 LocalStorage. 계정 동기화는 나중 선택 레이어 |
| 광고는 비강제·예측가능: 자연 끊김 지점(게임오버/전환/로딩)에서만, 액티브 플레이 중단 안 함 | 모토와 일치 → `AdPolicy` 레이어로 규칙 코드화 |
| 빈도 제한: 인터스티셜 120~240초 간격, ~3분 쿨다운, 오프닝 수 초간 금지 | 첫 광고 지연 + 쿨다운 + 빈도캡 내장 |
| 보상형 광고는 100% opt-in(부활/힌트/언두), 핵심 진행 강제 금지. eCPM 최고 | 퍼즐 3종에 힌트/언두/재시도 opt-in 보상 슬롯 |
| 보상형 > 인터스티셜 > 배너 (배너는 수익 미미·UX 비용) | 광고 우선순위 명문화 |
| SDK는 스크립트 태그 + init 프로미스 + 콜백 라이프사이클, 게임이 타이밍 제어 | 광고 훅을 표준 콜백 인터페이스로 추상화 |
| 자체호스팅 정적 사이트의 현실적 수익화 = Google H5 Games Ads / AdSense / GPT | AdSlot 1차 타깃 = Google 광고 스택 |
| 한·일 게이머는 소수 타이틀 깊게 플레이 (한국 67%·일본 52%가 주 1~3종) | 3종 큐레이션 카탈로그에 깊이·리텐션 집중 |
| G123은 IAP/가챠 모델 — UX만 벤치마크, 수익화는 Poki/CrazyGames 광고형 따름 | UX=G123, 수익화=광고형 |

## 3. g123 벤치마크 리버스엔지니어링 (스터디)

> 공개 마크업/스크립트만 관찰. 게임 자산·코드는 추출하지 않음. 아트웍·자산은 별도 리소스 사용.

- **기술 스택**: 포털 Next.js(React), 게임 엔진 Laya/Unity(WebGL).
- **포털/플레이 분리**: 포털 `g123.jp` ↔ 플레이 `h5.g123.jp/game/<code>`. 게임마다 독립 오리진으로 격리.
- **게임 임베드 패턴 ★**:
  ```html
  <iframe id="iframe-game" allow="autoplay; screen-wake-lock"
          src="about:blank" style="touch-action:none">
  ```
  iframe `src`를 `about:blank`로 시작 → "게임 시작" 클릭 시 JS로 게임 URL 주입(제어된 지연 로드). `screen-wake-lock`으로 플레이 중 화면 꺼짐 방지.
- **광고**: 포털 홈은 광고 없음(IAP 모델), 플레이 페이지에는 `googletag`(GPT) 존재 → 자체호스팅 광고 경로 = Google 광고 스택임을 실증.
- **이미지**: ImageKit CDN, 반응형 AVIF(`tr=f-avif,w-,h-,q-75,dpr-`) + `srcset 1x/2x/3x`.

## 4. 아키텍처

- **React + Vite SPA**, `HashRouter`, 전체 정적 배포(GitHub Pages 등).
- 각 게임 정적 빌드를 `public/games/<slug>/`에 복사 → **iframe 격리 임베드**.
- **데이터 주도**: 게임 정보는 `src/data/games.js` 레지스트리 하나로 관리.
- **무백엔드**: 모든 개인 상태(최근 플레이, 즐겨찾기, 개인 최고점)는 LocalStorage.
- **3단 격리**: 포털 라우트 ↔ `/play/:slug` ↔ `public/games/<slug>/`.

### 게임 레지스트리 스키마 (`src/data/games.js`)

```
{ slug, title, tagline, description, tags[], genre, tech,
  thumbnail, screenshots[], playPath, controls, year, featured }
```

게임 추가 = 레지스트리 항목 1개 + 빌드 폴더 복사. 페이지 코드 수정 불필요.

## 5. 페이지 구성

| 경로 | 페이지 | 내용 |
|---|---|---|
| `/` | 메인 | 히어로 캐러셀 → 이어하기(최근 플레이) → 인기 → 신규 → 랭킹 → 추천. 카테고리 칩 내비 |
| `/games` | 전체 리스트 | 그리드 + 태그/장르 필터 + 검색 |
| `/game/:slug` | 상세 | 스크린샷 캐러셀, 설명, 조작법, 태그, 즐겨찾기 토글, Play 버튼, 광고 슬롯 |
| `/play/:slug` | 풀스크린 플레이 | iframe 전체화면 + **상시 배너 스트립**, 무로그인 즉시 실행 |
| `/stats` | 나의 기록 | LocalStorage 개인 최고점·플레이 횟수·최근 플레이 + 큐레이션 통계 |
| `/about` | 소개 + 광고 약속 | 제작자 소개 + 모토를 "광고 약속(Ad Promise)"으로 명문화 |

## 6. 컴포넌트 (단일 책임)

- **레이아웃**: `Navbar`(카테고리 칩), `Footer`(약관/FAQ)
- **발견**: `HeroCarousel`, `GameRow`(가로 스크롤), `GameCard`, `RankingList`, `TagFilter`, `SearchBar`
- **플레이**: `PlayLayout`(게임 영역 + 배너 영역 분리), `GameFrame`(iframe 래퍼)
- **광고**: `AdSlot`(예측가능 고정자리·라벨·고정크기, CLS 0), `useAdPolicy`(빈도캡/쿨다운/첫광고지연/보상형 콜백)
- **상태**: `usePlayerStore`(LocalStorage: recentlyPlayed, favorites, bestScores)

### `GameFrame` 구현 규약 (RE 차용)

- `src="about:blank"`로 마운트 → "게임 시작" 클릭 시 `src` 주입 (IntersectionObserver + 클릭 게이트).
- `allow="autoplay; screen-wake-lock"`, `touch-action:none`.

## 7. 광고 정책 레이어 (모토의 코드화)

3단 구조:

| 광고 유형 | 정책 |
|---|---|
| **상시 배너** | 플레이 중 **항상 표시**. iframe 바깥 고정 스트립, 게임 영역 비침범, 고정 높이(CLS 0), "광고" 라벨. 데스크톱 728×90 / 모바일 320×50 반응형 |
| **인터스티셜** | 게임오버/전환 시점만. 첫 N초 금지, 쿨다운·빈도캡(120~240초). 강제 전면·자동재생 영상 금지 |
| **보상형** | 100% opt-in (힌트/언두/재시도). 핵심 진행 강제 금지. 보상은 광고와 독립적으로 보장 |

- **우선순위**: 보상형(opt-in) > 인터스티셜(break-point) > 배너(상시·최소 침해).
- **구현**: `AdSlot`은 벤더 중립. 현재는 라벨된 플레이스홀더, **1차 연동 타깃 = Google Publisher Tag(GPT) / H5 Games Ads**.

### `/play/:slug` 레이아웃

```
┌─────────────────────────────┐
│        게임 iframe          │  ← 게임 영역 (광고가 절대 안 가림)
├─────────────────────────────┤
│  [광고]  상시 배너 스트립    │  ← 고정 높이 예약 (CLS 0)
└─────────────────────────────┘
```

## 8. 통계 / 랭킹의 정직한 범위

정적 사이트라 글로벌 서버 랭킹은 불가. 대신:

1. LocalStorage 개인 기록(최근 플레이, 개인 최고점, 플레이 횟수)
2. 레지스트리 메타데이터 기반 큐레이션 통계(태그/기술별 분포)

서버 랭킹이 필요하면 별도 백엔드 프로젝트로 분리.

## 9. 등록 게임 3종

| slug | 게임 | 빌드 소스 | 장르 태그 |
|---|---|---|---|
| `hexa-merge` | Hexa Merge | `D:\htdocs\hexa_merge\hexa_merge_web\` (Unity WebGL) | 퍼즐·머지 |
| `sudoku` | Sudoku | `D:\htdocs\sudoku\sudoku_clone\src\` (JS PWA) | 퍼즐·로직 |
| `number-drop` | Number Drop | `D:\htdocs\drop_merge\number_drop\frontend\dist\` (Vite) | 캐주얼·머지 |

## 10. 스타일 / 디자인

- 의존성 최소화: 순수 CSS(또는 CSS Modules) + frontend-design 품질 폴리시.
- 게임 포털다운 생동감 있는 다크 테마 기본.
- 썸네일: 반응형 `srcset`(1x/2x/3x) + AVIF/WebP 우선, 지연 로드.
- 모바일 우선 반응형 그리드(CSS Grid).

## 11. 범위 밖 (YAGNI)

- 계정/로그인·서버 동기화 (LocalStorage로 시작, 추후 선택 레이어)
- 실제 광고 네트워크 라이브 연동 (지금은 플레이스홀더 + 연동 지점만)
- IAP/마이크로트랜잭션 (G123 모델, 본 포털 범위 밖)
- 서버 글로벌 랭킹 (별도 프로젝트)
- 다국어(i18n) — 1차는 한국어, 구조만 확장 가능하게
