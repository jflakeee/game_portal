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
