import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdSlot from './AdSlot.jsx'

describe('AdSlot', () => {
  it('"광고" 라벨과 고정 크기를 렌더한다', () => {
    render(<AdSlot variant="persistent-banner" />)
    const slot = screen.getByRole('complementary', { name: /광고/ })
    expect(slot).toBeInTheDocument()
    expect(slot).toHaveStyle({ height: '90px' })
  })
})
