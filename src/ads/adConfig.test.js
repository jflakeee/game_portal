import { describe, it, expect } from 'vitest'
import { isAdsEnabled, isSlotReady, adSlotId, adSize, adFormat, adsenseClient } from './adConfig.js'

describe('adConfig (AdSense)', () => {
  it('env 미설정 시 광고 비활성', () => {
    expect(isAdsEnabled()).toBe(false)
    expect(adsenseClient()).toBe('')
  })
  it('미승인 상태에서는 어떤 슬롯도 표시 불가', () => {
    expect(isSlotReady('persistent-banner')).toBe(false)
    expect(isSlotReady('detail-rectangle')).toBe(false)
    expect(adSlotId('persistent-banner')).toBeNull()
  })
  it('variant별 사이즈/포맷', () => {
    expect(adSize('persistent-banner')).toEqual({ width: '100%', height: '90px' })
    expect(adSize('detail-rectangle')).toEqual({ width: '300px', height: '250px' })
    expect(adFormat('detail-rectangle')).toBe('rectangle')
  })
})
