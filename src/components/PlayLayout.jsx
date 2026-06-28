import { isAdsEnabled } from '../ads/adConfig.js'
import AdSlot from '../ads/AdSlot.jsx'
// 게임 영역과 상시 배너 영역 분리. AdSense 승인 전에는 배너 영역 자체를 렌더하지 않음.
export default function PlayLayout({ children }) {
  return (
    <div className="play-layout">
      <div className="play-layout__game">{children}</div>
      {isAdsEnabled() && (
        <div className="play-layout__ad"><AdSlot variant="persistent-banner" /></div>
      )}
    </div>
  )
}
