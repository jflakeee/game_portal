import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Stats from './Stats.jsx'
import { recordScore, recordPlay } from '../store/playerStore.js'

beforeEach(() => localStorage.clear())

describe('Stats', () => {
  it('개인 최고점과 최근 플레이를 보여준다', () => {
    recordScore('sudoku', 1234)
    recordPlay('sudoku')
    render(<MemoryRouter><Stats /></MemoryRouter>)
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText(/최근 플레이/)).toBeInTheDocument()
  })
  it('기록이 없으면 안내를 보여준다', () => {
    render(<MemoryRouter><Stats /></MemoryRouter>)
    expect(screen.getByText(/아직 기록이 없습니다/)).toBeInTheDocument()
  })
})
