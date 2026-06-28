import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameFrame from './GameFrame.jsx'

describe('GameFrame', () => {
  it('초기엔 about:blank, "게임 시작" 클릭 시 src 주입 + wake-lock 허용', async () => {
    render(<GameFrame src="games/sudoku/index.html" title="Sudoku" />)
    const iframe = screen.getByTitle('Sudoku')
    expect(iframe).toHaveAttribute('src', 'about:blank')
    expect(iframe.getAttribute('allow')).toContain('screen-wake-lock')
    await userEvent.click(screen.getByRole('button', { name: /게임 시작/ }))
    expect(screen.getByTitle('Sudoku')).toHaveAttribute('src', 'games/sudoku/index.html')
  })
})
