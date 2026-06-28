import { describe, it, expect } from 'vitest'
import { canShowInterstitial, AD_CONFIG } from './adPolicy.js'

const base = { sessionStartMs: 0, lastAdMs: null }

describe('canShowInterstitial', () => {
  it('세션 첫 N초 동안은 광고 금지', () => {
    expect(canShowInterstitial({ ...base, nowMs: AD_CONFIG.firstAdDelayMs - 1 })).toBe(false)
    expect(canShowInterstitial({ ...base, nowMs: AD_CONFIG.firstAdDelayMs + 1 })).toBe(true)
  })
  it('쿨다운 내 재요청은 거부', () => {
    const now = AD_CONFIG.firstAdDelayMs + 10_000
    expect(canShowInterstitial({ sessionStartMs: 0, lastAdMs: now - (AD_CONFIG.cooldownMs - 1), nowMs: now })).toBe(false)
    expect(canShowInterstitial({ sessionStartMs: 0, lastAdMs: now - (AD_CONFIG.cooldownMs + 1), nowMs: now })).toBe(true)
  })
})
