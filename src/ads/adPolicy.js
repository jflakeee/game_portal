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
