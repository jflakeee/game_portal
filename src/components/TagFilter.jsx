export default function TagFilter({ tags, active, onSelect }) {
  return (
    <div className="tag-filter" role="group" aria-label="태그 필터">
      <button className={!active ? 'tag tag--active' : 'tag'} onClick={() => onSelect(null)}>전체</button>
      {tags.map(t => (
        <button key={t} className={active === t ? 'tag tag--active' : 'tag'}
          onClick={() => onSelect(t)}>{t}</button>
      ))}
    </div>
  )
}
