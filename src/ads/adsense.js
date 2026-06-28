// AdSense 스크립트를 1회 로드하고 광고 큐에 push한다. 비활성 시 완전 no-op.
import { adsenseClient, isAdsEnabled } from './adConfig.js'

let loaded = false

export function loadAdsense() {
  if (loaded || !isAdsEnabled()) return
  loaded = true
  const s = document.createElement('script')
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient()}`
  s.async = true
  s.crossOrigin = 'anonymous'
  document.head.appendChild(s)
}

export function pushAd() {
  if (!isAdsEnabled()) return
  ;(window.adsbygoogle = window.adsbygoogle || []).push({})
}
