export const games = [
  {
    slug: 'hexa-merge',
    title: 'Hexa Merge',
    tagline: '육각 블록을 합쳐 점수를 올리는 머지 퍼즐',
    description: '같은 숫자의 육각 타일을 인접 배치해 합치는 캐주얼 머지 퍼즐. 한 손으로 즐기는 직관적 조작.',
    tags: ['퍼즐', '머지', '캐주얼'],
    genre: '퍼즐',
    tech: 'Unity WebGL',
    thumbnail: 'thumbs/hexa-merge.png',
    screenshots: ['thumbs/hexa-merge.png'],
    playPath: 'games/hexa-merge/index.html',
    controls: '드래그하여 타일 배치, 같은 숫자를 합치세요.',
    year: 2026,
    featured: true,
  },
  {
    slug: 'sudoku',
    title: 'Sudoku',
    tagline: '클래식 스도쿠, 가볍게 즐기는 로직 퍼즐',
    description: '9x9 격자를 논리로 채우는 정통 스도쿠. PWA로 오프라인에서도 동작.',
    tags: ['퍼즐', '로직', '클래식'],
    genre: '퍼즐',
    tech: 'JavaScript PWA',
    thumbnail: 'thumbs/sudoku.png',
    screenshots: ['thumbs/sudoku.png'],
    playPath: 'games/sudoku/index.html',
    controls: '칸을 선택하고 숫자를 입력하세요.',
    year: 2026,
    featured: true,
  },
  {
    slug: 'number-drop',
    title: 'Number Drop',
    tagline: '숫자를 떨어뜨려 합치는 드롭 머지',
    description: '떨어지는 숫자 블록을 같은 값끼리 합쳐 더 큰 수를 만드는 캐주얼 아케이드.',
    tags: ['캐주얼', '머지', '아케이드'],
    genre: '캐주얼',
    tech: 'Vite Web',
    thumbnail: 'thumbs/number-drop.png',
    screenshots: ['thumbs/number-drop.png'],
    playPath: 'games/number-drop/index.html',
    controls: '좌우로 이동, 같은 숫자를 떨어뜨려 합치세요.',
    year: 2026,
    featured: false,
  },
]

export function getGameBySlug(slug) {
  return games.find(g => g.slug === slug)
}

export function getGamesByTag(tag) {
  return games.filter(g => g.tags.includes(tag))
}

export function allTags() {
  return [...new Set(games.flatMap(g => g.tags))]
}
