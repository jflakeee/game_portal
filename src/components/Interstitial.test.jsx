import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Interstitial from './Interstitial.jsx'

describe('Interstitial', () => {
  it('"광고" 라벨과 계속하기 버튼을 렌더하고 클릭 시 onContinue 호출', async () => {
    const onContinue = vi.fn()
    render(<Interstitial onContinue={onContinue} />)
    expect(screen.getByRole('dialog', { name: /광고/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /계속하기/ }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })
})
