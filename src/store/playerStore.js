const KEYS = { recent: 'gp.recent', fav: 'gp.fav', best: 'gp.best' }
const MAX_RECENT = 10

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function recordPlay(slug) {
  const next = [slug, ...read(KEYS.recent, []).filter(s => s !== slug)].slice(0, MAX_RECENT)
  write(KEYS.recent, next)
}
export function getRecentlyPlayed() { return read(KEYS.recent, []) }

export function toggleFavorite(slug) {
  const cur = read(KEYS.fav, [])
  const next = cur.includes(slug) ? cur.filter(s => s !== slug) : [...cur, slug]
  write(KEYS.fav, next)
  return next.includes(slug)
}
export function isFavorite(slug) { return read(KEYS.fav, []).includes(slug) }
export function getFavorites() { return read(KEYS.fav, []) }

export function recordScore(slug, score) {
  const best = read(KEYS.best, {})
  if (score > (best[slug] ?? 0)) { best[slug] = score; write(KEYS.best, best) }
}
export function getBestScore(slug) { return read(KEYS.best, {})[slug] ?? 0 }
