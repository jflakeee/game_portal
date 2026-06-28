import { describe, it, expect } from 'vitest'
import { games, getGameBySlug, getGamesByTag, allTags } from './games.js'

describe('games registry', () => {
  it('3종 게임을 가진다', () => {
    expect(games).toHaveLength(3)
    expect(games.map(g => g.slug).sort()).toEqual(['hexa-merge', 'number-drop', 'sudoku'])
  })
  it('각 게임은 필수 필드를 가진다', () => {
    for (const g of games) {
      expect(g.slug).toBeTruthy()
      expect(g.title).toBeTruthy()
      expect(g.playPath).toMatch(/^games\/.+\/index\.html$/)
      expect(Array.isArray(g.tags)).toBe(true)
    }
  })
  it('getGameBySlug는 slug로 게임을 찾는다', () => {
    expect(getGameBySlug('sudoku').title).toBe('Sudoku')
    expect(getGameBySlug('none')).toBeUndefined()
  })
  it('getGamesByTag는 태그로 필터한다', () => {
    expect(getGamesByTag('퍼즐').length).toBeGreaterThanOrEqual(2)
  })
  it('allTags는 중복 없는 태그 목록을 반환한다', () => {
    const t = allTags()
    expect(new Set(t).size).toBe(t.length)
  })
})
