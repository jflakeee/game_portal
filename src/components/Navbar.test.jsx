import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar.jsx'

describe('Navbar', () => {
  it('주요 네비 링크를 렌더한다', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '전체 게임' })).toHaveAttribute('href', '/games')
    expect(screen.getByRole('link', { name: '내 기록' })).toHaveAttribute('href', '/stats')
  })
})
