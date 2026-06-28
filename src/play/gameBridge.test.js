import { describe, it, expect } from 'vitest'
import { parseGameMessage } from './gameBridge.js'

describe('parseGameMessage', () => {
  it('유효한 score 메시지를 정규화한다', () => {
    expect(parseGameMessage({ type: 'score', value: 1500 })).toEqual({ type: 'score', value: 1500 })
  })
  it('gameover 메시지를 인식한다', () => {
    expect(parseGameMessage({ type: 'gameover' })).toEqual({ type: 'gameover' })
  })
  it('음수 점수/비숫자/알 수 없는 타입/잡음은 null', () => {
    expect(parseGameMessage({ type: 'score', value: -1 })).toBeNull()
    expect(parseGameMessage({ type: 'score', value: 'x' })).toBeNull()
    expect(parseGameMessage({ type: 'nope' })).toBeNull()
    expect(parseGameMessage('hello')).toBeNull()
    expect(parseGameMessage(null)).toBeNull()
  })
})
