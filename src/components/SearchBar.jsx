export default function SearchBar({ value, onChange }) {
  return (
    <input className="search-bar" type="search" placeholder="게임 검색…"
      value={value} onChange={e => onChange(e.target.value)} aria-label="게임 검색" />
  )
}
