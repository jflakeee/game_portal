import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Play from './Play.jsx'
import { getRecentlyPlayed } from '../store/playerStore.js'

function renderAt(slug) {
  return render(
    <MemoryRouter initialEntries={[`/play/${slug}`]}>
      <Routes><Route path="/play/:slug" element={<Play />} /></Routes>
    </MemoryRouter>
  )
}
beforeEach(() => localStorage.clear())

describe('Play', () => {
  it('게임 iframe과 상시 배너 광고를 렌더하고 최근 플레이에 기록한다', () => {
    renderAt('sudoku')
    expect(screen.getByTitle('Sudoku')).toBeInTheDocument()
    expect(screen.getByLabelText('광고')).toBeInTheDocument()
    expect(getRecentlyPlayed()).toContain('sudoku')
  })
})
