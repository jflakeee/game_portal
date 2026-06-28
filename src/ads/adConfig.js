// Google Publisher Tag (GPT) ad configuration.
// Real ads activate ONLY when VITE_GPT_NETWORK is set at build time
// (e.g. .env.local: VITE_GPT_NETWORK=/22639388115). Without it, AdSlot
// renders the labeled placeholder — honoring the "예측 가능·비강제" 광고 모토.
const NETWORK = (import.meta.env.VITE_GPT_NETWORK || '').trim()

// AdSlot variant → GPT ad unit name + accepted creative sizes.
export const AD_UNITS = {
  'persistent-banner': { unit: 'play_banner', sizes: [[728, 90], [320, 50]] },
  'detail-rectangle':  { unit: 'detail_mrec', sizes: [[300, 250]] },
}

export function isAdsEnabled() {
  return NETWORK.length > 0
}

export function adUnitPath(variant) {
  const u = AD_UNITS[variant]
  if (!u || !isAdsEnabled()) return null
  return `${NETWORK}/${u.unit}`
}

export function adSizes(variant) {
  return AD_UNITS[variant]?.sizes ?? []
}
