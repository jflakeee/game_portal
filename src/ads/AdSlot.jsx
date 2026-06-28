import { useEffect, useId, useRef } from 'react'
import { isAdsEnabled } from './adConfig.js'
import { displayAd } from './gpt.js'

const SIZES = {
  'persistent-banner': { width: '100%', height: '90px' }, // 728x90 / 320x50 반응형은 CSS에서
  'detail-rectangle': { width: '300px', height: '250px' },
}

export default function AdSlot({ variant = 'persistent-banner' }) {
  const size = SIZES[variant] ?? SIZES['persistent-banner']
  const reactId = useId()
  const domId = `ad-${variant}-${reactId.replace(/:/g, '')}`
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (!isAdsEnabled()) return
    let active = true
    displayAd({ variant, domId }).then(cleanup => {
      if (active) cleanupRef.current = cleanup
      else cleanup()
    })
    return () => { active = false; cleanupRef.current?.() }
  }, [variant, domId])

  return (
    <aside
      aria-label="광고"
      className={`ad-slot ad-slot--${variant}`}
      style={{ ...size, display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: '#161922', border: '1px solid #262b38', color: '#5b6472', fontSize: 12 }}
    >
      {isAdsEnabled() ? <div id={domId} style={{ width: '100%', height: '100%' }} /> : '광고'}
    </aside>
  )
}
