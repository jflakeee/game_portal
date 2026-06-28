import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdSlot from './AdSlot.jsx'

describe('AdSlot', () => {
  it('AdSense 미승인(env 미설정) 시 광고 자리를 완전히 숨긴다', () => {
    const { container } = render(<AdSlot variant="persistent-banner" />)
    expect(container.firstChild).toBeNull()
    expect(screen.queryByLabelText('광고')).toBeNull()
  })
})
