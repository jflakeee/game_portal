// Normalizes a postMessage payload from an embedded game iframe.
// Recognized: { type: 'score', value: <number >= 0> } | { type: 'gameover' }.
// Returns the normalized event, or null for anything unrecognized.
export function parseGameMessage(data) {
  if (!data || typeof data !== 'object') return null
  if (data.type === 'score' && typeof data.value === 'number' && data.value >= 0) {
    return { type: 'score', value: data.value }
  }
  if (data.type === 'gameover') return { type: 'gameover' }
  return null
}
