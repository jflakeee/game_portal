// Lightweight GPT (googletag) loader + slot display.
// Fully no-ops when ads are disabled or the variant is unknown.
import { isAdsEnabled, adUnitPath, adSizes } from './adConfig.js'

let scriptPromise = null

function loadScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
  return scriptPromise
}

// Defines + displays a GPT slot into the element with id=domId.
// Returns a cleanup function that destroys the slot. No-op if disabled.
export async function displayAd({ variant, domId }) {
  const path = adUnitPath(variant)
  if (!isAdsEnabled() || !path) return () => {}
  await loadScript()
  const googletag = (window.googletag = window.googletag || { cmd: [] })
  let slot = null
  googletag.cmd.push(() => {
    slot = googletag.defineSlot(path, adSizes(variant), domId)
    if (!slot) return
    slot.addService(googletag.pubads())
    googletag.enableServices()
    googletag.display(domId)
  })
  return () => {
    if (slot) googletag.cmd.push(() => googletag.destroySlots([slot]))
  }
}
