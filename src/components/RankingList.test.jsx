import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RankingList from './RankingList.jsx'

const games = [
  { slug: 'a', title: 'A', genre: '퍼즐', tags: [] },
  { slug: 'b', title: 'B', genre: '캐주얼', tags: [] },
]

describe('RankingList', () => {
  it('순위 번호와 게임 제목을 렌더한다', () => {
    render(<MemoryRouter><RankingList games={games} /></MemoryRouter>)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /A/ })).toHaveAttribute('href', '/game/a')
  })
})
