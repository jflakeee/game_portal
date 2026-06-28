import { useEffect } from 'react'
import { adsenseClient, adSlotId, adFormat, adSize, isSlotReady } from './adConfig.js'
import { loadAdsense, pushAd } from './adsense.js'

export default function AdSlot({ variant = 'persistent-banner' }) {
  const ready = isSlotReady(variant)

  useEffect(() => {
    if (!ready) return
    loadAdsense()
    pushAd()
  }, [ready])

  // AdSense 승인 전: 광고 자리 자체를 숨김 (렌더 없음, 예약 공간 없음)
  if (!ready) return null

  const size = adSize(variant)
  return (
    <aside aria-label="광고" className={`ad-slot ad-slot--${variant}`}
           style={{ ...size, overflow: 'hidden', display: 'block' }}>
      <ins className="adsbygoogle"
        style={{ display: 'block', width: size.width, height: size.height }}
        data-ad-client={adsenseClient()}
        data-ad-slot={adSlotId(variant)}
        data-ad-format={adFormat(variant)}
        data-full-width-responsive="true" />
    </aside>
  )
}
