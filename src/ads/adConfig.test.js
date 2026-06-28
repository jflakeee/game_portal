import { describe, it, expect } from 'vitest'
import { isAdsEnabled, adUnitPath, adSizes, AD_UNITS } from './adConfig.js'

describe('adConfig', () => {
  it('VITE_GPT_NETWORK 미설정 시 광고 비활성', () => {
    expect(isAdsEnabled()).toBe(false)
  })
  it('알려진 variant의 사이즈를 반환', () => {
    expect(adSizes('persistent-banner')).toEqual([[728, 90], [320, 50]])
    expect(adSizes('detail-rectangle')).toEqual([[300, 250]])
    expect(adSizes('unknown')).toEqual([])
  })
  it('비활성 상태에서 adUnitPath는 null', () => {
    // network 미설정이므로 경로 생성 불가
    expect(adUnitPath('persistent-banner')).toBeNull()
  })
  it('AD_UNITS는 두 variant를 가진다', () => {
    expect(Object.keys(AD_UNITS).sort()).toEqual(['detail-rectangle', 'persistent-banner'])
  })
})
