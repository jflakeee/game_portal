import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GameCard from './GameCard.jsx'

const game = {
  slug: 'sudoku', title: 'Sudoku', tagline: '로직 퍼즐',
  tags: ['퍼즐'], thumbnail: 'thumbs/sudoku.png',
}

describe('GameCard', () => {
  it('제목/태그라인과 상세 링크, Play 링크를 렌더한다', () => {
    render(<MemoryRouter><GameCard game={game} /></MemoryRouter>)
    expect(screen.getByText('Sudoku')).toBeInTheDocument()
    expect(screen.getByText('로직 퍼즐')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /상세/ })).toHaveAttribute('href', '/game/sudoku')
    expect(screen.getByRole('link', { name: /플레이/ })).toHaveAttribute('href', '/play/sudoku')
  })
})
