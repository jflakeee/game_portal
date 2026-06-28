import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import About from './About.jsx'

describe('About', () => {
  it('광고 약속(모토)을 명문화해 보여준다', () => {
    render(<About />)
    expect(screen.getByText(/강제 재생 광고 금지/)).toBeInTheDocument()
    expect(screen.getByText(/예측 가능한 광고/)).toBeInTheDocument()
  })
})
