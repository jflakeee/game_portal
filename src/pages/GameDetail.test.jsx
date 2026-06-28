import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GameDetail from './GameDetail.jsx'

function renderAt(slug) {
  return render(
    <MemoryRouter initialEntries={[`/game/${slug}`]}>
      <Routes><Route path="/game/:slug" element={<GameDetail />} /></Routes>
    </MemoryRouter>
  )
}
beforeEach(() => localStorage.clear())

describe('GameDetail', () => {
  it('게임 정보와 플레이 링크를 보여준다', () => {
    renderAt('sudoku')
    expect(screen.getByRole('heading', { name: 'Sudoku' })).toBeInTheDocument()
    expect(screen.getByText('칸을 선택하고 숫자를 입력하세요.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /플레이/ })).toHaveAttribute('href', '/play/sudoku')
  })
  it('없는 slug면 안내를 보여준다', () => {
    renderAt('nope')
    expect(screen.getByText(/찾을 수 없/)).toBeInTheDocument()
  })
})
