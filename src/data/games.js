const game = (slug, title, tagline, url, tags, thumbnail, featured = false,
  controls = '게임 화면의 안내에 따라 조작하세요.') => ({
  slug, title, tagline,
  description: `${tagline}. GitHub Pages에 배포된 게임을 로그인과 설치 없이 바로 즐겨보세요.`,
  tags, genre: tags[0], tech: 'GitHub Pages', thumbnail,
  screenshots: [thumbnail], playPath: url,
  controls, year: 2026, featured,
})

export const games = [
  game('hexa-merge-base', 'Hexa Merge Base', '육각 타일을 합쳐 큰 숫자를 만드는 머지 퍼즐', 'https://www.fungood.co.kr/hexa_merge_base/', ['퍼즐', '머지', '캐주얼'], 'thumbs/hexa-merge.png', true),
  game('hexa-merge-clone', 'Hexa Merge Clone', '같은 숫자의 육각 타일을 연결하는 퍼즐', 'https://jflakeee.github.io/hexa-merge-clone/', ['퍼즐', '머지'], 'thumbs/hexa-merge.png'),
  game('hexa-merge-web', 'Hexa Merge Web', '브라우저에서 가볍게 즐기는 헥사 머지', 'https://jflakeee.github.io/hexa_merge_web/', ['퍼즐', '머지'], 'thumbs/hexa-merge.png'),
  game('sudoku', 'Sudoku', '논리로 9×9 격자를 채우는 클래식 스도쿠', 'https://jflakeee.github.io/sudoku_clone/', ['퍼즐', '로직', '클래식'], 'thumbs/sudoku.png', true, '칸을 선택하고 숫자를 입력하세요.'),
  game('sudoku-league', 'Sudoku League', '스도쿠 문제에 도전하고 기록을 단축하는 로직 게임', 'https://jflakeee.github.io/sudoku_league/', ['퍼즐', '로직'], 'thumbs/sudoku.png'),
  game('minecraft-base', 'Minecraft Base', '블록 세상을 탐험하는 샌드박스 게임', 'https://jflakeee.github.io/minecraft_base/', ['샌드박스', '모험'], 'thumbs/hexa-merge.png', true),
  game('diablo', 'Diablo', '던전을 탐험하며 적을 물리치는 액션 RPG', 'https://jflakeee.github.io/diablo/', ['액션', 'RPG'], 'thumbs/number-drop.png'),
  game('number-drop', 'Number Drop', '숫자를 떨어뜨려 합치는 드롭 머지', 'https://jflakeee.github.io/number_drop/', ['캐주얼', '머지', '아케이드'], 'thumbs/number-drop.png', true),
  game('number-drop-base', 'Number Drop Base', '같은 숫자를 합쳐 더 큰 수를 만드는 퍼즐', 'https://jflakeee.github.io/number_drop_base/', ['캐주얼', '머지'], 'thumbs/number-drop.png'),
  game('number-drop-clone', 'Number Drop Clone', '연속 콤보를 만드는 숫자 드롭 변형', 'https://jflakeee.github.io/number_drop_clone/', ['캐주얼', '머지'], 'thumbs/number-drop.png'),
]

export function getGameBySlug(slug) { return games.find(g => g.slug === slug) }
export function getGamesByTag(tag) { return games.filter(g => g.tags.includes(tag)) }
export function allTags() { return [...new Set(games.flatMap(g => g.tags))] }
