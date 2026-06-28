// Google AdSense configuration.
// 배너 광고는 AdSense 승인 후에만 표시된다. 승인 전(env 미설정)에는 광고 자리를
// 완전히 숨긴다 — 플레이스홀더도, 예약 공간도 없음.
// .env.local 예시:
//   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//   VITE_ADSENSE_SLOT_BANNER=1234567890
//   VITE_ADSENSE_SLOT_RECT=0987654321
const CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT || '').trim()

const SLOTS = {
  'persistent-banner': {
    slot: (import.meta.env.VITE_ADSENSE_SLOT_BANNER || '').trim(),
    format: 'horizontal',
    size: { width: '100%', height: '90px' },
  },
  'detail-rectangle': {
    slot: (import.meta.env.VITE_ADSENSE_SLOT_RECT || '').trim(),
    format: 'rectangle',
    size: { width: '300px', height: '250px' },
  },
}

export function adsenseClient() { return CLIENT }
export function isAdsEnabled() { return CLIENT.length > 0 }
export function adSlotId(variant) { return SLOTS[variant]?.slot || null }
export function adFormat(variant) { return SLOTS[variant]?.format ?? 'auto' }
export function adSize(variant) { return (SLOTS[variant] ?? SLOTS['persistent-banner']).size }
// 슬롯이 실제로 표시 가능한가: 클라이언트 + 해당 슬롯 id 둘 다 설정됨
export function isSlotReady(variant) { return isAdsEnabled() && !!adSlotId(variant) }
