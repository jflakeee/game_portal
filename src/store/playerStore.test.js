import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordPlay, getRecentlyPlayed,
  toggleFavorite, isFavorite, getFavorites,
  recordScore, getBestScore,
} from './playerStore.js'

beforeEach(() => localStorage.clear())

describe('playerStore', () => {
  it('최근 플레이는 최신순, 중복 제거, 최대 10개', () => {
    recordPlay('a'); recordPlay('b'); recordPlay('a')
    expect(getRecentlyPlayed()).toEqual(['a', 'b'])
    for (let i = 0; i < 12; i++) recordPlay('g' + i)
    expect(getRecentlyPlayed()).toHaveLength(10)
    expect(getRecentlyPlayed()[0]).toBe('g11')
  })
  it('즐겨찾기 토글', () => {
    expect(isFavorite('sudoku')).toBe(false)
    toggleFavorite('sudoku')
    expect(isFavorite('sudoku')).toBe(true)
    expect(getFavorites()).toContain('sudoku')
    toggleFavorite('sudoku')
    expect(isFavorite('sudoku')).toBe(false)
  })
  it('최고점은 더 높은 값만 갱신', () => {
    recordScore('hexa-merge', 100)
    recordScore('hexa-merge', 50)
    expect(getBestScore('hexa-merge')).toBe(100)
    recordScore('hexa-merge', 200)
    expect(getBestScore('hexa-merge')).toBe(200)
    expect(getBestScore('none')).toBe(0)
  })
})
