import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import GamesList from './GamesList.jsx'

describe('GamesList', () => {
  it('검색어로 게임을 필터한다', async () => {
    render(<MemoryRouter><GamesList /></MemoryRouter>)
    expect(screen.getByText('Sudoku')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('게임 검색'), 'hexa')
    expect(screen.queryByText('Sudoku')).not.toBeInTheDocument()
    expect(screen.getByText('Hexa Merge Base')).toBeInTheDocument()
  })
})
