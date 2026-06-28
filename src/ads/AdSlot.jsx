const SIZES = {
  'persistent-banner': { width: '100%', height: '90px' }, // 728x90 / 320x50 반응형은 CSS에서
  'detail-rectangle': { width: '300px', height: '250px' },
}

export default function AdSlot({ variant = 'persistent-banner' }) {
  const size = SIZES[variant] ?? SIZES['persistent-banner']
  return (
    <aside
      aria-label="광고"
      className={`ad-slot ad-slot--${variant}`}
      style={{ ...size, display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: '#161922', border: '1px solid #262b38', color: '#5b6472', fontSize: 12 }}
    >
      광고
    </aside>
  )
}
